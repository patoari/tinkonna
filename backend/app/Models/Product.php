<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'base_product_id',
        'name',
        'name_bn',
        'category',
        'description',
        'description_bn',
        'image',
        'has_fixed_price',
        'buying_price',
        'selling_price',
        'online_price',
        'size_type',
        'is_active',
    ];

    protected $casts = [
        'has_fixed_price' => 'boolean',
        'buying_price'    => 'decimal:2',
        'selling_price'   => 'decimal:2',
        'online_price'    => 'decimal:2',
        'is_active'       => 'boolean',
    ];

    protected $appends = ['image_url', 'featured_image_url', 'total_stock'];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function activeVariants()
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function featuredImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_featured', true)->orderBy('sort_order');
    }

    public function getImageUrlAttribute(): ?string
    {
        if ($this->relationLoaded('featuredImage') && $this->featuredImage) {
            return $this->featuredImage->image_url;
        }

        if ($this->relationLoaded('images') && $this->images->isNotEmpty()) {
            return $this->images->first()->image_url;
        }

        if ($this->featuredImage()->exists()) {
            return $this->featuredImage()->first()->image_url;
        }

        if ($this->image) {
            return asset('storage/' . $this->image);
        }

        return null;
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if ($this->relationLoaded('featuredImage') && $this->featuredImage) {
            return $this->featuredImage->image_url;
        }

        if ($this->featuredImage()->exists()) {
            return $this->featuredImage()->first()->image_url;
        }

        if ($this->relationLoaded('images') && $this->images->isNotEmpty()) {
            return $this->images->first()->image_url;
        }

        if ($this->image) {
            return asset('storage/' . $this->image);
        }

        return null;
    }

    public function getTotalStockAttribute(): int
    {
        return $this->variants()->sum('quantity');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->base_product_id)) {
                $product->base_product_id = static::generateBaseProductId($product->category);
            }
        });
    }

    public static function generateBaseProductId(string $category): string
    {
        $prefix = match($category) {
            'shirts' => 'SHT',
            'pants' => 'PNT',
            't-shirts' => 'TSH',
            'panjabi' => 'PNJ',
            'accessories' => 'ACC',
            default => 'PRD',
        };

        $lastProduct = static::withTrashed()
            ->where('base_product_id', 'like', $prefix . '-%')
            ->orderByDesc('id')
            ->first();

        $nextNum = 1;
        if ($lastProduct) {
            $parts = explode('-', $lastProduct->base_product_id);
            $nextNum = (int) end($parts) + 1;
        }

        return $prefix . '-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
    }
}
