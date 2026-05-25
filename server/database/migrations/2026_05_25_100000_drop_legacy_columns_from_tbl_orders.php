<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('tbl_orders', 'order_item_id')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->dropForeign(['order_item_id']);
                $table->dropColumn('order_item_id');
            });
        }

        if (Schema::hasColumn('tbl_orders', 'product_id')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->dropForeign(['product_id']);
                $table->dropColumn('product_id');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tbl_orders', 'order_item_id')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('order_item_id')->nullable()->after('order_id');
            });
        }

        if (! Schema::hasColumn('tbl_orders', 'product_id')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id')->nullable()->after('order_id');
            });
        }

        if (Schema::hasColumn('tbl_orders', 'order_item_id')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->foreign('order_item_id')
                    ->references('order_item_id')
                    ->on('tbl_order_items')
                    ->onUpdate('cascade')
                    ->onDelete('set null');
            });
        }

        if (Schema::hasColumn('tbl_orders', 'product_id')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->foreign('product_id')
                    ->references('product_id')
                    ->on('tbl_products')
                    ->onUpdate('cascade')
                    ->onDelete('restrict');
            });
        }
    }
};
