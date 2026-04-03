<?php

namespace Database\Seeders;

use App\Models\BloodStock;
use App\Models\Demande;
use App\Models\Notification;
use App\Models\Transfusion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. إنشاء المستخدمين
        $this->createUsers();

        // 2. إنشاء المخزون الأولي
        $this->createBloodStock();

        // 3. إنشاء طلبات تجريبية
        $this->createDemandes();

        // 4. إنشاء عمليات نقل
        $this->createTransfusions();

        // 5. إنشاء إشعارات
        $this->createNotifications();
    }

    private function createUsers(): void
    {
        // Admin
        User::create([
            'name' => 'Admin System',
            'email' => 'admin@transfusion.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Blood Center
        User::create([
            'name' => 'Centre Regional de Transfusion',
            'email' => 'bloodcenter@transfusion.com',
            'password' => Hash::make('password'),
            'role' => 'blood_center',
            'blood_center_name' => 'Centre Regional de Transfusion Sanguine',
            'is_active' => true,
        ]);

        // Hospitals
        $hospitals = [
            ['name' => 'Hopital Ibn Sina', 'email' => 'ibnsina@hospital.com'],
            ['name' => 'Hopital Cheikh Zaid', 'email' => 'cheikhzaid@hospital.com'],
            ['name' => 'Hopital Militaire', 'email' => 'militaire@hospital.com'],
        ];

        foreach ($hospitals as $hospital) {
            User::create([
                'name' => $hospital['name'],
                'email' => $hospital['email'],
                'password' => Hash::make('password'),
                'role' => 'hospital',
                'hospital_name' => $hospital['name'],
                'is_active' => true,
            ]);
        }

        // Create 10 additional random users using factory
        User::factory(10)->create();
    }

    private function createBloodStock(): void
    {
        $bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        foreach ($bloodTypes as $type) {
            BloodStock::create([
                'blood_type' => $type,
                'quantity' => rand(10, 50),
                'minimum_threshold' => 5,
                'last_updated' => now(),
            ]);
        }
    }

    private function createDemandes(): void
    {
        // Create 50 demandes using factory
        Demande::factory(50)->create();

        // Create some specific demandes for testing
        $hospital = User::where('role', 'hospital')->first();

        if ($hospital) {
            // Pending demande
            Demande::create([
                'user_id' => $hospital->id,
                'patient_name' => 'Test Patient',
                'patient_age' => 35,
                'blood_type' => 'O+',
                'quantity' => 3,
                'reason' => 'Urgent surgery requirement',
                'urgency' => 'urgent',
                'status' => 'pending',
                'notes' => 'Patient needs blood before surgery',
            ]);

            // Approved demande
            $bloodCenter = User::where('role', 'blood_center')->first();
            Demande::create([
                'user_id' => $hospital->id,
                'patient_name' => 'Approved Patient',
                'patient_age' => 42,
                'blood_type' => 'A+',
                'quantity' => 2,
                'reason' => 'Anemia treatment',
                'urgency' => 'normal',
                'status' => 'approved',
                'treated_by' => $bloodCenter?->id,
                'treated_at' => now(),
            ]);
        }
    }

    private function createTransfusions(): void
    {
        $approvedDemandes = Demande::where('status', 'approved')->get();
        $bloodCenter = User::where('role', 'blood_center')->first();

        foreach ($approvedDemandes as $demande) {
            Transfusion::create([
                'demande_id' => $demande->id,
                'blood_type' => $demande->blood_type,
                'quantity' => $demande->quantity,
                'processed_by' => $bloodCenter?->id ?? 2,
                'processed_at' => now(),
                'notes' => 'Transfusion completed successfully',
            ]);

            // Update demande status to completed
            $demande->complete();
        }
    }

    private function createNotifications(): void
    {
        $users = User::all();

        foreach ($users->take(5) as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Welcome to A-Transfusion',
                'message' => 'Welcome to the blood transfusion management system.',
                'type' => 'welcome',
                'is_read' => false,
            ]);
        }

        // Notification for low stock
        $bloodCenter = User::where('role', 'blood_center')->first();
        if ($bloodCenter) {
            Notification::create([
                'user_id' => $bloodCenter->id,
                'title' => 'Low Stock Alert',
                'message' => 'Blood type O- is running low. Current stock: 3 units.',
                'type' => 'stock_alert',
                'is_read' => false,
            ]);
        }
    }
}
