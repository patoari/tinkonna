<?php

namespace App\Services;

use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;

class PushService
{
    public static function sendNotification(PushSubscription $sub, array $payload = [])
    {
        // Try to use Minishlink/web-push if installed
        if (class_exists('\Minishlink\WebPush\WebPush')) {
            $auth = [
                'VAPID' => [
                    'subject' => env('VAPID_SUBJECT', 'mailto:admin@localhost'),
                    'publicKey' => env('VAPID_PUBLIC_KEY'),
                    'privateKey' => env('VAPID_PRIVATE_KEY'),
                ],
            ];

            $webPush = new \Minishlink\WebPush\WebPush($auth);
            $subscription = \Minishlink\WebPush\Subscription::create([
                'endpoint' => $sub->endpoint,
                'keys' => [
                    'p256dh' => $sub->public_key,
                    'auth' => $sub->auth_token,
                ],
            ]);

            return $webPush->sendOneNotification($subscription, json_encode($payload));
        }

        // Fallback: just log the payload
        Log::info('Push payload (no web-push lib): ' . json_encode(['sub' => $sub->endpoint, 'payload' => $payload]));
        return null;
    }
}
