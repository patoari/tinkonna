<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, find and update duplicate transaction_references
        $duplicates = DB::table('purchase_orders')
            ->select('transaction_reference', DB::raw('COUNT(*) as count'))
            ->groupBy('transaction_reference')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            $orders = DB::table('purchase_orders')
                ->where('transaction_reference', $duplicate->transaction_reference)
                ->orderBy('id')
                ->get();

            // Keep the first one, update the rest with unique references
            $isFirst = true;
            foreach ($orders as $order) {
                if ($isFirst) {
                    $isFirst = false;
                    continue;
                }

                // Generate a new unique transaction reference
                $newRef = strtoupper(substr(md5(uniqid($order->id, true)), 0, 12));
                DB::table('purchase_orders')
                    ->where('id', $order->id)
                    ->update(['transaction_reference' => $newRef]);
            }
        }

        // Now add the unique constraint
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->unique('transaction_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropUnique(['transaction_reference']);
        });
    }
};
