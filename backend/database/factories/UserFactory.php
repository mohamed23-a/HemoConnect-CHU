<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = $this->faker->randomElement(['admin', 'hospital', 'blood_center']);
        
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => $role,
            'hospital_name' => $role === 'hospital' ? $this->faker->company() . ' Hospital' : null,
            'blood_center_name' => $role === 'blood_center' ? $this->faker->company() . ' Blood Center' : null,
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
    
    /**
     * Indicate that the user is admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'hospital_name' => null,
            'blood_center_name' => null,
        ]);
    }
    
    /**
     * Indicate that the user is hospital.
     */
    public function hospital(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'hospital',
            'hospital_name' => $this->faker->company() . ' Hospital',
            'blood_center_name' => null,
        ]);
    }
    
    /**
     * Indicate that the user is blood center.
     */
    public function bloodCenter(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'blood_center',
            'hospital_name' => null,
            'blood_center_name' => $this->faker->company() . ' Blood Center',
        ]);
    }
}