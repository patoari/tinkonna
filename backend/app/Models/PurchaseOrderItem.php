<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'product_variant_id',
        'product_name',
        'size',
        'quantity',
        'unit_price',
        'subtotal',
        'product_image_url',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal'   => 'decimal:2',
        'quantity'   => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
