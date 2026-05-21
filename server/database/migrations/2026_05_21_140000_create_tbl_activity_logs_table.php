<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_activity_logs', function (Blueprint $table) {
            $table->id('activity_log_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name', 120);
            $table->string('activity', 500);
            $table->timestamps();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('tbl_users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_activity_logs');
    }
};
