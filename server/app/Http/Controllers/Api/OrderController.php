<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private function parseCsvList(string|int|float|null $value): array
    {
        if ($value === null) {
            return [];
        }

        return collect(explode(',', (string) $value))
            ->map(fn ($part) => trim($part))
            ->filter(fn ($part) => $part !== '')
            ->values()
            ->all();
    }

    private function parseOrderItemLines(Order $order): array
    {
        $row = $order->items()->first();
        if (! $row) {
            return [];
        }

        $productIds = $this->parseCsvList($row->product_id);
        $variants = $this->parseCsvList($row->variant_type);
        $quantities = $this->parseCsvList($row->quantity);
        $unitPrices = $this->parseCsvList($row->unit_price);
        $length = max(count($productIds), count($variants), count($quantities), count($unitPrices));

        $lines = [];
        for ($i = 0; $i < $length; $i++) {
            $lines[] = [
                'product_id' => (int) ($productIds[$i] ?? 0),
                'variant_type' => (string) ($variants[$i] ?? Product::VARIANT_BOTTLE),
                'quantity' => (int) ($quantities[$i] ?? 0),
                'unit_price' => (float) ($unitPrices[$i] ?? 0),
            ];
        }

        return $lines;
    }

    private function attachExpandedItems(Order $order): Order
    {
        $lines = $this->parseOrderItemLines($order);
        $productIds = collect($lines)->pluck('product_id')->unique()->values();
        $products = Product::whereIn('product_id', $productIds)
            ->where('is_deleted', false)
            ->get()
            ->keyBy('product_id');

        $expanded = collect($lines)->map(function (array $line) use ($products) {
            return (object) [
                'product_id' => (int) $line['product_id'],
                'variant_type' => (string) $line['variant_type'],
                'quantity' => (int) $line['quantity'],
                'unit_price' => (float) $line['unit_price'],
                'product' => $products->get((int) $line['product_id']),
            ];
        })->values();

        $order->setRelation('items', $expanded);
        return $order;
    }

    private function generateOrderCode(): string
    {
        $datePrefix = Carbon::today()->format('Ymd');
        $lastOrder = Order::where('order_code', 'like', $datePrefix . '-%')
            ->orderByDesc('order_id')
            ->first();

        $sequence = 1;
        if ($lastOrder && preg_match('/-(\d+)$/', $lastOrder->order_code, $matches)) {
            $sequence = (int) $matches[1] + 1;
        }

        return $datePrefix . '-' . str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }

    private function ensurePending(Order $order): void
    {
        if ($order->status !== 'pending') {
            abort(422, 'Only pending orders can be modified.');
        }
    }

    private function validateStatusTransition(Order $order, string $newStatus): void
    {
        if (in_array($order->status, ['delivered', 'canceled'], true)) {
            abort(422, 'This order status cannot be changed.');
        }

        $allowed = match ($order->status) {
            'pending' => ['shipped', 'delivered', 'canceled'],
            'shipped' => ['delivered'],
            default => [],
        };

        if (! in_array($newStatus, $allowed, true)) {
            abort(422, 'Invalid status transition for this order.');
        }
    }

    private function resolveOrderLines(array $items): array
    {
        $productIds = collect($items)
            ->pluck('product_id')
            ->unique()
            ->values();

        $products = Product::whereIn('product_id', $productIds)
            ->where('is_deleted', false)
            ->get()
            ->keyBy('product_id');

        $requestedByKey = [];
        $keyOrder = [];

        foreach ($items as $item) {
            $productId = (int) $item['product_id'];
            $variant = $item['variant_type'];
            $quantity = (int) $item['quantity'];
            $product = $products->get($productId);

            if (! $product) {
                abort(422, "Product {$productId} is unavailable.");
            }

            $key = $productId . ':' . $variant;
            if (! array_key_exists($key, $requestedByKey)) {
                $requestedByKey[$key] = 0;
                $keyOrder[] = $key;
            }

            $requestedByKey[$key] += $quantity;
        }

        $lines = [];
        $total = 0;

        foreach ($keyOrder as $key) {
            [$productId, $variant] = explode(':', $key, 2);
            $product = $products->get((int) $productId);
            $quantity = (int) $requestedByKey[$key];
            $available = $product->stockForVariant($variant);

            if ($quantity > $available) {
                abort(422, "Insufficient {$product->variantLabel($variant)} stock for {$product->name}. Available: {$available}");
            }

            $unitPrice = $product->unitPriceForVariant($variant);
            $lineTotal = $unitPrice * $quantity;
            $total += $lineTotal;

            $lines[] = [
                'product_id' => $product->product_id,
                'variant_type' => $variant,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
            ];
        }

        return ['lines' => $lines, 'total' => $total];
    }

    private function syncOrderItems(Order $order, array $lines): void
    {
        $order->items()->delete();

        if ($lines === []) {
            return;
        }

        DB::table('tbl_order_items')->insert([
            'order_id' => $order->order_id,
            'product_id' => implode(', ', array_map(fn ($line) => (string) $line['product_id'], $lines)),
            'variant_type' => implode(', ', array_map(fn ($line) => (string) $line['variant_type'], $lines)),
            'quantity' => implode(', ', array_map(fn ($line) => (string) $line['quantity'], $lines)),
            'unit_price' => implode(', ', array_map(fn ($line) => number_format((float) $line['unit_price'], 2, '.', ''), $lines)),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function deductStockForOrder(Order $order): void
    {
        if ($order->stock_deducted) {
            return;
        }

        DB::transaction(function () use ($order) {
            foreach ($this->parseOrderItemLines($order) as $item) {
                $product = Product::where('product_id', $item['product_id'])
                    ->lockForUpdate()
                    ->first();

                $variant = $item['variant_type'] ?? Product::VARIANT_BOTTLE;
                $available = $product?->stockForVariant($variant) ?? 0;
                $quantity = (int) ($item['quantity'] ?? 0);

                if (! $product || $available < $quantity) {
                    $name = $product?->name ?? 'Product';
                    $label = $product?->variantLabel($variant) ?? 'stock';
                    abort(422, "Insufficient {$label} stock for {$name}. Available: {$available}");
                }

                $product->decrementVariantStock($variant, $quantity);
            }

            $order->update(['stock_deducted' => true]);
        });
    }

    private function restoreStockForOrder(Order $order): void
    {
        if (! $order->stock_deducted) {
            return;
        }

        DB::transaction(function () use ($order) {
            foreach ($this->parseOrderItemLines($order) as $item) {
                $variant = $item['variant_type'] ?? Product::VARIANT_BOTTLE;
                Product::where('product_id', $item['product_id'])
                    ->first()
                    ?->incrementVariantStock($variant, (int) ($item['quantity'] ?? 0));
            }

            $order->update(['stock_deducted' => false]);
        });
    }

    private function itemValidationRules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:tbl_products,product_id'],
            'items.*.variant_type' => ['required', Rule::in(Product::validVariants())],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function loadOrders(Request $request)
    {
        $status = $request->input('status');
        $search = $request->input('search');

        $orders = Order::with(['items'])
            ->where('is_deleted', false)
            ->orderByDesc('order_id');

        if ($status && $status !== 'all') {
            $orders->where('status', $status);
        }

        if ($search) {
            $orders->where(function ($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                    ->orWhere('receiver_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $orders = $orders->paginate(5);

        $orders->getCollection()->transform(function ($order) {
            $order = $this->attachExpandedItems($order);
            $order->total_amount = collect($order->items)->sum(
                fn ($item) => (float) ($item->unit_price ?? 0) * (int) ($item->quantity ?? 0)
            );

            return $order;
        });

        return response()->json(['orders' => $orders], 200);
    }

    public function loadProductsForOrder()
    {
        $products = Product::where('is_deleted', false)
            ->orderBy('name')
            ->get(['product_id', 'name', 'price', 'bottles', 'stock_5ml', 'stock_10ml']);

        return response()->json(['products' => $products], 200);
    }

    public function storeOrder(Request $request)
    {
        $validated = $request->validate(array_merge(
            [
                'receiver_name' => ['required', 'max:120'],
                'address' => ['required', 'string'],
            ],
            $this->itemValidationRules()
        ));

        $resolved = $this->resolveOrderLines($validated['items']);

        $order = DB::transaction(function () use ($validated, $resolved, $request) {
            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'receiver_name' => $validated['receiver_name'],
                'address' => $validated['address'],
                'status' => 'pending',
                'total_amount' => $resolved['total'],
                'stock_deducted' => false,
            ]);

            $this->syncOrderItems($order, $resolved['lines']);

            ActivityLogService::recordFromRequest(
                $request,
                "created order {$order->order_code} for {$validated['receiver_name']}"
            );

            return $order;
        });

        return response()->json([
            'message' => 'Order Successfully Saved',
            'order' => $this->attachExpandedItems($order->refresh()),
        ], 200);
    }

    public function updateOrder(Request $request, Order $order)
    {
        $this->ensurePending($order);

        $validated = $request->validate(array_merge(
            [
                'receiver_name' => ['required', 'max:120'],
                'address' => ['required', 'string'],
            ],
            $this->itemValidationRules()
        ));

        $resolved = $this->resolveOrderLines($validated['items']);

        DB::transaction(function () use ($order, $validated, $resolved, $request) {
            $order->update([
                'receiver_name' => $validated['receiver_name'],
                'address' => $validated['address'],
                'total_amount' => $resolved['total'],
            ]);

            $this->syncOrderItems($order, $resolved['lines']);

            ActivityLogService::recordFromRequest($request, "updated order {$order->order_code}");
        });

        return response()->json([
            'message' => 'Order Successfully Updated',
            'order' => $this->attachExpandedItems($order->refresh()),
        ], 200);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:shipped,delivered,canceled'],
        ]);

        $this->validateStatusTransition($order, $validated['status']);

        DB::transaction(function () use ($order, $validated, $request) {
            if (in_array($validated['status'], ['shipped', 'delivered'], true)) {
                $this->deductStockForOrder($order);
            }

            if ($validated['status'] === 'canceled') {
                $this->restoreStockForOrder($order);
            }

            $order->update(['status' => $validated['status']]);

            ActivityLogService::recordFromRequest(
                $request,
                "marked order {$order->order_code} as {$validated['status']}"
            );
        });

        return response()->json([
            'message' => 'Order status updated.',
            'order' => $this->attachExpandedItems($order->refresh()),
        ], 200);
    }

    public function destroyOrder(Request $request, Order $order)
    {
        $this->ensurePending($order);

        $order->update(['status' => 'canceled']);

        ActivityLogService::recordFromRequest($request, "canceled order {$order->order_code}");

        return response()->json(['message' => 'Order Successfully Canceled.'], 200);
    }
}
