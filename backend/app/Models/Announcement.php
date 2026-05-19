<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by',
        'title',
        'content',
        'type',
        'banner_image',
        'display_start_date',
        'display_end_date',
        'is_hidden',
        'view_count',
    ];

    protected $casts = [
        'display_start_date' => 'date',
        'display_end_date' => 'date',
        'is_hidden' => 'boolean',
        'view_count' => 'integer',
    ];

    protected $appends = ['banner_url', 'status'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getBannerUrlAttribute(): ?string
    {
        if ($this->banner_image) {
            return asset('storage/' . $this->banner_image);
        }
        return null;
    }

    public function getStatusAttribute(): string
    {
        if ($this->is_hidden) return 'hidden';
        $today = today();
        if ($today->lt($this->display_start_date)) return 'upcoming';
        if ($this->display_end_date && $today->gt($this->display_end_date)) return 'expired';
        return 'active';
    }

    public function scopeActive($query)
    {
        return $query->where('is_hidden', false)
            ->where('display_start_date', '<=', today())
            ->where(function ($q) {
                $q->whereNull('display_end_date')
                    ->orWhere('display_end_date', '>=', today());
            });
    }
}
