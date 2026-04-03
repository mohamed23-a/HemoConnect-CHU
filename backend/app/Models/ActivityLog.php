<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'old_data',
        'new_data',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    /**
     * العلاقات
     */

    // المستخدم الذي قام بالنشاط
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper method to log activity
     */
    public static function log($userId, $action, $description, $oldData = null, $newData = null)
    {
        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
