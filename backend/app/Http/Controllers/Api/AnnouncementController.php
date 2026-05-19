<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    use HandlesFileUploads;
    public function index(Request $request)
    {
        $query = Announcement::with('creator');

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->status === 'active') {
            $query->active();
        }

        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:joy_occasion,sorrow_occasion,achievement,promotional,general_message',
            'display_start_date' => 'required|date',
            'display_end_date' => 'nullable|date|after_or_equal:display_start_date',
            'banner_image' => 'nullable|mimes:jpeg,png,gif,webp,svg|max:51200', // 50MB max
        ]);

        $bannerPath = null;
        if ($request->hasFile('banner_image')) {
            $bannerPath = $this->storePublicFile($request->file('banner_image'), 'announcements');
        }

        $announcement = Announcement::create([
            'created_by' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
            'type' => $request->type,
            'banner_image' => $bannerPath,
            'display_start_date' => $request->display_start_date,
            'display_end_date' => $request->display_end_date,
        ]);

        return response()->json($announcement->load('creator'), 201);
    }

    public function show(Announcement $announcement)
    {
        return response()->json($announcement->load('creator'));
    }

    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:joy_occasion,sorrow_occasion,achievement,promotional,general_message',
            'display_start_date' => 'required|date',
            'display_end_date' => 'nullable|date|after_or_equal:display_start_date',
            'banner_image' => 'nullable|mimes:jpeg,png,gif,webp,svg|max:51200', // 50MB max
        ]);

        $data = $request->only(['title', 'content', 'type', 'display_start_date', 'display_end_date']);

        if ($request->hasFile('banner_image')) {
            if ($announcement->banner_image) {
                $this->deletePublicFile($announcement->banner_image);
            }
            $data['banner_image'] = $this->storePublicFile($request->file('banner_image'), 'announcements');
        }

        $announcement->update($data);

        return response()->json($announcement->fresh()->load('creator'));
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->banner_image) {
            $this->deletePublicFile($announcement->banner_image);
        }
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }

    public function toggleHide(Announcement $announcement)
    {
        $announcement->update(['is_hidden' => !$announcement->is_hidden]);

        return response()->json(['message' => $announcement->is_hidden ? 'Hidden' : 'Shown', 'is_hidden' => $announcement->is_hidden]);
    }
}
