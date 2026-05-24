<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    private function photoUrl(?string $photo): ?string
    {
        return $photo ? url('storage/public/img/products/' . $photo) : null;
    }

    public function loadProducts(Request $request)
    {
        $search = $request->input('search');

        $products = Product::where('is_deleted', false)
            ->orderByDesc('created_at');

        if ($search) {
            $products->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $products->paginate(5);

        $products->getCollection()->transform(function ($product) {
            $product->photo = $this->photoUrl($product->photo);

            return $product;
        });

        return response()->json(['products' => $products], 200);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:120'],
            'price' => ['required', 'numeric', 'min:0'],
            'bottles' => ['required', 'integer', 'min:0'],
            'stock_5ml' => ['required', 'integer', 'min:0'],
            'stock_10ml' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'photo' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ]);

        $filenameToStore = null;
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $filenameToStore = sha1($filename . '_' . time()) . '.' . $extension;
            $file->storeAs('public/img/products', $filenameToStore);
        }

        $product = Product::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'bottles' => $validated['bottles'],
            'stock_5ml' => $validated['stock_5ml'],
            'stock_10ml' => $validated['stock_10ml'],
            'description' => $validated['description'] ?? null,
            'photo' => $filenameToStore,
        ]);

        ActivityLogService::recordFromRequest($request, "added product \"{$product->name}\"");

        return response()->json([
            'message' => 'Product Successfully Saved',
            'product' => tap($product, fn ($p) => $p->photo = $this->photoUrl($p->photo)),
        ], 200);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:120'],
            'price' => ['required', 'numeric', 'min:0'],
            'bottles' => ['required', 'integer', 'min:0'],
            'stock_5ml' => ['required', 'integer', 'min:0'],
            'stock_10ml' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ]);

        $photo = $product->photo;

        if ($request->hasFile('photo')) {
            if ($photo) {
                Storage::delete('public/img/products/' . $photo);
            }
            $file = $request->file('photo');
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $photo = sha1($filename . '_' . time()) . '.' . $extension;
            $file->storeAs('public/img/products', $photo);
        }

        $product->update([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'bottles' => $validated['bottles'],
            'stock_5ml' => $validated['stock_5ml'],
            'stock_10ml' => $validated['stock_10ml'],
            'description' => $validated['description'] ?? null,
            'photo' => $photo,
        ]);

        ActivityLogService::recordFromRequest($request, "updated product \"{$product->name}\"");

        $product->photo = $this->photoUrl($product->photo);

        return response()->json([
            'message' => 'Product Successfully Updated',
            'product' => $product,
        ], 200);
    }

    public function destroyProduct(Request $request, Product $product)
    {
        $product->update(['is_deleted' => true]);

        ActivityLogService::recordFromRequest($request, "deleted product \"{$product->name}\"");

        return response()->json(['message' => 'Product Successfully Deleted.'], 200);
    }
}
