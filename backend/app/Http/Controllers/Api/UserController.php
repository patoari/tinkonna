<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles')->where('user_type', '!=', 'customer');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function customers(Request $request)
    {
        $query = User::with('roles')
            ->where('user_type', 'customer')
            ->withCount('salesTransactions')
            ->withSum('salesTransactions as total_spent', 'net_amount');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'nullable|email|unique:users,email',
            'phone'    => 'nullable|string|unique:users,phone',
            'password' => 'required|string|min:8',
            'role'     => 'required|string|exists:roles,name',
        ]);

        if (!$request->email && !$request->phone) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => ['email' => ['Email or phone number is required']],
            ], 422);
        }

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'phone'     => $request->phone,
            'password'  => Hash::make($request->password),
            'user_type' => $request->role,
        ]);

        $user->assignRole($request->role);

        return response()->json($user->load('roles'), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load('roles'));
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|unique:users,phone,' . $user->id,
            'role' => 'nullable|string|exists:roles,name',
        ]);

        $data = $request->only('name', 'email', 'phone');

        if ($request->role) {
            $user->syncRoles([$request->role]);
            $data['user_type'] = $request->role;
        }

        $user->update($data);

        return response()->json($user->load('roles'));
    }

    public function destroy(Request $request, User $user)
    {
        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}
