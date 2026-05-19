<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use App\Models\ThemeConfiguration;
use App\Models\ThemeIcon;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    use HandlesFileUploads;
    public function index()
    {
        $themes = Theme::with(['icons', 'configurations' => function ($q) {
            $q->where('is_active', true)->latest();
        }])->get();

        return response()->json($themes);
    }

    public function show(Theme $theme)
    {
        return response()->json($theme->load('icons', 'configurations'));
    }

    public function update(Request $request, Theme $theme)
    {
        $request->validate([
            'flying_symbols_enabled' => 'boolean',
            'max_flying_symbols' => 'integer|min:1|max:15',
        ]);

        $theme->update($request->only(['flying_symbols_enabled', 'max_flying_symbols']));

        return response()->json($theme);
    }

    public function storeConfiguration(Request $request)
    {
        $request->validate([
            'theme_id' => 'required|exists:themes,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $config = ThemeConfiguration::create([
            'theme_id' => $request->theme_id,
            'created_by' => $request->user()->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_active' => true,
        ]);

        return response()->json($config->load('theme'), 201);
    }

    public function destroyConfiguration(ThemeConfiguration $config)
    {
        $config->delete();
        return response()->json(['message' => 'Configuration deleted']);
    }

    public function uploadIcon(Request $request)
    {
        $request->validate([
            'theme_id' => 'required|exists:themes,id',
            'icon' => 'required|file|mimes:png,gif,webp|max:512',
        ]);

        $theme = Theme::find($request->theme_id);

        if ($theme->icons()->count() >= 20) {
            return response()->json(['message' => 'Maximum 20 icons per theme'], 422);
        }

        $path = $this->storePublicFile($request->file('icon'), 'theme-icons');

        $icon = ThemeIcon::create([
            'theme_id' => $request->theme_id,
            'file_path' => $path,
            'original_name' => $request->file('icon')->getClientOriginalName(),
            'sort_order' => $theme->icons()->count(),
        ]);

        return response()->json($icon, 201);
    }

    public function deleteIcon(ThemeIcon $icon)
    {
        $this->deletePublicFile($icon->file_path);
        $icon->delete();

        return response()->json(['message' => 'Icon deleted']);
    }
}
