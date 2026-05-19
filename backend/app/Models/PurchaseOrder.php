<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'user_id',
        'delivery_name',
        'delivery_phone',
        'delivery_address',
        'delivery_city',
        'delivery_district',
        'delivery_notes',
        'total_amount',
        'payment_method',
        'transaction_reference',
        'sender_number',
        'payment_screenshot',
        'payment_status',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'unit_price'   => 'decimal:2',
        'verified_at'  => 'datetime',
    ];

    protected $appends = ['payment_screenshot_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getPaymentScreenshotUrlAttribute(): ?string
    {
        if ($this->payment_screenshot) {
            return asset('storage/' . $this->payment_screenshot);
        }
        return null;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD-' . date('Ymd') . '-';
        $last = static::withTrashed()
            ->where('order_number', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->first();

        $next = 1;
        if ($last) {
            $parts = explode('-', $last->order_number);
            $next = (int) end($parts) + 1;
        }

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }
}
