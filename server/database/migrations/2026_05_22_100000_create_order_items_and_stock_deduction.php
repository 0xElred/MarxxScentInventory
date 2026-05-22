<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_order_items', function (Blueprint $table) {
            $table->id('order_item_id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id');
            $table->enum('variant_type', ['bottle', '5ml', '10ml'])->default('bottle');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->timestamps();

            $table->foreign('order_id')
                ->references('order_id')
                ->on('tbl_orders')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('product_id')
                ->references('product_id')
                ->on('tbl_products')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });

        if (! Schema::hasColumn('tbl_orders', 'stock_deducted')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->tinyInteger('stock_deducted')->default(false)->after('status');
            });
        }

        if (Schema::hasColumn('tbl_orders', 'product_id')) {
            $orders = DB::table('tbl_orders')->whereNotNull('product_id')->get();

            foreach ($orders as $order) {
                $product = DB::table('tbl_products')
                    ->where('product_id', $order->product_id)
                    ->first();

                if (! $product) {
                    continue;
                }

                $exists = DB::table('tbl_order_items')
                    ->where('order_id', $order->order_id)
                    ->exists();

                if (! $exists) {
                    DB::table('tbl_order_items')->insert([
                        'order_id' => $order->order_id,
                        'product_id' => $order->product_id,
                        'variant_type' => 'bottle',
                        'quantity' => 1,
                        'unit_price' => $product->price,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at,
                    ]);
                }
            }

            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->dropForeign(['product_id']);
                $table->dropColumn('product_id');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tbl_orders', 'product_id')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id')->nullable()->after('order_code');
            });

            $items = DB::table('tbl_order_items')->orderBy('order_item_id')->get();

            foreach ($items as $item) {
                DB::table('tbl_orders')
                    ->where('order_id', $item->order_id)
                    ->update(['product_id' => $item->product_id]);
            }

            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->foreign('product_id')
                    ->references('product_id')
                    ->on('tbl_products')
                    ->onUpdate('cascade')
                    ->onDelete('restrict');
            });
        }

        if (Schema::hasColumn('tbl_orders', 'stock_deducted')) {
            Schema::table('tbl_orders', function (Blueprint $table) {
                $table->dropColumn('stock_deducted');
            });
        }

        Schema::dropIfExists('tbl_order_items');
    }
};
