<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tbl_orders', 'order_lines')) {
            return;
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropColumn('order_lines');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('tbl_orders', 'order_lines')) {
            return;
        }

        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->json('order_lines')->nullable()->after('total_amount');
        });
    }
};
