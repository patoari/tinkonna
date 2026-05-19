<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MobileBankingAccount;
use Illuminate\Http\Request;

class MobileBankingController extends Controller
{
    public function index()
    {
        return response()->json(MobileBankingAccount::where('is_active', true)->get());
    }

    public function publicAccounts()
    {
        return response()->json(
            MobileBankingAccount::where('is_active', true)
                ->select('id', 'provider', 'account_name', 'account_number')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'provider' => 'required|string',
            'account_name' => 'required|string',
            'account_number' => 'required|string',
        ]);

        $account = MobileBankingAccount::create($request->only('provider', 'account_name', 'account_number'));

        return response()->json($account, 201);
    }

    public function update(Request $request, MobileBankingAccount $mobileBankingAccount)
    {
        $request->validate([
            'provider'       => 'required|string',
            'account_name'   => 'required|string',
            'account_number' => 'required|string',
            'is_active'      => 'boolean',
        ]);

        $mobileBankingAccount->update($request->only('provider', 'account_name', 'account_number', 'is_active'));

        return response()->json($mobileBankingAccount);
    }

    public function destroy(MobileBankingAccount $mobileBankingAccount)
    {
        $mobileBankingAccount->delete();
        return response()->json(['message' => 'Account removed']);
    }
}
