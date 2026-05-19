<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\ProductVariant;

/**
 * Regenerates all existing variant barcodes to the new dual-ID format:
 *   {base_product_id}|{product_variant_id}
 *
 * Example: TSH-0002|TSH-0002-XXXL
 *
 * This allows a barcode scan to directly identify both the product and the
 * specific size/variant, enabling auto-add-to-cart without a size selection step.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Temporarily drop the unique constraint so we can update in bulk
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropUnique(['barcode']);
        });

        // Regenerate each variant's barcode using the new format
        ProductVariant::withTrashed()->each(function (ProductVariant $variant) {
            $parts = explode('-', $variant->product_variant_id);
            array_pop($parts); // remove size segment
            $baseProductId = implode('-', $parts);
            $newBarcode = $baseProductId . '|' . $variant->product_variant_id;

            // Handle edge case: if somehow duplicate exists, append a suffix
            $suffix = '';
            while (
                ProductVariant::withTrashed()
                    ->where('barcode', $newBarcode . $suffix)
                    ->where('id', '!=', $variant->id)
                    ->exists()
            ) {
                $suffix = '-' . str_pad(mt_rand(0, 999), 3, '0', STR_PAD_LEFT);
            }

            $variant->timestamps = false;
            $variant->barcode = $newBarcode . $suffix;
            $variant->save();
        });

        // Re-add the unique constraint
        Schema::table('product_variants', function (Blueprint $table) {
            $table->unique('barcode');
        });
    }

    public function down(): void
    {
        // Revert to old random barcode format — regenerate random barcodes
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropUnique(['barcode']);
        });

        ProductVariant::withTrashed()->each(function (ProductVariant $variant) {
            $base = strtoupper(str_replace('-', '', $variant->product_variant_id));
            $suffix = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $barcode = $base . $suffix;

            while (
                ProductVariant::withTrashed()
                    ->where('barcode', $barcode)
                    ->where('id', '!=', $variant->id)
                    ->exists()
            ) {
                $suffix = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
                $barcode = $base . $suffix;
            }

            $variant->timestamps = false;
            $variant->barcode = $barcode;
            $variant->save();
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->unique('barcode');
        });
    }
};
