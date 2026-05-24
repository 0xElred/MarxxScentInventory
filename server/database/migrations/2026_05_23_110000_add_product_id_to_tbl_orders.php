<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('tbl_orders', 'product_id')) {
            return;
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable()->after('order_item_id');
        });

        $orders = DB::table('tbl_orders')->get(['order_id', 'order_item_id']);

        foreach ($orders as $order) {
            $productId = null;

            if ($order->order_item_id) {
                $productId = DB::table('tbl_order_items')
                    ->where('order_item_id', $order->order_item_id)
                    ->value('product_id');
            }

            if (! $productId) {
                $productId = DB::table('tbl_order_items')
                    ->where('order_id', $order->order_id)
                    ->orderBy('order_item_id')
                    ->value('product_id');
            }

            if ($productId) {
                DB::table('tbl_orders')
                    ->where('order_id', $order->order_id)
                    ->update(['product_id' => $productId]);
            }
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->foreign('product_id')
                ->references('product_id')
                ->on('tbl_products')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tbl_orders', 'product_id')) {
            return;
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
        });
    }
};
