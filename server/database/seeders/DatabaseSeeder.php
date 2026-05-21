<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['is_deleted' => false]
        );
        $staffRole = Role::firstOrCreate(
            ['name' => 'staff'],
            ['is_deleted' => false]
        );

        $carl = User::firstOrCreate(
            ['username' => 'carlmarvin'],
            [
                'name' => 'Carl Marvin',
                'password' => 'password123',
                'role_id' => $adminRole->role_id,
                'is_deleted' => false,
            ]
        );

        User::firstOrCreate(
            ['username' => 'johndoe'],
            [
                'name' => 'John Doe',
                'password' => 'johndoe123',
                'role_id' => $staffRole->role_id,
                'is_deleted' => false,
            ]
        );

        $sauvage = Product::firstOrCreate(
            ['name' => 'Sauvage'],
            [
                'price' => 1111.00,
                'description' => 'Dior Sauvage Eau de Parfum',
                'is_deleted' => false,
            ]
        );

        Product::firstOrCreate(
            ['name' => 'Bleu de Chanel'],
            [
                'price' => 899.00,
                'description' => 'Chanel Bleu de Chanel Eau de Parfum',
                'is_deleted' => false,
            ]
        );

        if (! Order::where('order_code', '20260521-001')->exists()) {
            Order::create([
                'order_code' => '20260521-001',
                'product_id' => $sauvage->product_id,
                'receiver_name' => 'Legmabols',
                'address' => 'Vigo, Spain',
                'status' => 'pending',
                'total_amount' => $sauvage->price,
            ]);
        }

        if (ActivityLog::count() === 0) {
            ActivityLogService::record($carl, 'logged in');
            ActivityLog::create([
                'user_id' => $carl->user_id,
                'user_name' => 'John Doe',
                'activity' => 'logged in',
                'created_at' => now()->subMinutes(3),
                'updated_at' => now()->subMinutes(3),
            ]);
            ActivityLog::create([
                'user_id' => null,
                'user_name' => 'John Mew',
                'activity' => 'logged in',
                'created_at' => now()->subMinutes(4),
                'updated_at' => now()->subMinutes(4),
            ]);
        }
    }
}
