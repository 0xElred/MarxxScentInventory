<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_order_items', function (Blueprint $table) {
            try {
                $table->dropForeign(['product_id']);
            } catch (\Throwable $e) {
            }

            try {
                $table->dropUnique('uq_order_items_order_product_variant');
            } catch (\Throwable $e) {
            }

            try {
                $table->dropIndex('idx_order_items_product_variant');
            } catch (\Throwable $e) {
            }
        });

        DB::statement('ALTER TABLE tbl_order_items MODIFY product_id TEXT NOT NULL');
        DB::statement('ALTER TABLE tbl_order_items MODIFY variant_type TEXT NOT NULL');
        DB::statement('ALTER TABLE tbl_order_items MODIFY quantity TEXT NOT NULL');
        DB::statement('ALTER TABLE tbl_order_items MODIFY unit_price TEXT NOT NULL');

        $orders = DB::table('tbl_order_items')
            ->select('order_id')
            ->groupBy('order_id')
            ->get();

        foreach ($orders as $order) {
            $rows = DB::table('tbl_order_items')
                ->where('order_id', $order->order_id)
                ->orderBy('order_item_id')
                ->get();

            if ($rows->isEmpty()) {
                continue;
            }

            $first = $rows->first();
            $productIds = $rows->pluck('product_id')->map(fn ($v) => trim((string) $v))->all();
            $variants = $rows->pluck('variant_type')->map(fn ($v) => trim((string) $v))->all();
            $quantities = $rows->pluck('quantity')->map(fn ($v) => trim((string) $v))->all();
            $unitPrices = $rows->pluck('unit_price')->map(fn ($v) => number_format((float) $v, 2, '.', ''))->all();

            DB::table('tbl_order_items')
                ->where('order_item_id', $first->order_item_id)
                ->update([
                    'product_id' => implode(', ', $productIds),
                    'variant_type' => implode(', ', $variants),
                    'quantity' => implode(', ', $quantities),
                    'unit_price' => implode(', ', $unitPrices),
                    'updated_at' => now(),
                ]);

            DB::table('tbl_order_items')
                ->where('order_id', $order->order_id)
                ->where('order_item_id', '!=', $first->order_item_id)
                ->delete();
        }

        Schema::table('tbl_order_items', function (Blueprint $table) {
            $table->unique('order_id', 'uq_order_items_single_row_per_order');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_order_items', function (Blueprint $table) {
            try {
                $table->dropUnique('uq_order_items_single_row_per_order');
            } catch (\Throwable $e) {
            }
        });
    }
};
