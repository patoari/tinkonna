<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = CartItem::with(['productVariant.product'])
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // CRITICAL FIX: Use pessimistic locking to prevent race conditions
        $variant = ProductVariant::lockForUpdate()->find($request->product_variant_id);

        if (!$variant || !$variant->is_active) {
            return response()->json(['message' => 'Product variant not available'], 422);
        }

        if ($variant->quantity < $request->quantity) {
            return response()->json(['message' => 'Insufficient stock'], 422);
        }

        $item = CartItem::updateOrCreate(
            ['user_id' => $request->user()->id, 'product_variant_id' => $request->product_variant_id],
            ['quantity' => $request->quantity]
        );

        return response()->json($item->load('productVariant.product'), 201);
    }

    public function update(Request $request, $id)
    {
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate(['quantity' => 'required|integer|min:1']);

        // CRITICAL FIX: Use pessimistic locking to prevent race conditions
        $variant = ProductVariant::lockForUpdate()->find($cartItem->product_variant_id);

        if (!$variant || !$variant->is_active) {
            return response()->json(['message' => 'Product variant not available'], 422);
        }

        if ($variant->quantity < $request->quantity) {
            return response()->json(['message' => "Only {$variant->quantity} in stock"], 422);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json($cartItem->load('productVariant.product'));
    }

    public function destroy(Request $request, $id)
    {
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }
}
