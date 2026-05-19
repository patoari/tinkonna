<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group', 'label', 'description'];

    // Get a single setting value by key
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("site_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    // Set a single setting value
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("site_setting_{$key}");
        Cache::forget('site_settings_all');
    }

    // Get all settings as key => value array
    public static function getAllAsArray(): array
    {
        return Cache::remember('site_settings_all', 3600, function () {
            return static::all()->pluck('value', 'key')->toArray();
        });
    }

    // Clear all settings cache
    public static function clearCache(): void
    {
        Cache::forget('site_settings_all');
        static::all()->each(fn($s) => Cache::forget("site_setting_{$s->key}"));
    }
}
