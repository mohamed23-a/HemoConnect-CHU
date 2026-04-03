<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Demande;
use App\Models\BloodStock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemandeTest extends TestCase
{
    use RefreshDatabase;

    protected $hospitalUser;
    protected $bloodCenterUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->hospitalUser = User::factory()->create([
            'role' => 'hospital',
            'is_active' => true,
        ]);

        $this->bloodCenterUser = User::factory()->create([
            'role' => 'blood_center',
            'is_active' => true,
        ]);
        
        // Initialize some stock safely
        BloodStock::create([
            'blood_type' => 'O+',
            'quantity' => 10,
            'minimum_threshold' => 5,
            'last_updated' => now(),
        ]);
    }

    public function test_hospital_can_create_demande()
    {
        $response = $this->actingAs($this->hospitalUser)->postJson('/api/demandes', [
            'patient_name' => 'John Doe',
            'patient_age' => 30,
            'blood_type' => 'O+',
            'quantity' => 2,
            'reason' => 'Surgery',
            'urgency' => 'normal',
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment(['patient_name' => 'John Doe']);
                 
        $this->assertDatabaseHas('demandes', ['patient_name' => 'John Doe']);
    }

    public function test_blood_center_cannot_create_demande()
    {
        $response = $this->actingAs($this->bloodCenterUser)->postJson('/api/demandes', [
            'patient_name' => 'John Doe',
            'patient_age' => 30,
            'blood_type' => 'O+',
            'quantity' => 2,
            'reason' => 'Surgery',
            'urgency' => 'normal',
        ]);

        // Should be forbidden because they are not a hospital
        $response->assertStatus(403);
    }
    
    public function test_blood_center_can_approve_demande_if_stock_sufficient()
    {
        $demande = Demande::create([
            'user_id' => $this->hospitalUser->id,
            'patient_name' => 'Jane Doe',
            'patient_age' => 45,
            'blood_type' => 'O+',
            'quantity' => 5,
            'reason' => 'Accident',
            'urgency' => 'emergency',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->bloodCenterUser)->postJson("/api/demandes/{$demande->id}/approve");

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('demandes', [
            'id' => $demande->id,
            'status' => 'approved',
        ]);
    }
}
