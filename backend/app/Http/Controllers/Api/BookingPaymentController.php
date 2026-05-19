<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Notification;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingPaymentController extends Controller
{
    use HandlesFileUploads;
    public function index(Request $request)
    {
        $query = BookingPayment::with(['booking.user', 'booking.productVariant.product', 'verifier']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'booking_id'            => 'required|exists:bookings,id',
            'payment_method'        => 'required|in:bkash,nagad,rocket,other',
            'transaction_reference' => 'required|string',
            'sender_number'         => 'nullable|string|max:20',
            'payment_screenshot'    => 'nullable|file|mimes:jpeg,png,webp,pdf|max:51200', // 50MB max
        ]);

        $booking = Booking::find($request->booking_id);

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'pending_payment') {
            return response()->json(['message' => 'Booking is not awaiting payment'], 422);
        }

        // CRITICAL FIX: Validate that booking has a fee to pay
        if (!$booking->booking_fee || $booking->booking_fee <= 0) {
            return response()->json(['message' => 'This booking does not require payment'], 422);
        }

        $screenshotPath = null;
        if ($request->hasFile('payment_screenshot')) {
            $screenshotPath = $this->storePublicFile($request->file('payment_screenshot'), 'payment-screenshots');
        }

        $payment = BookingPayment::create([
            'booking_id'            => $booking->id,
            'payment_method'        => $request->payment_method,
            'transaction_reference' => $request->transaction_reference,
            'sender_number'         => $request->sender_number,
            'payment_screenshot'    => $screenshotPath,
            'amount'                => $booking->booking_fee,
            'status'                => 'pending',
        ]);

        return response()->json($payment, 201);
    }

    public function approve(Request $request, BookingPayment $bookingPayment)
    {
        if ($bookingPayment->status !== 'pending') {
            return response()->json(['message' => 'Payment already processed'], 422);
        }

        DB::beginTransaction();
        try {
            $bookingPayment->update([
                'status' => 'verified',
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
            ]);

            $booking = $bookingPayment->booking;
            $booking->update([
                'status' => 'active',
                'expiry_date' => now()->addDays(7),
            ]);

            Notification::notifyUser(
                $request->user()->id,
                $booking->user_id,
                'Booking payment verified',
                "Your payment for booking #{$bookingPayment->booking_id} has been verified and your booking is now active.",
                'booking_payment',
                ['booking_id' => $booking->id]
            );

            // CRITICAL FIX: Stock was already reserved when booking was created
            // No need to decrement again - this was causing double-decrement bug

            DB::commit();
            return response()->json(['message' => 'Payment approved and booking activated']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to approve payment'], 500);
        }
    }

    public function reject(Request $request, BookingPayment $bookingPayment)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        if ($bookingPayment->status !== 'pending') {
            return response()->json(['message' => 'Payment already processed'], 422);
        }

        DB::beginTransaction();
        try {
            $bookingPayment->update([
                'status' => 'rejected',
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            $booking = $bookingPayment->booking;

            // CRITICAL FIX: Restore inventory when payment is rejected
            // Stock was reserved when booking was created
            $booking->productVariant->increment('quantity', $booking->quantity);

            $booking->update(['status' => 'cancelled']);

            Notification::notifyUser(
                $request->user()->id,
                $booking->user_id,
                'Booking payment rejected',
                "Your payment for booking #{$bookingPayment->booking_id} was rejected. Reason: {$request->reason}",
                'booking_payment',
                ['booking_id' => $booking->id, 'reason' => $request->reason]
            );

            DB::commit();
            return response()->json(['message' => 'Payment rejected and stock restored']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reject payment'], 500);
        }
    }
}
