<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('user');

        if ($request->date) {
            $query->whereDate('expense_date', $request->date);
        }

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        $expenses = $query->latest('expense_date')->paginate($request->per_page ?? 20);

        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|in:staff_salary,breakfast,lunch,dinner,utility_bills,shipping_cost,other',
            'category_other' => 'required_if:category,other|nullable|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_source' => 'required|in:shop_cash,online,bank',
            'description' => 'nullable|string',
            'expense_date' => 'required|date',
        ]);

        $expense = Expense::create([
            'user_id' => $request->user()->id,
            'category' => $request->category,
            'category_other' => $request->category === 'other' ? $request->category_other : null,
            'amount' => $request->amount,
            'payment_source' => $request->payment_source,
            'description' => $request->description,
            'expense_date' => $request->expense_date,
        ]);

        return response()->json($expense->load('user'), 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense->load('user'));
    }

    public function update(Request $request, Expense $expense)
    {
        $request->validate([
            'category' => 'required|in:staff_salary,breakfast,lunch,dinner,utility_bills,shipping_cost,other',
            'category_other' => 'required_if:category,other|nullable|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_source' => 'required|in:shop_cash,online,bank',
            'description' => 'nullable|string',
            'expense_date' => 'required|date',
        ]);

        $expense->update([
            'category' => $request->category,
            'category_other' => $request->category === 'other' ? $request->category_other : null,
            'amount' => $request->amount,
            'payment_source' => $request->payment_source,
            'description' => $request->description,
            'expense_date' => $request->expense_date,
        ]);

        return response()->json($expense->fresh()->load('user'));
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(['message' => 'Expense deleted successfully']);
    }
}
