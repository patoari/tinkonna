<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\ProductVariant;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'productVariant.product', 'payment']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $bookings = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'booking_type' => 'required|in:free,paid',
            'quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Use pessimistic locking to prevent race conditions
            $variant = ProductVariant::with('product')->lockForUpdate()->find($request->product_variant_id);

            if (!$variant || $variant->quantity < $request->quantity) {
                DB::rollBack();
                return response()->json(['message' => 'Insufficient stock'], 422);
            }

            // Check for existing active booking
            $existingBooking = Booking::where('user_id', $request->user()->id)
                ->where('product_variant_id', $request->product_variant_id)
                ->whereIn('status', ['active', 'pending_payment'])
                ->first();

            if ($existingBooking) {
                DB::rollBack();
                return response()->json(['message' => 'You already have an active booking for this product'], 422);
            }

            // Validate quantity limits
            $maxQty = $request->booking_type === 'free' ? 1 : 3;
            if ($request->quantity > $maxQty) {
                DB::rollBack();
                return response()->json(['message' => "Maximum {$maxQty} units allowed for {$request->booking_type} booking"], 422);
            }

            $product = $variant->product;

            // For paid bookings, a known price is required (fixed selling_price or online_price)
            if ($request->booking_type === 'paid' && !$product->has_fixed_price && !$product->online_price) {
                DB::rollBack();
                return response()->json(['message' => 'Paid booking requires a product with an online price set. Please contact the shop.'], 422);
            }
            // Use selling_price for fixed-price products, online_price for variable-price products
            $productPrice = $product->has_fixed_price
                ? ($product->selling_price ?? 0)
                : ($product->online_price ?? 0);

            $bookingFee = $request->booking_type === 'paid'
                ? round($productPrice * 0.2, 2)
                : null;

            $status = $request->booking_type === 'free' ? 'active' : 'pending_payment';
            $expiryDate = $request->booking_type === 'free'
                ? now()->addHours(24)
                : null; // Set after payment verification for paid

            $booking = Booking::create([
                'user_id'            => $request->user()->id,
                'product_variant_id' => $request->product_variant_id,
                'quantity'           => $request->quantity,
                'booking_type'       => $request->booking_type,
                'booking_fee'        => $bookingFee,
                'product_price'      => $productPrice,
                'status'             => $status,
                'expiry_date'        => $expiryDate,
            ]);

            // CRITICAL FIX: Reserve inventory for BOTH free and paid bookings immediately
            // This prevents overselling while payment is being verified
            $variant->decrement('quantity', $request->quantity);

            DB::commit();

            Notification::notifyAdmins(
                $request->user()->id,
                'New booking submitted',
                "{$request->user()->name} placed a {$request->booking_type} booking for {$booking->quantity} x {$product->name} ({$variant->size}).",
                'booking',
                ['booking_id' => $booking->id]
            );

            return response()->json($booking->load(['productVariant.product', 'user']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Booking failed: ' . $e->getMessage()], 500);
        }
    }

    public function cancel(Request $request, Booking $booking)
    {
        if ($booking->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($booking->status, ['active', 'pending_payment'])) {
            return response()->json(['message' => 'Cannot cancel this booking'], 422);
        }

        DB::beginTransaction();
        try {
            // CRITICAL FIX: Restore inventory for BOTH active and pending_payment bookings
            // Since we now reserve stock immediately for both types
            $booking->productVariant->increment('quantity', $booking->quantity);

            $booking->update(['status' => 'cancelled']);

            DB::commit();
            return response()->json(['message' => 'Booking cancelled successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to cancel booking'], 500);
        }
    }

    public function customerBookings(Request $request)
    {
        // FIX: Add pagination to prevent performance issues with large datasets
        $bookings = Booking::with(['productVariant.product', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json($bookings);
    }
}
