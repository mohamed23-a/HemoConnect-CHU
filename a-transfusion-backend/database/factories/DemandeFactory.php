<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Demande>
 */
class DemandeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        $statuses = ['pending', 'approved', 'rejected', 'completed'];
        $urgencies = ['normal', 'urgent', 'emergency'];
        
        return [
            'user_id' => User::where('role', 'hospital')->inRandomOrder()->first()?->id ?? 1,
            'patient_name' => $this->faker->name(),
            'patient_age' => $this->faker->numberBetween(1, 100),
            'blood_type' => $this->faker->randomElement($bloodTypes),
            'quantity' => $this->faker->numberBetween(1, 10),
            'reason' => $this->faker->sentence(),
            'urgency' => $this->faker->randomElement($urgencies),
            'status' => $this->faker->randomElement($statuses),
            'rejection_reason' => null,
            'treated_by' => null,
            'treated_at' => null,
            'completed_at' => null,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
    
    /**
     * Indicate that the demande is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'treated_by' => null,
            'treated_at' => null,
        ]);
    }
    
    /**
     * Indicate that the demande is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'treated_by' => User::where('role', 'blood_center')->inRandomOrder()->first()?->id ?? 2,
            'treated_at' => now(),
        ]);
    }
    
    /**
     * Indicate that the demande is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'treated_by' => User::where('role', 'blood_center')->inRandomOrder()->first()?->id ?? 2,
            'treated_at' => now()->subDays(2),
            'completed_at' => now()->subDay(),
        ]);
    }
}