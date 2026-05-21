<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class OrderController extends Controller
{
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

    public function loadOrders(Request $request)
    {
        $status = $request->input('status');
        $search = $request->input('search');

        $orders = Order::with('product')
            ->where('is_deleted', false)
            ->orderByDesc('created_at');

        if ($status && $status !== 'all') {
            $orders->where('status', $status);
        }

        if ($search) {
            $orders->where(function ($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                    ->orWhere('receiver_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($product) use ($search) {
                        $product->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $orders->paginate(15);

        return response()->json(['orders' => $orders], 200);
    }

    public function loadProductsForOrder()
    {
        $products = Product::where('is_deleted', false)
            ->orderBy('name')
            ->get(['product_id', 'name', 'price']);

        return response()->json(['products' => $products], 200);
    }

    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:tbl_products,product_id'],
            'receiver_name' => ['required', 'max:120'],
            'address' => ['required', 'string'],
        ]);

        $product = Product::where('product_id', $validated['product_id'])
            ->where('is_deleted', false)
            ->firstOrFail();

        $order = Order::create([
            'order_code' => $this->generateOrderCode(),
            'product_id' => $product->product_id,
            'receiver_name' => $validated['receiver_name'],
            'address' => $validated['address'],
            'status' => 'pending',
            'total_amount' => $product->price,
        ]);

        ActivityLogService::recordFromRequest(
            $request,
            "created order {$order->order_code} for {$validated['receiver_name']}"
        );

        return response()->json([
            'message' => 'Order Successfully Saved',
            'order' => $order->load('product'),
        ], 200);
    }

    public function updateOrder(Request $request, Order $order)
    {
        $this->ensurePending($order);

        $validated = $request->validate([
            'product_id' => ['required', 'exists:tbl_products,product_id'],
            'receiver_name' => ['required', 'max:120'],
            'address' => ['required', 'string'],
        ]);

        $product = Product::where('product_id', $validated['product_id'])
            ->where('is_deleted', false)
            ->firstOrFail();

        $order->update([
            'product_id' => $product->product_id,
            'receiver_name' => $validated['receiver_name'],
            'address' => $validated['address'],
            'total_amount' => $product->price,
        ]);

        ActivityLogService::recordFromRequest($request, "updated order {$order->order_code}");

        return response()->json([
            'message' => 'Order Successfully Updated',
            'order' => $order->load('product'),
        ], 200);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:shipped,delivered,canceled'],
        ]);

        $this->validateStatusTransition($order, $validated['status']);

        $order->update(['status' => $validated['status']]);

        ActivityLogService::recordFromRequest(
            $request,
            "marked order {$order->order_code} as {$validated['status']}"
        );

        return response()->json([
            'message' => 'Order status updated.',
            'order' => $order->load('product'),
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
