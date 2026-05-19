<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::with(['sender'])
            ->where('recipient_id', $request->user()->id);

        if ($request->has('unread')) {
            $query->where('is_read', false);
        }

        $notifications = $query->latest()->paginate($request->per_page ?? 20);

        $unreadCount = Notification::where('recipient_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        $pagination = $notifications->toArray();

        return response()->json([
            'data' => $pagination['data'] ?? $notifications->items(),
            'meta' => [
                'current_page' => $pagination['current_page'] ?? $notifications->currentPage(),
                'last_page' => $pagination['last_page'] ?? $notifications->lastPage(),
                'per_page' => $pagination['per_page'] ?? $notifications->perPage(),
                'total' => $pagination['total'] ?? $notifications->total(),
            ],
            'unread_count' => $unreadCount,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'recipient_id' => 'nullable|exists:users,id',
            'target_role' => 'nullable|in:admin,customer',
        ]);

        $recipientIds = [];

        if ($request->recipient_id) {
            $recipientIds[] = $request->recipient_id;
        } elseif ($request->target_role === 'admin') {
            $recipientIds = User::role('admin')->pluck('id')->toArray();
        } elseif ($request->target_role === 'customer') {
            $recipientIds = User::role('customer')->pluck('id')->toArray();
        }

        if (empty($recipientIds)) {
            return response()->json(['message' => 'Please specify a recipient or target role'], 422);
        }

        Notification::sendToRecipients(
            $request->user()->id,
            $recipientIds,
            $request->subject,
            $request->message,
            'message',
            []
        );

        return response()->json(['message' => 'Notification sent successfully']);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->recipient_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('recipient_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
