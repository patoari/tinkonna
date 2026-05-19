<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'image',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        return asset('storage/' . $this->image);
    }
}
