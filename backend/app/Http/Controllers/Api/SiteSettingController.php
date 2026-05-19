<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    use HandlesFileUploads;
    // Public endpoint — returns all settings as flat key=>value
    public function public()
    {
        $settings = SiteSetting::getAllAsArray();

        // Build logo URL if exists
        if (!empty($settings['site_logo'])) {
            $settings['site_logo_url'] = asset('storage/' . $settings['site_logo']);
        }
        if (!empty($settings['hero_background_image'])) {
            $settings['hero_background_image_url'] = asset('storage/' . $settings['hero_background_image']);
        }
        if (!empty($settings['favicon'])) {
            $settings['favicon_url'] = asset('storage/' . $settings['favicon']);
        }

        return response()->json($settings);
    }

    // Admin endpoint — returns grouped settings with metadata
    public function index()
    {
        $settings = SiteSetting::all()->groupBy('group');
        return response()->json($settings);
    }

    // Update multiple settings at once
    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            if ($value !== null && $value !== '') {
                SiteSetting::set($key, $value);
            }
        }

        SiteSetting::clearCache();

        return response()->json([
            'message' => 'Settings saved successfully',
            'settings' => SiteSetting::getAllAsArray(),
        ]);
    }

    // Upload image setting (logo, favicon, hero bg)
    public function uploadImage(Request $request)
    {
        $request->validate([
            'key'   => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,gif,webp,svg|max:51200', // 50MB max
        ]);

        $key = $request->key;
        $allowedKeys = ['site_logo', 'favicon', 'hero_background_image'];

        if (!in_array($key, $allowedKeys)) {
            return response()->json(['message' => 'Invalid image key'], 422);
        }

        // Delete old image from public/storage
        $old = SiteSetting::get($key);
        if ($old) {
            $this->deletePublicFile($old);
        }

        $relativePath = $this->storePublicFile($request->file('image'), 'site');
        SiteSetting::set($key, $relativePath);
        SiteSetting::clearCache();

        return response()->json([
            'message' => 'Image uploaded successfully',
            'url'     => asset('storage/' . $relativePath),
            'path'    => $relativePath,
        ]);
    }

    // Delete an image setting
    public function deleteImage(Request $request)
    {
        $request->validate(['key' => 'required|string']);

        $path = SiteSetting::get($request->key);
        if ($path) {
            $this->deletePublicFile($path);
        }

        SiteSetting::set($request->key, null);
        SiteSetting::clearCache();

        return response()->json(['message' => 'Image removed']);
    }
}
