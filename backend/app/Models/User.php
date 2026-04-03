<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'hospital_name',
        'blood_center_name',
        'is_active',
        'is_super_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_super_admin' => 'boolean',
        ];
    }

    /**
     * العلاقات
     */
    
    // المستشفى لديه عدة طلبات
    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    // الطلبات التي تمت معالجتها بواسطة هذا المستخدم
    public function treatedDemandes()
    {
        return $this->hasMany(Demande::class, 'treated_by');
    }

    // عمليات النقل التي تمت بواسطة هذا المستخدم
    public function transfusions()
    {
        return $this->hasMany(Transfusion::class, 'processed_by');
    }

    // سجل النشاطات الخاصة بهذا المستخدم
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    // الإشعارات الخاصة بهذا المستخدم
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Helper methods
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isHospital()
    {
        return $this->role === 'hospital';
    }

    public function isBloodCenter()
    {
        return $this->role === 'blood_center';
    }
}