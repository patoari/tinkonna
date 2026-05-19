<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_number',
        'user_id',
        'customer_id',
        'total_amount',
        'discount_amount',
        'net_amount',
        'payment_method',
        'payment_source',
        'payment_reference',
        'status',
        'notes',
        'transaction_date',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->transaction_number)) {
                $transaction->transaction_number = static::generateTransactionNumber();
            }
            if (empty($transaction->transaction_date)) {
                $transaction->transaction_date = now();
            }
        });
    }

    public static function generateTransactionNumber(): string
    {
        $prefix = 'TXN-' . date('Ymd') . '-';
        $lastTxn = static::withTrashed()
            ->where('transaction_number', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->first();

        $nextNum = 1;
        if ($lastTxn) {
            $parts = explode('-', $lastTxn->transaction_number);
            $nextNum = (int) end($parts) + 1;
        }

        return $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
    }
}
