<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'product_variant_id',
        'barcode',
        'size',
        'quantity',
        'is_active',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function getIsInStockAttribute(): bool
    {
        return $this->quantity > 0;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($variant) {
            if (empty($variant->product_variant_id)) {
                $variant->product_variant_id = static::generateVariantId($variant->product_id, $variant->size);
            }
            if (empty($variant->barcode)) {
                $variant->barcode = static::generateBarcode($variant->product_variant_id);
            }
        });
    }

    public static function generateVariantId(int $productId, string $size): string
    {
        $product = Product::find($productId);
        $sizeSlug = strtoupper(str_replace(' ', '', $size));
        return $product->base_product_id . '-' . $sizeSlug;
    }

    public static function generateBarcode(string $variantId): string
    {
        // Barcode encodes both base_product_id and product_variant_id separated by a pipe.
        // Format: {BASE_PRODUCT_ID}|{PRODUCT_VARIANT_ID}
        // Example: TSH-0002|TSH-0002-XXXL
        // This allows scanning to directly identify both the product and the specific variant/size.
        $parts = explode('-', $variantId);
        // product_variant_id format: PREFIX-NNNN-SIZE (e.g. TSH-0002-XXXL)
        // base_product_id is PREFIX-NNNN (e.g. TSH-0002)
        // Reconstruct base_product_id from variant_id by dropping the last segment
        array_pop($parts);
        $baseProductId = implode('-', $parts);

        $barcode = $baseProductId . '|' . $variantId;

        // Ensure uniqueness (should always be unique since variant_id is unique)
        if (static::where('barcode', $barcode)->exists()) {
            // Fallback: append a suffix
            $suffix = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $barcode = $barcode . $suffix;
        }

        return $barcode;
    }
}
