<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!$request->email && !$request->phone) {
            return response()->json(['message' => 'Email or phone is required'], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'user_type' => 'customer',
        ]);

        // Ensure customer role exists
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $user->assignRole('customer');
        $user->customerProfile()->create();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('roles'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->login)
            ->orWhere('phone', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('roles', 'roles.permissions'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('roles', 'roles.permissions', 'customerProfile'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|unique:users,phone,' . $user->id,
        ]);

        $user->update($request->only('name', 'email', 'phone'));

        return response()->json($user->fresh());
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function uploadProfileAvatar(Request $request)
    {
        $request->validate([
            'profile_avatar' => 'required|image|mimes:jpeg,png,gif,webp|max:5120',
        ]);

        $user = $request->user();

        // Delete old avatar if it exists
        if ($user->profile_avatar_url) {
            $oldPath = str_replace('/storage/', '', $user->profile_avatar_url);
            if (file_exists(storage_path('app/public/' . $oldPath))) {
                unlink(storage_path('app/public/' . $oldPath));
            }
        }

        // Store new avatar
        $path = $request->file('profile_avatar')->store('avatars', 'public');
        $url = Storage::disk('public')->url($path);

        $user->update(['profile_avatar_url' => $url]);

        return response()->json($user->fresh());
    }

    public function uploadCoverImage(Request $request)
    {
        $request->validate([
            'cover_image' => 'required|image|mimes:jpeg,png,gif,webp|max:5120',
        ]);

        $user = $request->user();

        // Delete old cover if it exists
        if ($user->cover_image_url) {
            $oldPath = str_replace('/storage/', '', $user->cover_image_url);
            if (file_exists(storage_path('app/public/' . $oldPath))) {
                unlink(storage_path('app/public/' . $oldPath));
            }
        }

        // Store new cover
        $path = $request->file('cover_image')->store('covers', 'public');
        $url = Storage::disk('public')->url($path);

        $user->update(['cover_image_url' => $url]);

        return response()->json($user->fresh());
    }
}
