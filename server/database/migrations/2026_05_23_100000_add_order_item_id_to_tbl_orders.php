<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('tbl_orders', 'order_item_id')) {
            return;
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('order_item_id')->nullable()->after('order_id');
        });

        $orders = DB::table('tbl_orders')->pluck('order_id');

        foreach ($orders as $orderId) {
            $orderItemId = DB::table('tbl_order_items')
                ->where('order_id', $orderId)
                ->orderBy('order_item_id')
                ->value('order_item_id');

            if ($orderItemId) {
                DB::table('tbl_orders')
                    ->where('order_id', $orderId)
                    ->update(['order_item_id' => $orderItemId]);
            }
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->foreign('order_item_id')
                ->references('order_item_id')
                ->on('tbl_order_items')
                ->onUpdate('cascade')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tbl_orders', 'order_item_id')) {
            return;
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropForeign(['order_item_id']);
            $table->dropColumn('order_item_id');
        });
    }
};
