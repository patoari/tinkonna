<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushSubscriptionController extends Controller
{
    public function vapidPublicKey()
    {
        return response()->json(['vapidPublicKey' => env('VAPID_PUBLIC_KEY')]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'endpoint' => 'required|string',
            'keys.p256dh' => 'nullable|string',
            'keys.auth' => 'nullable|string',
        ]);

        $user = $request->user();

        $sub = PushSubscription::updateOrCreate([
            'endpoint' => $data['endpoint'],
        ], [
            'user_id' => $user ? $user->id : null,
            'public_key' => $data['keys']['p256dh'] ?? null,
            'auth_token' => $data['keys']['auth'] ?? null,
            'raw' => $data,
        ]);

        return response()->json($sub, 201);
    }

    public function destroy(Request $request)
    {
        $endpoint = $request->input('endpoint');
        if (!$endpoint) return response()->json(['error' => 'endpoint required'], 422);
        PushSubscription::where('endpoint', $endpoint)->delete();
        return response()->json(['ok' => true]);
    }
}
