<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'patient_name',
        'patient_age',
        'blood_type',
        'product_type',
        'quantity',
        'reason',
        'urgency',
        'status',
        'rejection_reason',
        'treated_by',
        'treated_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'treated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * العلاقات
     */

    // المستشفى الذي أنشأ الطلب
    public function hospital()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // الموظف الذي عالج الطلب (من مركز الدم)
    public function treatedBy()
    {
        return $this->belongsTo(User::class, 'treated_by');
    }

    // عملية النقل المرتبطة بهذا الطلب (إذا تم قبوله)
    public function transfusion()
    {
        return $this->hasOne(Transfusion::class);
    }

    /**
     * Helper methods
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function canBeProcessed()
    {
        return $this->status === 'pending';
    }

    public function approve($userId)
    {
        $this->status = 'approved';
        $this->treated_by = $userId;
        $this->treated_at = now();
        $this->save();
    }

    public function reject($userId, $reason)
    {
        $this->status = 'rejected';
        $this->treated_by = $userId;
        $this->treated_at = now();
        $this->rejection_reason = $reason;
        $this->save();
    }

    public function complete()
    {
        $this->status = 'completed';
        $this->completed_at = now();
        $this->save();
    }
}
