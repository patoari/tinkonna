<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_number',
        'user_id',
        'product_variant_id',
        'quantity',
        'booking_type',
        'booking_fee',
        'product_price',
        'status',
        'booking_date',
        'expiry_date',
        'completed_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'booking_fee' => 'decimal:2',
        'product_price' => 'decimal:2',
        'booking_date' => 'datetime',
        'expiry_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function payment()
    {
        return $this->hasOne(BookingPayment::class);
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && now()->greaterThan($this->expiry_date);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->booking_number)) {
                $booking->booking_number = static::generateBookingNumber();
            }
            if (empty($booking->booking_date)) {
                $booking->booking_date = now();
            }
        });
    }

    public static function generateBookingNumber(): string
    {
        $prefix = 'BKG-' . date('Ymd') . '-';
        $lastBooking = static::withTrashed()
            ->where('booking_number', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->first();

        $nextNum = 1;
        if ($lastBooking) {
            $parts = explode('-', $lastBooking->booking_number);
            $nextNum = (int) end($parts) + 1;
        }

        return $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
    }
}
