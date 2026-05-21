<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role_id' => Role::inRandomOrder()->first()?->role_id ?? 1,
            'username' => strtolower(fake()->unique()->userName()),
            'password' => 'sample123',
        ];
    }
}
