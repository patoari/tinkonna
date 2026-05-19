<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category',
        'category_other',
        'amount',
        'payment_source',
        'description',
        'expense_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getCategoryNameAttribute(): string
    {
        return match($this->category) {
            'staff_salary' => 'Staff Salary',
            'breakfast' => 'Breakfast',
            'lunch' => 'Lunch',
            'dinner' => 'Dinner',
            'utility_bills' => 'Utility Bills',
            'shipping_cost' => 'Shipping Cost',
            'other' => $this->category_other ?? 'Other',
            default => $this->category,
        };
    }
}
