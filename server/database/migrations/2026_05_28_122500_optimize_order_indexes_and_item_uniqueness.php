<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Merge duplicate lines per order/product/variant before enforcing uniqueness.
        $duplicates = DB::table('tbl_order_items')
            ->select(
                'order_id',
                'product_id',
                'variant_type',
                DB::raw('COUNT(*) as line_count'),
                DB::raw('SUM(quantity) as total_quantity')
            )
            ->groupBy('order_id', 'product_id', 'variant_type')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            $keeper = DB::table('tbl_order_items')
                ->where('order_id', $duplicate->order_id)
                ->where('product_id', $duplicate->product_id)
                ->where('variant_type', $duplicate->variant_type)
                ->orderBy('order_item_id')
                ->first();

            if (! $keeper) {
                continue;
            }

            DB::table('tbl_order_items')
                ->where('order_item_id', $keeper->order_item_id)
                ->update([
                    'quantity' => (int) $duplicate->total_quantity,
                    'updated_at' => now(),
                ]);

            DB::table('tbl_order_items')
                ->where('order_id', $duplicate->order_id)
                ->where('product_id', $duplicate->product_id)
                ->where('variant_type', $duplicate->variant_type)
                ->where('order_item_id', '!=', $keeper->order_item_id)
                ->delete();
        }

        Schema::table('tbl_order_items', function (Blueprint $table) {
            $table->unique(
                ['order_id', 'product_id', 'variant_type'],
                'uq_order_items_order_product_variant'
            );
            $table->index(['order_id', 'created_at'], 'idx_order_items_order_created');
            $table->index(['product_id', 'variant_type'], 'idx_order_items_product_variant');
        });

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->index(['is_deleted', 'status', 'order_id'], 'idx_orders_visibility_status_id');
            $table->index('created_at', 'idx_orders_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_visibility_status_id');
            $table->dropIndex('idx_orders_created_at');
        });

        Schema::table('tbl_order_items', function (Blueprint $table) {
            $table->dropUnique('uq_order_items_order_product_variant');
            $table->dropIndex('idx_order_items_order_created');
            $table->dropIndex('idx_order_items_product_variant');
        });
    }
};
