<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'blood_type',
        'quantity',
        'minimum_threshold',
        'last_updated',
    ];

    protected $casts = [
        'last_updated' => 'datetime',
    ];

    /**
     * Helper methods
     */

    // التحقق من وجود كمية كافية
    public function hasEnoughQuantity($requestedQuantity)
    {
        return $this->quantity >= $requestedQuantity;
    }

    // خصم كمية من المخزون
    public function deductQuantity($quantity)
    {
        $this->quantity -= $quantity;
        $this->last_updated = now();
        $this->save();

        return $this;
    }

    // إضافة كمية إلى المخزون
    public function addQuantity($quantity)
    {
        $this->quantity += $quantity;
        $this->last_updated = now();
        $this->save();

        return $this;
    }

    // التحقق من أن المخزون منخفض
    public function isLow()
    {
        return $this->quantity <= $this->minimum_threshold;
    }

    // الحصول على حالة المخزون
    public function getStatusAttribute()
    {
        if ($this->quantity <= 0) {
            return 'out_of_stock';
        }
        if ($this->quantity <= $this->minimum_threshold) {
            return 'low';
        }

        return 'available';
    }
}
