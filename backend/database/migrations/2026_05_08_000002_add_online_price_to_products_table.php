<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds `online_price` to products.
 *
 * Used when a product has variable in-store pricing but needs a fixed
 * price for the online storefront (e-commerce / purchase orders).
 * Nullable — if null, the product is not available for online purchase.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Placed after selling_price for logical grouping
            $table->decimal('online_price', 10, 2)->nullable()->after('selling_price');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('online_price');
        });
    }
};
