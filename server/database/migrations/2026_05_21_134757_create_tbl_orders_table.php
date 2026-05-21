<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->string('order_code', 20)->unique();
            $table->unsignedBigInteger('product_id');
            $table->string('receiver_name', 120);
            $table->text('address');
            $table->enum('status', ['pending', 'shipped', 'delivered', 'canceled'])->default('pending');
            $table->decimal('total_amount', 12, 2);
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();

            $table->foreign('product_id')
                ->references('product_id')
                ->on('tbl_products')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_orders');
    }
};
