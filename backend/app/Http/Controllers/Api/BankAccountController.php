<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index()
    {
        return response()->json(BankAccount::where('is_active', true)->get());
    }

    public function publicAccounts()
    {
        return response()->json(
            BankAccount::where('is_active', true)
                ->select('id', 'bank_name', 'account_name', 'account_number', 'branch')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string',
            'account_name' => 'required|string',
            'account_number' => 'required|string',
            'branch' => 'nullable|string',
        ]);

        $account = BankAccount::create($request->only('bank_name', 'account_name', 'account_number', 'branch'));

        return response()->json($account, 201);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $request->validate([
            'bank_name' => 'required|string',
            'account_name' => 'required|string',
            'account_number' => 'required|string',
            'branch' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $bankAccount->update($request->only('bank_name', 'account_name', 'account_number', 'branch', 'is_active'));

        return response()->json($bankAccount);
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();
        return response()->json(['message' => 'Bank account removed']);
    }
}
