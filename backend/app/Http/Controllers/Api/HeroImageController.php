<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use App\Models\HeroBackgroundImage;
use Illuminate\Http\Request;

class HeroImageController extends Controller
{
    use HandlesFileUploads;

    /** Public: return active images filtered by device type */
    public function public(\Illuminate\Http\Request $request)
    {
        // device = 'mobile' | 'tablet' | 'desktop'  (default: desktop)
        $device = $request->query('device', 'desktop');

        $query = HeroBackgroundImage::where('is_active', true)
            ->orderBy('sort_order');

        if ($device === 'mobile') {
            $query->where('show_on_mobile', true);
        } elseif ($device === 'tablet') {
            $query->where('show_on_tablet', true);
        } else {
            $query->where('show_on_desktop', true);
        }

        $media = $query->get();

        return response()->json($media->map(fn($item) => [
            'id'              => $item->id,
            'media_type'      => $item->media_type,
            'url'             => $item->url,
            'thumbnail_url'   => $item->thumbnail_url,
            'duration'        => $item->duration,
            'show_on_desktop' => $item->show_on_desktop,
            'show_on_tablet'  => $item->show_on_tablet,
            'show_on_mobile'  => $item->show_on_mobile,
        ]));
    }

    /** Admin: list all */
    public function index()
    {
        return response()->json(
            HeroBackgroundImage::orderBy('sort_order')->get()
                ->map(fn($item) => array_merge($item->toArray(), [
                    'url' => $item->url,
                    'thumbnail_url' => $item->thumbnail_url,
                ]))
        );
    }

    /** Admin: upload a new image */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|file|mimes:jpeg,png,webp,gif,svg|max:40960', // 40MB max (matches PHP upload_max_filesize)
            ]);

            $maxOrder = HeroBackgroundImage::max('sort_order') ?? -1;
            $path = $this->storePublicFile($request->file('image'), 'hero-backgrounds');

            $image = HeroBackgroundImage::create([
                'media_type'      => 'image',
                'path'            => $path,
                'image_path'      => $path,
                'media_path'      => $path,
                'sort_order'      => $maxOrder + 1,
                'is_active'       => true,
                'show_on_desktop' => true,
                'show_on_tablet'  => true,
                'show_on_mobile'  => true,
            ]);

            return response()->json(array_merge($image->toArray(), [
                'url'           => $image->url,
                'thumbnail_url' => $image->thumbnail_url,
            ]), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Hero image validation failed', [
                'errors' => $e->errors(),
                'file_name' => $request->file('image') ? $request->file('image')->getClientOriginalName() : 'no file',
                'file_size' => $request->file('image') ? $request->file('image')->getSize() : 0,
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Hero image upload failed', [
                'error' => $e->getMessage(),
                'file_name' => $request->file('image') ? $request->file('image')->getClientOriginalName() : 'no file',
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /** Admin: delete */
    public function destroy(HeroBackgroundImage $heroImage)
    {
        // Delete main media file
        if ($heroImage->media_path) {
            $this->deletePublicFile($heroImage->media_path);
        }
        if ($heroImage->path) {
            $this->deletePublicFile($heroImage->path);
        }

        // Delete thumbnail if exists
        if ($heroImage->thumbnail_path) {
            $this->deletePublicFile($heroImage->thumbnail_path);
        }

        $heroImage->delete();
        return response()->json(['message' => 'Media deleted']);
    }

    /** Admin: reorder */
    public function reorder(Request $request)
    {
        $request->validate(['order' => 'required|array']);
        foreach ($request->order as $index => $id) {
            HeroBackgroundImage::where('id', $id)->update(['sort_order' => $index]);
        }
        return response()->json(['message' => 'Order saved']);
    }

    /** Admin: toggle active */
    public function toggle(HeroBackgroundImage $heroImage)
    {
        $heroImage->update(['is_active' => !$heroImage->is_active]);
        return response()->json(array_merge($heroImage->fresh()->toArray(), [
            'url' => $heroImage->url,
            'thumbnail_url' => $heroImage->thumbnail_url,
        ]));
    }

    /** Admin: toggle show_on_mobile */
    public function toggleMobile(HeroBackgroundImage $heroImage)
    {
        $heroImage->update(['show_on_mobile' => !$heroImage->show_on_mobile]);
        return response()->json(array_merge($heroImage->fresh()->toArray(), [
            'url' => $heroImage->url,
            'thumbnail_url' => $heroImage->thumbnail_url,
        ]));
    }

    /** Admin: toggle show_on_tablet */
    public function toggleTablet(HeroBackgroundImage $heroImage)
    {
        $heroImage->update(['show_on_tablet' => !$heroImage->show_on_tablet]);
        return response()->json(array_merge($heroImage->fresh()->toArray(), [
            'url' => $heroImage->url,
            'thumbnail_url' => $heroImage->thumbnail_url,
        ]));
    }

    /** Admin: toggle show_on_desktop */
    public function toggleDesktop(HeroBackgroundImage $heroImage)
    {
        $heroImage->update(['show_on_desktop' => !$heroImage->show_on_desktop]);
        return response()->json(array_merge($heroImage->fresh()->toArray(), [
            'url' => $heroImage->url,
            'thumbnail_url' => $heroImage->thumbnail_url,
        ]));
    }
}
