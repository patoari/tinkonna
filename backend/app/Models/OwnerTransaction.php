<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OwnerTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'payment_source',
        'recipient_name',
        'recipient_phone',
        'purpose',
        'notes',
        'transaction_date',
        'expected_return_date',
        'actual_return_date',
        'status',
        'related_transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function relatedTransaction(): BelongsTo
    {
        return $this->belongsTo(OwnerTransaction::class, 'related_transaction_id');
    }

    // Check if loan is overdue
    public function isOverdue(): bool
    {
        if ($this->type !== 'loan' || $this->status === 'completed') {
            return false;
        }

        return $this->expected_return_date &&
               $this->expected_return_date->isPast() &&
               $this->status !== 'completed';
    }

    // Get remaining loan amount
    public function getRemainingAmount(): float
    {
        if ($this->type !== 'loan') {
            return 0;
        }

        $repayments = self::where('related_transaction_id', $this->id)
            ->where('type', 'loan_repayment')
            ->sum('amount');

        return max(0, $this->amount - $repayments);
    }
}
