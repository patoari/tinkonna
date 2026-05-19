<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroBackgroundImage extends Model
{
    protected $fillable = [
        'media_type',
        'path',
        'image_path',
        'media_path',
        'thumbnail_path',
        'video_url',
        'duration',
        'sort_order',
        'is_active',
        'show_on_desktop',
        'show_on_tablet',
        'show_on_mobile',
    ];

    protected $casts = [
        'is_active'       => 'boolean',
        'show_on_desktop' => 'boolean',
        'show_on_tablet'  => 'boolean',
        'show_on_mobile'  => 'boolean',
        'sort_order'      => 'integer',
        'duration'        => 'integer',
    ];

    protected $appends = ['url', 'thumbnail_url'];

    public function getUrlAttribute(): ?string
    {
        // For videos, return video_url if it's a URL, otherwise return storage path
        if ($this->media_type === 'video') {
            if ($this->video_url && filter_var($this->video_url, FILTER_VALIDATE_URL)) {
                return $this->video_url;
            }
            return $this->media_path ? asset('storage/' . $this->media_path) : null;
        }

        // For images, return the path
        $path = $this->media_path ?? $this->path ?? $this->image_path;
        return $path ? asset('storage/' . $path) : null;
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->media_type === 'video' && $this->thumbnail_path) {
            return asset('storage/' . $this->thumbnail_path);
        }
        return null;
    }

    public function isVideo(): bool
    {
        return $this->media_type === 'video';
    }

    public function isImage(): bool
    {
        return $this->media_type === 'image';
    }
}
