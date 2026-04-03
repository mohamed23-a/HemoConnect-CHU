<?php

namespace App\Services;

use App\Models\BloodStock;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * التحقق من توفر المخزون لطلب معين
     */
    public function checkAvailability($bloodType, $quantity)
    {
        $stock = BloodStock::where('blood_type', $bloodType)->first();
        
        if (!$stock) {
            return [
                'available' => false,
                'message' => "لا يوجد مخزون مسجل لفصيلة {$bloodType}",
                'current_stock' => 0
            ];
        }
        
        if ($stock->quantity < $quantity) {
            return [
                'available' => false,
                'message' => "المخزون غير كافٍ. المتوفر: {$stock->quantity} وحدة، المطلوب: {$quantity} وحدة",
                'current_stock' => $stock->quantity
            ];
        }
        
        return [
            'available' => true,
            'message' => 'المخزون كافٍ',
            'current_stock' => $stock->quantity,
            'stock' => $stock
        ];
    }
    
    /**
     * خصم المخزون لطلب معين
     */
    public function deductForDemande($demande, $userId)
    {
        return DB::transaction(function () use ($demande, $userId) {
            $stock = BloodStock::where('blood_type', $demande->blood_type)
                ->lockForUpdate()
                ->first();
            
            if (!$stock || $stock->quantity < $demande->quantity) {
                throw new \Exception('المخزون غير كافٍ');
            }
            
            $oldQuantity = $stock->quantity;
            $stock->deductQuantity($demande->quantity);
            
            // تسجيل النشاط
            ActivityLog::log(
                $userId,
                'stock_deducted_for_demande',
                "تم خصم {$demande->quantity} وحدة من فصيلة {$demande->blood_type} للطلب #{$demande->id}",
                ['old_quantity' => $oldQuantity],
                ['new_quantity' => $stock->quantity, 'demande_id' => $demande->id]
            );
            
            // التحقق من انخفاض المخزون وإرسال تنبيه
            if ($stock->isLow()) {
                $this->sendLowStockAlert($stock);
            }
            
            return $stock;
        });
    }
    
    /**
     * إرسال تنبيه انخفاض المخزون
     */
    public function sendLowStockAlert($stock)
    {
        $users = User::whereIn('role', ['blood_center', 'admin'])
            ->where('is_active', true)
            ->get();
        
        foreach ($users as $user) {
            Notification::createNotification(
                $user->id,
                '⚠️ تنبيه: مخزون منخفض',
                "مخزون فصيلة {$stock->blood_type} منخفض: {$stock->quantity} وحدة متبقية (الحد الأدنى: {$stock->minimum_threshold})",
                'low_stock_alert',
                $stock->id
            );
        }
    }
    
    /**
     * الحصول على إحصائيات المخزون
     */
    public function getStockStats()
    {
        $stocks = BloodStock::all();
        
        return [
            'total_units' => $stocks->sum('quantity'),
            'low_stock_count' => $stocks->filter(function($stock) {
                return $stock->quantity <= $stock->minimum_threshold && $stock->quantity > 0;
            })->count(),
            'out_of_stock_count' => $stocks->where('quantity', 0)->count(),
            'healthy_stock_count' => $stocks->filter(function($stock) {
                return $stock->quantity > $stock->minimum_threshold;
            })->count(),
            'by_type' => $stocks->map(function($stock) {
                return [
                    'blood_type' => $stock->blood_type,
                    'quantity' => $stock->quantity,
                    'status' => $stock->status,
                    'percentage' => $stock->minimum_threshold > 0 
                        ? min(100, ($stock->quantity / $stock->minimum_threshold) * 100)
                        : 0
                ];
            })
        ];
    }
    
    /**
     * إضافة مخزون جديد
     */
    public function addStock($bloodType, $quantity, $userId, $notes = null)
    {
        return DB::transaction(function () use ($bloodType, $quantity, $userId, $notes) {
            $stock = BloodStock::where('blood_type', $bloodType)->first();
            $oldQuantity = $stock ? $stock->quantity : 0;
            
            if ($stock) {
                $stock->addQuantity($quantity);
            } else {
                $stock = BloodStock::create([
                    'blood_type' => $bloodType,
                    'quantity' => $quantity,
                    'minimum_threshold' => 5,
                    'last_updated' => now(),
                ]);
            }
            
            ActivityLog::log(
                $userId,
                'stock_added',
                "تمت إضافة {$quantity} وحدة من فصيلة {$bloodType}" . ($notes ? " - {$notes}" : ""),
                ['old_quantity' => $oldQuantity],
                ['new_quantity' => $stock->quantity, 'added' => $quantity]
            );
            
            return $stock;
        });
    }
}