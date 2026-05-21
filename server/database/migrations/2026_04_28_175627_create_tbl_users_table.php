<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('profile_picture', 255)->nullable();
            $table->string('name', 120);
            $table->unsignedBigInteger('role_id');
            $table->string('username', 55)->unique();
            $table->string('password', 255);
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();

            $table->foreign('role_id')
                ->references('role_id')
                ->on('tbl_roles')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_users');
    }
};
