<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Http\Controllers\Api\Concerns\HandlesFileUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use HandlesFileUploads;
    public function index(Request $request)
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

        // For admin panel: include_out_of_stock parameter allows showing all products including out-of-stock
        // For public API: always filter to show only products with at least one variant in stock
        $includeOutOfStock = filter_var($request->include_out_of_stock ?? false, FILTER_VALIDATE_BOOLEAN);
        
        if (!$includeOutOfStock) {
            // Hide products that are completely out of stock across all variants
            $query->whereHas('variants', function ($q) {
                $q->where('quantity', '>', 0);
            });
        }

        $products = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'name_bn'          => 'nullable|string|max:255',
            'category'         => 'required|in:shirts,pants,t-shirts,panjabi,accessories',
            'description'      => 'nullable|string',
            'description_bn'   => 'nullable|string',
            'buying_price'     => 'required|numeric|min:0',
            'has_fixed_price'  => 'required|boolean',
            'selling_price'    => 'nullable|numeric|min:0',
            'online_price'     => 'nullable|numeric|min:0',
            'size_type'        => 'required|in:standard,measurement',
            'image'            => 'nullable|image|mimes:jpeg,png,gif,webp|max:51200', // 50MB max
            'images'           => 'nullable|array',
            'images.*'         => 'nullable|image|mimes:jpeg,png,gif,webp|max:51200',
            'variants'         => 'required|array|min:1',
            'variants.*.size'  => 'required|string',
            'variants.*.quantity' => 'required|integer|min:0',
        ]);

        if ($request->has_fixed_price && !$request->selling_price) {
            return response()->json(['message' => 'Selling price is required for fixed price products'], 422);
        }

        DB::beginTransaction();
        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->storePublicFile($request->file('image'), 'products');
            }

            $hasFixedPrice = filter_var($request->has_fixed_price, FILTER_VALIDATE_BOOLEAN);

            $product = Product::create([
                'name'            => $request->name,
                'name_bn'         => $request->name_bn,
                'category'        => $request->category,
                'description'     => $request->description,
                'description_bn'  => $request->description_bn,
                'buying_price'    => $request->buying_price,
                'has_fixed_price' => $hasFixedPrice,
                'selling_price'   => $hasFixedPrice ? $request->selling_price : null,
                'online_price'    => $request->online_price ?: null,
                'size_type'       => $request->size_type,
                'image'           => $imagePath,
            ]);

            foreach ($request->variants as $variantData) {
                $product->variants()->create([
                    'size'     => $variantData['size'],
                    'quantity' => $variantData['quantity'],
                ]);
            }

            if ($request->hasFile('images')) {
                $sortOrder = 0;
                foreach ($request->file('images') as $imageFile) {
                    $imagePath = $this->storePublicFile($imageFile, 'products');
                    $product->images()->create([
                        'image'       => $imagePath,
                        'is_featured' => $sortOrder === 0,
                        'sort_order'  => $sortOrder,
                    ]);
                    if ($sortOrder === 0 && ! $product->image) {
                        $product->image = $imagePath;
                        $product->save();
                    }
                    $sortOrder++;
                }
            }

            DB::commit();
            return response()->json($product->load(['variants', 'images', 'featuredImage']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create product: ' . $e->getMessage()], 500);
        }
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['variants', 'images', 'featuredImage']));
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name'               => 'required|string|max:255',
            'name_bn'            => 'nullable|string|max:255',
            'category'           => 'required|in:shirts,pants,t-shirts,panjabi,accessories',
            'buying_price'       => 'required|numeric|min:0',
            'has_fixed_price'    => 'required|boolean',
            'selling_price'      => 'nullable|numeric|min:0',
            'online_price'       => 'nullable|numeric|min:0',
            'size_type'          => 'required|in:standard,measurement',
            'image'              => 'nullable|image|mimes:jpeg,png,gif,webp|max:51200', // 50MB max
            'images'             => 'nullable|array',
            'images.*'           => 'nullable|image|mimes:jpeg,png,gif,webp|max:51200',
            'remove_image_ids'   => 'nullable|array',
            'remove_image_ids.*' => 'nullable|integer|exists:product_images,id',
            'featured_image_id'  => 'nullable|integer|exists:product_images,id',
        ]);

        if ($request->has_fixed_price && !$request->selling_price) {
            return response()->json(['message' => 'Selling price is required for fixed price products'], 422);
        }

        $data = $request->only(['name', 'name_bn', 'category', 'description', 'description_bn', 'buying_price', 'size_type']);
        $hasFixedPrice = filter_var($request->has_fixed_price, FILTER_VALIDATE_BOOLEAN);
        $data['has_fixed_price'] = $hasFixedPrice;
        $data['selling_price']   = $hasFixedPrice ? $request->selling_price : null;
        $data['online_price']    = $request->online_price ?: null;
        $data['is_active']       = filter_var($request->is_active ?? true, FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            if ($product->image) {
                $this->deletePublicFile($product->image);
            }
            $data['image'] = $this->storePublicFile($request->file('image'), 'products');
        }

        $product->update($data);

        if ($request->filled('remove_image_ids')) {
            $removeIds = array_filter($request->input('remove_image_ids', []));
            $imagesToRemove = $product->images()->whereIn('id', $removeIds)->get();
            foreach ($imagesToRemove as $image) {
                $this->deletePublicFile($image->image);
                $image->delete();
            }
        }

        if ($request->filled('featured_image_id')) {
            $featuredId = $request->input('featured_image_id');
            $product->images()->update(['is_featured' => false]);
            $featuredImage = $product->images()->where('id', $featuredId)->first();
            if ($featuredImage) {
                $featuredImage->update(['is_featured' => true]);
                $product->image = $featuredImage->image;
            }
        }

        if ($request->hasFile('images')) {
            $sortOrder = $product->images()->max('sort_order') + 1;
            foreach ($request->file('images') as $imageFile) {
                $imagePath = $this->storePublicFile($imageFile, 'products');
                $product->images()->create([
                    'image'       => $imagePath,
                    'is_featured' => false,
                    'sort_order'  => $sortOrder,
                ]);
                $sortOrder++;
            }
        }

        // Keep the fallback image field in sync with the current featured image or the first available gallery image.
        $currentFeatured = $product->images()->where('is_featured', true)->first();
        if (! $currentFeatured) {
            $currentFeatured = $product->images()->first();
        }

        if ($currentFeatured) {
            $product->image = $currentFeatured->image;
        } elseif (! $product->images()->exists()) {
            $product->image = null;
        }

        $product->save();

        return response()->json($product->load(['variants', 'images', 'featuredImage']));
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function addVariant(Request $request, Product $product)
    {
        $request->validate([
            'size' => 'required|string',
            'quantity' => 'required|integer|min:0',
        ]);

        $existing = $product->variants()->where('size', $request->size)->first();
        if ($existing) {
            return response()->json(['message' => 'Variant with this size already exists'], 422);
        }

        $variant = $product->variants()->create([
            'size' => $request->size,
            'quantity' => $request->quantity,
        ]);

        return response()->json($variant, 201);
    }

    public function updateVariant(Request $request, Product $product, ProductVariant $variant)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $variant->update(['quantity' => $request->quantity]);

        return response()->json($variant);
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        $identifier = $request->identifier;
        $directVariant = null; // The specific variant matched by barcode scan

        // Try barcode first (supports new dual-ID format: BASE_ID|VARIANT_ID)
        $variant = ProductVariant::where('barcode', $identifier)
            ->orWhere('product_variant_id', $identifier)
            ->with('product')
            ->first();

        if ($variant) {
            $product = $variant->product;
            // If matched by barcode (not by product_variant_id text search), it's a direct scan
            if ($variant->barcode === $identifier) {
                $directVariant = $variant;
            }
        } else {
            // Try base product ID
            $product = Product::where('base_product_id', $identifier)->first();
        }

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $variants = $product->variants()->get()->map(function ($v) {
            return [
                'id' => $v->id,
                'product_variant_id' => $v->product_variant_id,
                'barcode' => $v->barcode,
                'size' => $v->size,
                'quantity' => $v->quantity,
                'is_in_stock' => $v->quantity > 0,
            ];
        });

        return response()->json([
            'product' => [
                'id'              => $product->id,
                'base_product_id' => $product->base_product_id,
                'name'            => $product->name,
                'name_bn'         => $product->name_bn,
                'category'        => $product->category,
                'image_url'       => $product->image_url,
                'has_fixed_price' => $product->has_fixed_price,
                'selling_price'   => $product->selling_price,
                'online_price'    => $product->online_price,
            ],
            'variants' => $variants,
            'total_quantity' => $variants->sum('quantity'),
            // When a barcode is scanned and directly matches a specific variant,
            // this field tells the frontend to auto-add that variant to cart.
            'direct_variant_id' => $directVariant?->id,
        ]);
    }

    public function printLabel(Product $product, ProductVariant $variant)
    {
        return response()->json([
            'product' => $product,
            'variant' => $variant,
            'label_data' => [
                'product_name' => $product->name,
                'size' => $variant->size,
                'price' => $product->selling_price,
                'base_product_id' => $product->base_product_id,
                'product_variant_id' => $variant->product_variant_id,
                'barcode' => $variant->barcode,
                'image_url' => $product->image_url,
            ],
        ]);
    }
}
