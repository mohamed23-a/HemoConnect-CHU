<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfusion extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'blood_type',
        'quantity',
        'processed_by',
        'processed_at',
        'notes',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    /**
     * العلاقات
     */
    
    // الطلب المرتبط بهذه العملية
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    // الموظف الذي نفذ العملية
    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}