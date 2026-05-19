<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use App\Models\PushSubscription;
use App\Models\User;
use App\Services\PushService;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'recipient_id',
        'subject',
        'message',
        'type',
        'data',
        'is_read',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public static function sendToRecipients(?int $senderId, array $recipientIds, string $subject, string $message, ?string $type = null, array $data = [])
    {
        $now = now();
        $notifications = [];

        foreach ($recipientIds as $recipientId) {
            $notifications[] = [
                'sender_id' => $senderId,
                'recipient_id' => $recipientId,
                'subject' => $subject,
                'message' => $message,
                'type' => $type,
                'data' => $data ? json_encode($data) : null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($notifications)) {
            static::insert($notifications);

            try {
                $subscriptions = PushSubscription::whereIn('user_id', $recipientIds)->get();
                foreach ($subscriptions as $sub) {
                    PushService::sendNotification($sub, [
                        'title' => $subject,
                        'body' => $message,
                        'data' => array_merge(['type' => $type], $data),
                        'icon' => '/logo192.png',
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Push send error: ' . $e->getMessage());
            }
        }
    }

    public static function notifyAdmins(?int $senderId, string $subject, string $message, ?string $type = null, array $data = [])
    {
        $adminIds = User::role('admin')->pluck('id')->toArray();
        static::sendToRecipients($senderId, $adminIds, $subject, $message, $type, $data);
    }

    public static function notifyUser(?int $senderId, int $recipientId, string $subject, string $message, ?string $type = null, array $data = [])
    {
        static::sendToRecipients($senderId, [$recipientId], $subject, $message, $type, $data);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
