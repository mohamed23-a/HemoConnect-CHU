<?php

namespace App\Listeners;

use App\Events\DemandeCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleNewDemande implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(DemandeCreated $event): void
    {
        $demande = $event->demande;
        
        // إرسال إشعارات لجميع مستخدمي مركز الدم
        $bloodCenterUsers = User::where('role', 'blood_center')
            ->where('is_active', true)
            ->get();
        
        $urgencyMessage = match($demande->urgency) {
            'emergency' => '⚠️ طلب طارئ جداً!',
            'urgent' => '⚡ طلب عاجل!',
            default => 'طلب جديد',
        };
        
        foreach ($bloodCenterUsers as $user) {
            Notification::createNotification(
                $user->id,
                $urgencyMessage,
                "طلب نقل دم {$demande->blood_type} للمريض {$demande->patient_name} بكمية {$demande->quantity} وحدة",
                'new_demande',
                $demande->id
            );
        }
        
        // إذا كان الطلب طارئاً، إرسال إشعار إضافي للمسؤول
        if ($demande->urgency === 'emergency') {
            $admins = User::where('role', 'admin')->where('is_active', true)->get();
            foreach ($admins as $admin) {
                Notification::createNotification(
                    $admin->id,
                    '🚨 طلب طارئ',
                    "طلب نقل دم طارئ للمريض {$demande->patient_name}",
                    'emergency_demande',
                    $demande->id
                );
            }
        }
    }
}