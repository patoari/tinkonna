<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Product;
use App\Models\Theme;
use App\Models\ThemeConfiguration;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function products(Request $request)
    {
        $query = Product::with(['variants', 'images', 'featuredImage'])->where('is_active', true);

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('base_product_id', 'like', '%' . $request->search . '%')
                    ->orWhere('name_bn', 'like', '%' . $request->search . '%');
            });
        }

        // Always filter to show only products with at least one variant in stock
        // (i.e., hide products that are completely out of stock across all variants)
        $query->whereHas('variants', fn($q) => $q->where('quantity', '>', 0));

        // The in_stock parameter is kept for backward compatibility but is now always applied
        if ($request->in_stock) {
            $query->whereHas('variants', fn($q) => $q->where('quantity', '>', 0));
        }

        $products = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($products);
    }

    public function product(Product $product)
    {
        if (!$product->is_active) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product->load(['variants', 'images', 'featuredImage']));
    }

    public function announcements()
    {
        $announcements = Announcement::active()
            ->latest()
            ->take(5)
            ->get();

        return response()->json($announcements);
    }

    public function activeTheme()
    {
        $today = today()->toDateString();

        $config = ThemeConfiguration::with(['theme.icons'])
            ->where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->latest()
            ->first();

        if ($config) {
            return response()->json($config->theme);
        }

        $defaultTheme = Theme::where('is_default', true)->with('icons')->first();

        return response()->json($defaultTheme);
    }
}
