<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_products', function (Blueprint $table) {
            $table->id('product_id');
            $table->string('name', 120);
            $table->decimal('price', 12, 2);
            $table->text('description')->nullable();
            $table->string('photo', 255)->nullable();
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_products');
    }
};
