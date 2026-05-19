<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Admins bypass all permission checks
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        if (!$user->hasPermissionTo($permission)) {
            return response()->json(['message' => 'You do not have permission to perform this action.'], 403);
        }

        return $next($request);
    }
}
