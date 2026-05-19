<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use HandlesFileUploads;
    // Public — all active categories
    public function public()
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    // Admin — all categories including inactive
    public function index()
    {
        $categories = Category::withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:100',
            'name_bn'     => 'nullable|string|max:100',
            'slug'        => 'nullable|string|unique:categories,slug',
            'icon'        => 'nullable|string|max:20',
            'image'       => 'nullable|image|mimes:jpeg,png,gif,webp|max:51200', // 50MB max
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|numeric|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        $slug = $request->slug
            ? Str::slug($request->slug)
            : Str::slug($request->name);

        // ensure unique slug
        $base = $slug;
        $i = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $this->storePublicFile($request->file('image'), 'categories');
        }

        $category = Category::create([
            'name'        => $request->name,
            'name_bn'     => $request->name_bn,
            'slug'        => $slug,
            'icon'        => $request->icon,
            'image'       => $imagePath,
            'description' => $request->description,
            'sort_order'  => $request->sort_order ?? 0,
            'is_active'   => $request->boolean('is_active', true),
        ]);

        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->loadCount('products'));
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name'        => 'required|string|max:100',
            'name_bn'     => 'nullable|string|max:100',
            'slug'        => 'nullable|string|unique:categories,slug,' . $category->id,
            'icon'        => 'nullable|string|max:20',
            'image'       => 'nullable|image|mimes:jpeg,png,gif,webp|max:51200', // 50MB max
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|numeric|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        $data = $request->only(['name', 'name_bn', 'description', 'icon', 'sort_order']);
        $data['slug']      = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);
        $data['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('image')) {
            if ($category->image) $this->deletePublicFile($category->image);
            $data['image'] = $this->storePublicFile($request->file('image'), 'categories');
        }

        $category->update($data);

        return response()->json($category->fresh()->loadCount('products'));
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => "Cannot delete — {$category->products()->count()} product(s) use this category. Reassign them first.",
            ], 422);
        }

        if ($category->image) $this->deletePublicFile($category->image);
        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }

    // Reorder categories
    public function reorder(Request $request)
    {
        $request->validate(['order' => 'required|array']);

        foreach ($request->order as $index => $id) {
            Category::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Order saved']);
    }
}
