<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OwnerTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = OwnerTransaction::with('user');

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->from_date) {
            $query->whereDate('transaction_date', '>=', $request->from_date);
        }
        if ($request->to_date) {
            $query->whereDate('transaction_date', '<=', $request->to_date);
        }

        // Search by recipient name
        if ($request->search) {
            $query->where('recipient_name', 'like', "%{$request->search}%");
        }

        return response()->json(
            $query->latest('transaction_date')
                ->paginate($request->per_page ?? 20)
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:withdrawal,loan,deposit,loan_repayment',
            'amount' => 'required|numeric|min:0.01',
            'payment_source' => 'required|in:shop_cash,online,bank',
            'recipient_name' => 'nullable|string|max:255',
            'recipient_phone' => 'nullable|string|max:20',
            'purpose' => 'nullable|string',
            'notes' => 'nullable|string',
            'transaction_date' => 'required|date',
            'expected_return_date' => 'nullable|date|after_or_equal:transaction_date',
            'related_transaction_id' => 'nullable|exists:owner_transactions,id',
        ]);

        $data = $request->all();
        $data['user_id'] = $request->user()->id;

        // Set default status based on type
        if ($request->type === 'loan') {
            $data['status'] = 'pending';
        } else {
            $data['status'] = 'completed';
        }

        $transaction = OwnerTransaction::create($data);

        // If this is a loan repayment, update the original loan status
        if ($request->type === 'loan_repayment' && $request->related_transaction_id) {
            $this->updateLoanStatus($request->related_transaction_id);
        }

        return response()->json($transaction->load('user'), 201);
    }

    public function show(OwnerTransaction $ownerTransaction)
    {
        return response()->json($ownerTransaction->load('user', 'relatedTransaction'));
    }

    public function update(Request $request, OwnerTransaction $ownerTransaction)
    {
        $request->validate([
            'type' => 'required|in:withdrawal,loan,deposit,loan_repayment',
            'amount' => 'required|numeric|min:0.01',
            'payment_source' => 'required|in:shop_cash,online,bank',
            'recipient_name' => 'nullable|string|max:255',
            'recipient_phone' => 'nullable|string|max:20',
            'purpose' => 'nullable|string',
            'notes' => 'nullable|string',
            'transaction_date' => 'required|date',
            'expected_return_date' => 'nullable|date|after_or_equal:transaction_date',
            'status' => 'nullable|in:pending,completed,partial,overdue',
        ]);

        $ownerTransaction->update($request->all());

        // Update loan status if needed
        if ($ownerTransaction->type === 'loan') {
            $this->updateLoanStatus($ownerTransaction->id);
        }

        return response()->json($ownerTransaction->fresh()->load('user'));
    }

    public function destroy(OwnerTransaction $ownerTransaction)
    {
        $ownerTransaction->delete();
        return response()->json(['message' => 'Transaction deleted']);
    }

    // Get summary statistics
    public function summary(Request $request)
    {
        $fromDate = $request->from_date ?? now()->startOfMonth();
        $toDate = $request->to_date ?? now()->endOfMonth();

        $withdrawals = OwnerTransaction::where('type', 'withdrawal')
            ->whereBetween('transaction_date', [$fromDate, $toDate])
            ->sum('amount');

        $deposits = OwnerTransaction::where('type', 'deposit')
            ->whereBetween('transaction_date', [$fromDate, $toDate])
            ->sum('amount');

        $loansGiven = OwnerTransaction::where('type', 'loan')
            ->whereBetween('transaction_date', [$fromDate, $toDate])
            ->sum('amount');

        $loansReceived = OwnerTransaction::where('type', 'loan_repayment')
            ->whereBetween('transaction_date', [$fromDate, $toDate])
            ->sum('amount');

        // Outstanding loans
        $outstandingLoans = DB::table('owner_transactions as loans')
            ->leftJoin('owner_transactions as repayments', function($join) {
                $join->on('loans.id', '=', 'repayments.related_transaction_id')
                     ->where('repayments.type', '=', 'loan_repayment');
            })
            ->where('loans.type', 'loan')
            ->select(
                DB::raw('SUM(loans.amount) as total_loans'),
                DB::raw('COALESCE(SUM(repayments.amount), 0) as total_repayments')
            )
            ->first();

        $totalOutstanding = ($outstandingLoans->total_loans ?? 0) - ($outstandingLoans->total_repayments ?? 0);

        // Overdue loans
        $overdueLoans = OwnerTransaction::where('type', 'loan')
            ->where('status', '!=', 'completed')
            ->where('expected_return_date', '<', now())
            ->count();

        return response()->json([
            'period' => [
                'from' => $fromDate,
                'to' => $toDate,
            ],
            'withdrawals' => $withdrawals,
            'deposits' => $deposits,
            'loans_given' => $loansGiven,
            'loans_received' => $loansReceived,
            'net_cash_flow' => $deposits + $loansReceived - $withdrawals - $loansGiven,
            'outstanding_loans' => $totalOutstanding,
            'overdue_loans_count' => $overdueLoans,
        ]);
    }

    // Get all active loans
    public function activeLoans()
    {
        $loans = OwnerTransaction::where('type', 'loan')
            ->where('status', '!=', 'completed')
            ->with('user')
            ->latest('transaction_date')
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'recipient_name' => $loan->recipient_name,
                    'recipient_phone' => $loan->recipient_phone,
                    'amount' => $loan->amount,
                    'remaining_amount' => $loan->getRemainingAmount(),
                    'transaction_date' => $loan->transaction_date,
                    'expected_return_date' => $loan->expected_return_date,
                    'status' => $loan->status,
                    'is_overdue' => $loan->isOverdue(),
                    'purpose' => $loan->purpose,
                ];
            });

        return response()->json($loans);
    }

    // Record loan repayment
    public function recordRepayment(Request $request, OwnerTransaction $loan)
    {
        if ($loan->type !== 'loan') {
            return response()->json(['message' => 'Not a loan transaction'], 400);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_source' => 'required|in:shop_cash,online,bank',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $remaining = $loan->getRemainingAmount();
        if ($request->amount > $remaining) {
            return response()->json([
                'message' => "Repayment amount cannot exceed remaining amount of {$remaining}"
            ], 400);
        }

        $repayment = OwnerTransaction::create([
            'user_id' => $request->user()->id,
            'type' => 'loan_repayment',
            'amount' => $request->amount,
            'payment_source' => $request->payment_source,
            'recipient_name' => $loan->recipient_name,
            'transaction_date' => $request->transaction_date,
            'notes' => $request->notes,
            'related_transaction_id' => $loan->id,
            'status' => 'completed',
        ]);

        $this->updateLoanStatus($loan->id);

        return response()->json($repayment, 201);
    }

    // Helper: Update loan status based on repayments
    private function updateLoanStatus($loanId)
    {
        $loan = OwnerTransaction::find($loanId);
        if (!$loan || $loan->type !== 'loan') {
            return;
        }

        $remaining = $loan->getRemainingAmount();

        if ($remaining <= 0) {
            $loan->update([
                'status' => 'completed',
                'actual_return_date' => now(),
            ]);
        } elseif ($remaining < $loan->amount) {
            $loan->update(['status' => 'partial']);
        } elseif ($loan->isOverdue()) {
            $loan->update(['status' => 'overdue']);
        }
    }
}
