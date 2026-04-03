<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'is_read',
        'related_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * العلاقات
     */

    // المستخدم الذي له هذا الإشعار
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper methods
     */
    public function markAsRead()
    {
        $this->is_read = true;
        $this->save();
    }

    public static function createNotification($userId, $title, $message, $type, $relatedId = null)
    {
        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'related_id' => $relatedId,
        ]);
    }
}
