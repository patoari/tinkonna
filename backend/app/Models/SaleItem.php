<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sales_transaction_id',
        'product_variant_id',
        'product_name',
        'product_name_bn',
        'size',
        'quantity',
        'buying_price',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'buying_price' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(SalesTransaction::class, 'sales_transaction_id');
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
