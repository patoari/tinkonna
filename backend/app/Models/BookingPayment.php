<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'payment_method',
        'transaction_reference',
        'sender_number',
        'payment_screenshot',
        'amount',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    protected $appends = ['screenshot_url'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getScreenshotUrlAttribute(): ?string
    {
        if ($this->payment_screenshot) {
            return asset('storage/' . $this->payment_screenshot);
        }
        return null;
    }
}
