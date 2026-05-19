<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\SalesTransaction;
use App\Models\OwnerTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function daily(Request $request)
    {
        $date = $request->date ?? today()->toDateString();

        return response()->json($this->buildReport($date, $date, 'daily'));
    }

    public function weekly(Request $request)
    {
        $date = $request->date ? Carbon::parse($request->date) : now();
        $startDate = $date->copy()->startOfWeek()->toDateString();
        $endDate = $date->copy()->endOfWeek()->toDateString();

        return response()->json($this->buildReport($startDate, $endDate, 'weekly'));
    }

    public function monthly(Request $request)
    {
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        return response()->json($this->buildReport($startDate, $endDate, 'monthly'));
    }

    public function yearly(Request $request)
    {
        $year = $request->year ?? now()->year;
        $startDate = Carbon::createFromDate($year, 1, 1)->startOfYear()->toDateString();
        $endDate   = Carbon::createFromDate($year, 12, 31)->endOfYear()->toDateString();

        $base = $this->buildReport($startDate, $endDate, 'yearly');

        // Build month-by-month breakdown
        $byMonth = [];
        for ($m = 1; $m <= 12; $m++) {
            $mStart = Carbon::createFromDate($year, $m, 1)->startOfMonth()->toDateString();
            $mEnd   = Carbon::createFromDate($year, $m, 1)->endOfMonth()->toDateString();

            $mTxns = \App\Models\SalesTransaction::with('items')
                ->whereBetween('transaction_date', [$mStart, $mEnd . ' 23:59:59'])
                ->where('status', 'completed')
                ->get();

            $mExpenses = \App\Models\Expense::whereBetween('expense_date', [$mStart, $mEnd])->get();

            $mOwnerTxns = \App\Models\OwnerTransaction::whereBetween('transaction_date', [$mStart, $mEnd])->get();

            $mRevenue   = $mTxns->sum('net_amount');
            $mCogs      = $mTxns->flatMap->items->sum(fn($i) => $i->buying_price * $i->quantity);
            $mExpTotal  = $mExpenses->sum('amount');
            $mOwnerWithdrawals = $mOwnerTxns->where('type', 'withdrawal')->sum('amount');
            $mOwnerDeposits = $mOwnerTxns->where('type', 'deposit')->sum('amount');
            $mNetProfit = ($mRevenue - $mCogs) - $mExpTotal;

            $byMonth[] = [
                'month'             => $m,
                'transaction_count' => $mTxns->count(),
                'revenue'           => $mRevenue,
                'cogs'              => $mCogs,
                'expenses'          => $mExpTotal,
                'owner_withdrawals' => $mOwnerWithdrawals,
                'owner_deposits'    => $mOwnerDeposits,
                'net_profit'        => $mNetProfit,
            ];
        }

        return response()->json(array_merge($base, [
            'year'     => $year,
            'by_month' => $byMonth,
        ]));
    }

    private function buildReport(string $startDate, string $endDate, string $type): array
    {
        $transactions = SalesTransaction::with(['items'])
            ->whereBetween('transaction_date', [$startDate, $endDate . ' 23:59:59'])
            ->where('status', 'completed')
            ->get();

        $expenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->get();

        // Get owner transactions
        $ownerTransactions = OwnerTransaction::whereBetween('transaction_date', [$startDate, $endDate])->get();

        $ownerWithdrawals = $ownerTransactions->where('type', 'withdrawal')->sum('amount');
        $ownerDeposits = $ownerTransactions->where('type', 'deposit')->sum('amount');
        $loansGiven = $ownerTransactions->where('type', 'loan')->sum('amount');
        $loansReceived = $ownerTransactions->where('type', 'loan_repayment')->sum('amount');

        // Get verified online orders for this period
        $periodOnlineOrders = \App\Models\PurchaseOrder::where('payment_status', 'verified')
            ->whereBetween('created_at', [$startDate, $endDate . ' 23:59:59'])
            ->sum('total_amount');

        $totalRevenue = $transactions->sum('net_amount') + $periodOnlineOrders;
        $totalCogs = $transactions->flatMap->items->sum(fn($i) => $i->buying_price * $i->quantity);
        $totalExpenses = $expenses->sum('amount');
        $grossProfit = $totalRevenue - $totalCogs;
        $netProfit = $grossProfit - $totalExpenses;

        // Cash on hand = cumulative all-time revenue minus all-time expenses up to the end of this period
        // Separated into Shop Cash, Online Cash, and Bank by payment_source

        // Shop cash (physical cash in shop) - only shop_cash transactions
        $shopRevenue = SalesTransaction::where('status', 'completed')
            ->where('payment_source', 'shop_cash')
            ->where('transaction_date', '<=', $endDate . ' 23:59:59')
            ->sum('net_amount');

        $shopExpenses = Expense::where('payment_source', 'shop_cash')
            ->where('expense_date', '<=', $endDate)
            ->sum('amount');

        $shopOwnerWithdrawals = OwnerTransaction::where('type', 'withdrawal')
            ->where('payment_source', 'shop_cash')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $shopOwnerDeposits = OwnerTransaction::where('type', 'deposit')
            ->where('payment_source', 'shop_cash')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $shopLoansGiven = OwnerTransaction::where('type', 'loan')
            ->where('payment_source', 'shop_cash')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $shopLoansReceived = OwnerTransaction::where('type', 'loan_repayment')
            ->where('payment_source', 'shop_cash')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');

        $shopCash = $shopRevenue - $shopExpenses
                  - $shopOwnerWithdrawals + $shopOwnerDeposits
                  - $shopLoansGiven + $shopLoansReceived;

        // Online cash (digital payments) - online transactions + verified online orders
        $onlineRevenue = SalesTransaction::where('status', 'completed')
            ->where('payment_source', 'online')
            ->where('transaction_date', '<=', $endDate . ' 23:59:59')
            ->sum('net_amount');

        $verifiedOnlineOrders = \App\Models\PurchaseOrder::where('payment_status', 'verified')
            ->where('created_at', '<=', $endDate . ' 23:59:59')
            ->sum('total_amount');

        $onlineExpenses = Expense::where('payment_source', 'online')
            ->where('expense_date', '<=', $endDate)
            ->sum('amount');

        $onlineOwnerWithdrawals = OwnerTransaction::where('type', 'withdrawal')
            ->where('payment_source', 'online')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $onlineOwnerDeposits = OwnerTransaction::where('type', 'deposit')
            ->where('payment_source', 'online')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $onlineLoansGiven = OwnerTransaction::where('type', 'loan')
            ->where('payment_source', 'online')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $onlineLoansReceived = OwnerTransaction::where('type', 'loan_repayment')
            ->where('payment_source', 'online')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');

        $onlineCash = $onlineRevenue + $verifiedOnlineOrders - $onlineExpenses
                    - $onlineOwnerWithdrawals + $onlineOwnerDeposits
                    - $onlineLoansGiven + $onlineLoansReceived;

        // Bank cash (bank transfers)
        $bankRevenue = SalesTransaction::where('status', 'completed')
            ->where('payment_source', 'bank')
            ->where('transaction_date', '<=', $endDate . ' 23:59:59')
            ->sum('net_amount');

        $bankExpenses = Expense::where('payment_source', 'bank')
            ->where('expense_date', '<=', $endDate)
            ->sum('amount');

        $bankOwnerWithdrawals = OwnerTransaction::where('type', 'withdrawal')
            ->where('payment_source', 'bank')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $bankOwnerDeposits = OwnerTransaction::where('type', 'deposit')
            ->where('payment_source', 'bank')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $bankLoansGiven = OwnerTransaction::where('type', 'loan')
            ->where('payment_source', 'bank')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');
        $bankLoansReceived = OwnerTransaction::where('type', 'loan_repayment')
            ->where('payment_source', 'bank')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');

        $bankCash = $bankRevenue - $bankExpenses
                  - $bankOwnerWithdrawals + $bankOwnerDeposits
                  - $bankLoansGiven + $bankLoansReceived;

        // Net cash (total of all three)
        $netCash = $shopCash + $onlineCash + $bankCash;

        // Group by date
        $byDate = [];
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($current->lte($end)) {
            $dateStr = $current->toDateString();
            $dayTransactions = $transactions->filter(fn($t) => Carbon::parse($t->transaction_date)->toDateString() === $dateStr);
            $dayExpenses = $expenses->filter(fn($e) => $e->expense_date->toDateString() === $dateStr);
            $dayOwnerTransactions = $ownerTransactions->filter(fn($o) => $o->transaction_date->toDateString() === $dateStr);

            // Get online orders for this day
            $dayOnlineOrders = \App\Models\PurchaseOrder::where('payment_status', 'verified')
                ->whereDate('created_at', $dateStr)
                ->sum('total_amount');

            $byDate[] = [
                'date' => $dateStr,
                'transaction_count' => $dayTransactions->count(),
                'revenue' => $dayTransactions->sum('net_amount') + $dayOnlineOrders,
                'online_orders_revenue' => $dayOnlineOrders,
                'cogs' => $dayTransactions->flatMap->items->sum(fn($i) => $i->buying_price * $i->quantity),
                'expenses' => $dayExpenses->sum('amount'),
                'owner_withdrawals' => $dayOwnerTransactions->where('type', 'withdrawal')->sum('amount'),
                'owner_deposits' => $dayOwnerTransactions->where('type', 'deposit')->sum('amount'),
                'transactions' => $dayTransactions->values(),
            ];

            $current->addDay();
        }

        // Expense breakdown by category
        $expenseByCategory = $expenses->groupBy('category')->map(function ($group) {
            return [
                'category' => $group->first()->category_name,
                'total' => $group->sum('amount'),
                'count' => $group->count(),
            ];
        })->values();

        // Top selling products
        $allItems = $transactions->flatMap->items;
        $topProducts = $allItems->groupBy('product_name')->map(function ($items, $name) {
            return [
                'product_name' => $name,
                'total_quantity' => $items->sum('quantity'),
                'total_revenue' => $items->sum('subtotal'),
            ];
        })->sortByDesc('total_revenue')->take(10)->values();

        return [
            'type' => $type,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'online_orders_revenue' => $periodOnlineOrders,
                'total_cogs' => $totalCogs,
                'gross_profit' => $grossProfit,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
                'owner_withdrawals' => $ownerWithdrawals,
                'owner_deposits' => $ownerDeposits,
                'loans_given' => $loansGiven,
                'loans_received' => $loansReceived,
                'net_owner_impact' => ($ownerDeposits + $loansReceived) - ($ownerWithdrawals + $loansGiven),
                'shop_cash' => $shopCash,
                'online_cash' => $onlineCash,
                'bank_cash' => $bankCash,
                'net_cash' => $netCash,
                'transaction_count' => $transactions->count(),
            ],
            'by_date' => $byDate,
            'expense_by_category' => $expenseByCategory,
            'top_products' => $topProducts,
            'owner_transactions' => $ownerTransactions->map(function ($txn) {
                return [
                    'id' => $txn->id,
                    'type' => $txn->type,
                    'amount' => $txn->amount,
                    'payment_source' => $txn->payment_source,
                    'recipient_name' => $txn->recipient_name,
                    'purpose' => $txn->purpose,
                    'transaction_date' => $txn->transaction_date,
                    'notes' => $txn->notes,
                ];
            })->values(),
        ];
    }

    public function cashFlow(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        return response()->json($this->buildReport($request->start_date, $request->end_date, 'custom'));
    }
}
