<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use App\Models\CartItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\ProductVariant;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    use HandlesFileUploads;

    /**
     * Place a new order from the customer's cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'delivery_name'       => 'required|string|max:255',
            'delivery_phone'      => 'required|string|max:20',
            'delivery_address'    => 'required|string|max:500',
            'delivery_city'       => 'required|string|max:100',
            'delivery_district'   => 'nullable|string|max:100',
            'delivery_notes'      => 'nullable|string|max:500',
            'payment_method'      => 'required|in:bkash,nagad,rocket,other',
            'transaction_reference' => 'required|string|max:100|unique:purchase_orders,transaction_reference',
            'sender_number'       => 'required|string|max:20',
            'payment_screenshot'  => 'nullable|file|mimes:jpeg,png,webp|max:51200', // 50MB max
            'amount'              => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        // Load cart items
        $cartItems = CartItem::with(['productVariant.product'])
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 422);
        }

        // Validate stock for all items with pessimistic locking
        DB::beginTransaction();
        try {
            foreach ($cartItems as $item) {
                $variant = ProductVariant::lockForUpdate()->find($item->product_variant_id);

                if (!$variant || !$variant->is_active) {
                    DB::rollBack();
                    return response()->json(['message' => "Product variant is no longer available"], 422);
                }
                if ($variant->quantity < $item->quantity) {
                    $productName = $variant->product->name ?? 'A product';
                    DB::rollBack();
                    return response()->json([
                        'message' => "Insufficient stock for {$productName} (Size: {$variant->size}). Only {$variant->quantity} left."
                    ], 422);
                }
            }

            // Calculate total
            $total = $cartItems->sum(function ($item) {
                $product = $item->productVariant->product;
                // Use online_price for variable-price products, selling_price for fixed
                $price = $product->has_fixed_price
                    ? ($product->selling_price ?? 0)
                    : ($product->online_price ?? 0);
                return $price * $item->quantity;
            });

            // CRITICAL FIX: Validate submitted amount matches calculated total
            if (abs($request->amount - $total) > 0.01) {
                DB::rollBack();
                return response()->json([
                    'message' => "Payment amount mismatch. Expected: {$total}, Received: {$request->amount}"
                ], 422);
            }

            // Handle screenshot upload
            $screenshotPath = null;
            if ($request->hasFile('payment_screenshot')) {
                $screenshotPath = $this->storePublicFile($request->file('payment_screenshot'), 'order-screenshots');
            }

            // Create order
            $order = PurchaseOrder::create([
                'user_id'               => $user->id,
                'delivery_name'         => $request->delivery_name,
                'delivery_phone'        => $request->delivery_phone,
                'delivery_address'      => $request->delivery_address,
                'delivery_city'         => $request->delivery_city,
                'delivery_district'     => $request->delivery_district,
                'delivery_notes'        => $request->delivery_notes,
                'total_amount'          => $total,
                'payment_method'        => $request->payment_method,
                'transaction_reference' => $request->transaction_reference,
                'sender_number'         => $request->sender_number,
                'payment_screenshot'    => $screenshotPath,
                'payment_status'        => 'pending',
                'status'                => 'payment_submitted',
            ]);

            // Create order items and reserve stock
            foreach ($cartItems as $item) {
                $variant = $item->productVariant;
                $product = $variant->product;

                PurchaseOrderItem::create([
                    'purchase_order_id'  => $order->id,
                    'product_variant_id' => $variant->id,
                    'product_name'       => $product->name,
                    'size'               => $variant->size,
                    'quantity'           => $item->quantity,
                    'unit_price'         => $product->has_fixed_price
                        ? ($product->selling_price ?? 0)
                        : ($product->online_price ?? 0),
                    'subtotal'           => ($product->has_fixed_price
                        ? ($product->selling_price ?? 0)
                        : ($product->online_price ?? 0)) * $item->quantity,
                    'product_image_url'  => $product->image_url,
                ]);

                // Reserve stock
                $variant->decrement('quantity', $item->quantity);
            }

            // Clear cart
            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            Notification::notifyAdmins(
                $user->id,
                'New order placed',
                "{$user->name} placed a new order #{$order->id} totaling {$order->total_amount}.",
                'order',
                ['order_id' => $order->id]
            );

            return response()->json($order->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to place order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * List orders for the authenticated customer.
     */
    public function customerOrders(Request $request)
    {
        $orders = PurchaseOrder::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json($orders);
    }

    /**
     * Admin: list all orders.
     */
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['user', 'items', 'verifier']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    /**
     * Admin: verify payment and confirm order.
     */
    public function verifyPayment(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->payment_status !== 'pending') {
            return response()->json(['message' => 'Payment already processed'], 422);
        }

        $purchaseOrder->update([
            'payment_status' => 'verified',
            'status'         => 'confirmed',
            'verified_by'    => $request->user()->id,
            'verified_at'    => now(),
        ]);

        Notification::notifyUser(
            $request->user()->id,
            $purchaseOrder->user_id,
            'Order payment verified',
            "Your payment for order #{$purchaseOrder->id} has been verified and your order is confirmed.",
            'order_payment',
            ['order_id' => $purchaseOrder->id]
        );

        return response()->json(['message' => 'Payment verified and order confirmed']);
    }

    /**
     * Admin: reject payment.
     */
    public function rejectPayment(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate(['reason' => 'required|string']);

        if ($purchaseOrder->payment_status !== 'pending') {
            return response()->json(['message' => 'Payment already processed'], 422);
        }

        DB::beginTransaction();
        try {
            $purchaseOrder->update([
                'payment_status'   => 'rejected',
                'status'           => 'cancelled',
                'verified_by'      => $request->user()->id,
                'verified_at'      => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Restore stock
            foreach ($purchaseOrder->items as $item) {
                ProductVariant::where('id', $item->product_variant_id)
                    ->increment('quantity', $item->quantity);
            }

            DB::commit();

            Notification::notifyUser(
                $request->user()->id,
                $purchaseOrder->user_id,
                'Order payment rejected',
                "Your payment for order #{$purchaseOrder->id} was rejected. Reason: {$request->reason}",
                'order_payment',
                ['order_id' => $purchaseOrder->id, 'reason' => $request->reason]
            );
            return response()->json(['message' => 'Payment rejected and stock restored']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reject payment'], 500);
        }
    }

    /**
     * Admin: update order status.
     */
    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'status' => 'required|in:confirmed,processing,shipped,delivered,cancelled',
        ]);

        $newStatus = $request->status;
        $purchaseOrder->update(['status' => $newStatus]);

        if (in_array($newStatus, ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], true)) {
            $subjects = [
                'confirmed' => 'Order confirmed',
                'processing' => 'Order processing',
                'shipped' => 'Order shipped',
                'delivered' => 'Order delivered',
                'cancelled' => 'Order cancelled',
            ];

            $messages = [
                'confirmed' => "Your order #{$purchaseOrder->id} has been confirmed and is being prepared.",
                'processing' => "Your order #{$purchaseOrder->id} is now processing and will ship soon.",
                'shipped' => "Your order #{$purchaseOrder->id} has been shipped and is on the way.",
                'delivered' => "Your order #{$purchaseOrder->id} has been delivered. Thank you for shopping with us.",
                'cancelled' => "Your order #{$purchaseOrder->id} has been cancelled. Please contact support if you need help.",
            ];

            Notification::notifyUser(
                $request->user()->id,
                $purchaseOrder->user_id,
                $subjects[$newStatus] ?? 'Order update',
                $messages[$newStatus] ?? "Your order #{$purchaseOrder->id} status changed to {$newStatus}.",
                'order_status',
                ['order_id' => $purchaseOrder->id, 'status' => $newStatus]
            );
        }

        return response()->json(['message' => 'Order status updated', 'order' => $purchaseOrder]);
    }

    /**
     * Customer: place an online order directly from an active booking.
     * If the booking was paid, the booking fee is deducted from the total.
     */
    public function storeFromBooking(Request $request)
    {
        $request->validate([
            'booking_id'            => 'required|exists:bookings,id',
            'delivery_name'         => 'required|string|max:255',
            'delivery_phone'        => 'required|string|max:20',
            'delivery_address'      => 'required|string|max:500',
            'delivery_city'         => 'required|string|max:100',
            'delivery_district'     => 'nullable|string|max:100',
            'delivery_notes'        => 'nullable|string|max:500',
            'payment_method'        => 'required|in:bkash,nagad,rocket,other',
            'transaction_reference' => 'required|string|max:100|unique:purchase_orders,transaction_reference',
            'sender_number'         => 'required|string|max:20',
            'payment_screenshot'    => 'nullable|file|mimes:jpeg,png,webp|max:51200', // 50MB max
        ]);

        $user    = $request->user();
        $booking = \App\Models\Booking::with(['productVariant.product'])->find($request->booking_id);

        // Ownership check
        if ($booking->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only active bookings can be converted to orders
        if ($booking->status !== 'active') {
            return response()->json(['message' => 'Only active bookings can be purchased online'], 422);
        }

        $variant = $booking->productVariant;
        $product = $variant->product;

        // Determine base price
        $basePrice = $product->has_fixed_price
            ? (float) ($product->selling_price ?? 0)
            : (float) ($product->online_price ?? 0);

        if ($basePrice <= 0) {
            return response()->json(['message' => 'This product does not have an online price set'], 422);
        }

        // Deduct booking fee if it was a paid booking
        $bookingFeeDeduction = ($booking->booking_type === 'paid' && $booking->booking_fee > 0)
            ? (float) $booking->booking_fee
            : 0;

        $unitPrice = max(0, $basePrice - $bookingFeeDeduction);
        $total     = $unitPrice * $booking->quantity;

        $screenshotPath = null;
        if ($request->hasFile('payment_screenshot')) {
            $screenshotPath = $this->storePublicFile($request->file('payment_screenshot'), 'order-screenshots');
        }

        DB::beginTransaction();
        try {
            $order = PurchaseOrder::create([
                'user_id'               => $user->id,
                'delivery_name'         => $request->delivery_name,
                'delivery_phone'        => $request->delivery_phone,
                'delivery_address'      => $request->delivery_address,
                'delivery_city'         => $request->delivery_city,
                'delivery_district'     => $request->delivery_district,
                'delivery_notes'        => $request->delivery_notes,
                'total_amount'          => $total,
                'payment_method'        => $request->payment_method,
                'transaction_reference' => $request->transaction_reference,
                'sender_number'         => $request->sender_number,
                'payment_screenshot'    => $screenshotPath,
                'payment_status'        => 'pending',
                'status'                => 'payment_submitted',
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id'  => $order->id,
                'product_variant_id' => $variant->id,
                'product_name'       => $product->name,
                'size'               => $variant->size,
                'quantity'           => $booking->quantity,
                'unit_price'         => $unitPrice,
                'subtotal'           => $total,
                'product_image_url'  => $product->image_url,
            ]);

            // Mark booking as completed — stock was already reserved when booking was activated
            $booking->update(['status' => 'completed']);

            DB::commit();

            Notification::notifyAdmins(
                $user->id,
                'Order created from booking',
                "{$user->name} converted booking #{$booking->id} into order #{$order->id}.",
                'order',
                ['order_id' => $order->id, 'booking_id' => $booking->id]
            );

            return response()->json([
                'order'               => $order->load('items'),
                'booking_fee_applied' => $bookingFeeDeduction,
                'original_price'      => $basePrice,
                'final_price'         => $unitPrice,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to place order: ' . $e->getMessage()], 500);
        }
    }
}
