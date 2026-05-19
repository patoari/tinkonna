<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThemeConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'theme_id',
        'created_by',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = ['status'];

    public function theme()
    {
        return $this->belongsTo(Theme::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getStatusAttribute(): string
    {
        $today = today();
        if (!$this->is_active) return 'inactive';
        if ($today->lt($this->start_date)) return 'upcoming';
        if ($today->gt($this->end_date)) return 'expired';
        return 'active';
    }
}
