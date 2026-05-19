<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\SalesTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $query = SalesTransaction::with(['items.productVariant.product', 'cashier', 'customer']);

        if ($request->date) {
            $query->whereDate('transaction_date', $request->date);
        }

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date . ' 23:59:59']);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $transactions = $query->latest('transaction_date')->paginate($request->per_page ?? 20);

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'payment_method' => 'nullable|in:cash,mobile_banking,card,other',
            'payment_source' => 'required|in:shop_cash,online,bank',
            'payment_reference' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'customer_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $variant = ProductVariant::with('product')->lockForUpdate()->find($item['product_variant_id']);

                if (!$variant) {
                    DB::rollBack();
                    return response()->json(['message' => 'Product variant not found'], 404);
                }

                if ($variant->quantity < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Insufficient stock for {$variant->product->name} (Size: {$variant->size}). Available: {$variant->quantity}",
                    ], 422);
                }

                // CRITICAL FIX: Validate unit price matches product price (with 1% tolerance for rounding)
                $expectedPrice = $variant->product->has_fixed_price
                    ? ($variant->product->selling_price ?? 0)
                    : ($variant->product->selling_price ?? 0);

                $priceDifference = abs($item['unit_price'] - $expectedPrice);
                $tolerance = $expectedPrice * 0.01; // 1% tolerance

                if ($priceDifference > $tolerance && $expectedPrice > 0) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Price mismatch for {$variant->product->name}. Expected: {$expectedPrice}, Received: {$item['unit_price']}"
                    ], 422);
                }

                $subtotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'product_name_bn' => $variant->product->name_bn,
                    'size' => $variant->size,
                    'quantity' => $item['quantity'],
                    'buying_price' => $variant->product->buying_price,
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ];
            }

            $discountAmount = $request->discount_amount ?? 0;
            $netAmount = $totalAmount - $discountAmount;

            $transaction = SalesTransaction::create([
                'user_id' => $request->user()->id,
                'customer_id' => $request->customer_id,
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount,
                'net_amount' => $netAmount,
                'payment_method' => $request->payment_method ?? 'cash',
                'payment_source' => $request->payment_source,
                'payment_reference' => $request->payment_reference,
                'status' => 'completed',
                'notes' => $request->notes,
            ]);

            $transaction->items()->createMany($itemsData);

            // Reduce inventory
            foreach ($request->items as $item) {
                ProductVariant::where('id', $item['product_variant_id'])
                    ->decrement('quantity', $item['quantity']);
            }

            DB::commit();

            $transaction->load(['items.productVariant.product', 'cashier']);

            // Get available sizes for sold products
            $availableSizes = $this->getAvailableSizesAfterSale($transaction);

            return response()->json([
                'transaction' => $transaction,
                'available_sizes' => $availableSizes,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Transaction failed: ' . $e->getMessage()], 500);
        }
    }

    public function show(SalesTransaction $salesTransaction)
    {
        return response()->json($salesTransaction->load(['items.productVariant.product', 'cashier', 'customer']));
    }

    private function getAvailableSizesAfterSale(SalesTransaction $transaction): array
    {
        $result = [];
        $processedProducts = [];

        foreach ($transaction->items as $item) {
            $productId = $item->productVariant->product_id;

            if (in_array($productId, $processedProducts)) continue;
            $processedProducts[] = $productId;

            $product = $item->productVariant->product;
            $variants = $product->variants()->get()->map(function ($v) {
                return [
                    'size' => $v->size,
                    'quantity' => $v->quantity,
                    'is_in_stock' => $v->quantity > 0,
                    'product_variant_id' => $v->product_variant_id,
                ];
            });

            $result[] = [
                'product_name' => $product->name,
                'base_product_id' => $product->base_product_id,
                'image_url' => $product->image_url,
                'variants' => $variants,
            ];
        }

        return $result;
    }

    public function dailySummary(Request $request)
    {
        $date = $request->date ?? today()->toDateString();

        $transactions = SalesTransaction::whereDate('transaction_date', $date)
            ->where('status', 'completed')
            ->with('items')
            ->get();

        $totalRevenue = $transactions->sum('net_amount');
        $totalCogs = $transactions->flatMap->items->sum(function ($item) {
            return $item->buying_price * $item->quantity;
        });
        $transactionCount = $transactions->count();

        return response()->json([
            'date' => $date,
            'total_revenue' => $totalRevenue,
            'total_cogs' => $totalCogs,
            'gross_profit' => $totalRevenue - $totalCogs,
            'transaction_count' => $transactionCount,
            'transactions' => $transactions,
        ]);
    }
}
