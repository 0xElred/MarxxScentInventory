<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('tbl_products', 'stock') && ! Schema::hasColumn('tbl_products', 'bottles')) {
            Schema::table('tbl_products', function (Blueprint $table) {
                $table->renameColumn('stock', 'bottles');
            });
        }

        if (! Schema::hasColumn('tbl_products', 'bottles')) {
            Schema::table('tbl_products', function (Blueprint $table) {
                $table->unsignedInteger('bottles')->default(0)->after('price');
            });
        }

        if (! Schema::hasColumn('tbl_products', 'stock_5ml')) {
            Schema::table('tbl_products', function (Blueprint $table) {
                $table->unsignedInteger('stock_5ml')->default(0)->after('bottles');
            });
        }

        if (! Schema::hasColumn('tbl_products', 'stock_10ml')) {
            Schema::table('tbl_products', function (Blueprint $table) {
                $table->unsignedInteger('stock_10ml')->default(0)->after('stock_5ml');
            });
        }

        if (! Schema::hasColumn('tbl_order_items', 'variant_type')) {
            Schema::table('tbl_order_items', function (Blueprint $table) {
                $table->enum('variant_type', ['bottle', '5ml', '10ml'])->default('bottle')->after('product_id');
            });

            DB::table('tbl_order_items')->update(['variant_type' => 'bottle']);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tbl_order_items', 'variant_type')) {
            Schema::table('tbl_order_items', function (Blueprint $table) {
                $table->dropColumn('variant_type');
            });
        }

        if (Schema::hasColumn('tbl_products', 'stock_10ml')) {
            Schema::table('tbl_products', function (Blueprint $table) {
                $table->dropColumn('stock_10ml');
            });
        }

        if (Schema::hasColumn('tbl_products', 'stock_5ml')) {
            Schema::table('tbl_products', function (Blueprint $table) {
                $table->dropColumn('stock_5ml');
            });
        }

        if (Schema::hasColumn('tbl_products', 'bottles') && ! Schema::hasColumn('tbl_products', 'stock')) {
            Schema::table('tbl_products', function (Blueprint $table) {
                $table->renameColumn('bottles', 'stock');
            });
        }
    }
};
