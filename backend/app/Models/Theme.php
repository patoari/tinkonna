<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Theme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'occasion',
        'css_variables',
        'banner_image',
        'flying_symbols_enabled',
        'max_flying_symbols',
        'is_default',
    ];

    protected $casts = [
        'css_variables' => 'array',
        'flying_symbols_enabled' => 'boolean',
        'max_flying_symbols' => 'integer',
        'is_default' => 'boolean',
    ];

    public function configurations()
    {
        return $this->hasMany(ThemeConfiguration::class);
    }

    public function icons()
    {
        return $this->hasMany(ThemeIcon::class)->orderBy('sort_order');
    }

    public function getActiveConfiguration()
    {
        return $this->configurations()
            ->where('is_active', true)
            ->where('start_date', '<=', today())
            ->where('end_date', '>=', today())
            ->latest()
            ->first();
    }
}
