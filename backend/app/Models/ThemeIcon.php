<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThemeIcon extends Model
{
    use HasFactory;

    protected $fillable = [
        'theme_id',
        'file_path',
        'original_name',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    protected $appends = ['url'];

    public function theme()
    {
        return $this->belongsTo(Theme::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }
}
