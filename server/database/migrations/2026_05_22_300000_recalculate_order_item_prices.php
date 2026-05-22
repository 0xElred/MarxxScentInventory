<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $items = OrderItem::with('product')->get();

        foreach ($items as $item) {
            if (! $item->product) {
                continue;
            }

            $variant = $item->variant_type ?? Product::VARIANT_BOTTLE;
            $unitPrice = $item->product->unitPriceForVariant($variant);

            $item->update(['unit_price' => $unitPrice]);
        }

        $orders = Order::with('items')->get();

        foreach ($orders as $order) {
            $total = $order->items->sum(fn ($item) => (float) $item->unit_price * (int) $item->quantity);
            $order->update(['total_amount' => $total]);
        }
    }

    public function down(): void
    {
        // Prices cannot be restored to previous incorrect values.
    }
};
