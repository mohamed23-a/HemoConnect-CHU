<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * تسجيل الدخول
     */
    public function login(Request $request)
    {
        // التحقق من صحة البيانات
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // البحث عن المستخدم
        $user = User::where('email', $request->email)->first();

        // التحقق من وجود المستخدم وكلمة المرور
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // التحقق من أن المستخدم نشط
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is deactivated. Please contact administrator.'
            ], 403);
        }

        // حذف التوكنات القديمة (اختياري)
        $user->tokens()->delete();

        // إنشاء توكن جديد
        $token = $user->createToken('auth_token')->plainTextToken;

        // تسجيل النشاط
        ActivityLog::log(
            $user->id,
            'login',
            'User logged in',
            null,
            ['ip' => $request->ip(), 'user_agent' => $request->userAgent()]
        );

        // إرجاع البيانات مع التوكن
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'hospital_name' => $user->hospital_name,
                'blood_center_name' => $user->blood_center_name,
                'is_super_admin' => (bool)$user->is_super_admin,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * تسجيل مستخدم جديد (للمستخدمين العاديين فقط، وليس للمرضى)
     * فقط admin يمكنه إنشاء مستخدمين جدد
     */
    public function register(Request $request)
    {
        // التحقق من الصلاحيات (فقط admin)
        if (Auth::check() && Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only administrators can create new users.'
            ], 403);
        }

        // التحقق من صحة البيانات
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,hospital,blood_center',
            'hospital_name' => 'required_if:role,hospital|nullable|string|max:255',
            'blood_center_name' => 'required_if:role,blood_center|nullable|string|max:255',
            'is_super_admin' => 'sometimes|boolean',
        ]);

        // إنشاء المستخدم
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'hospital_name' => $request->hospital_name,
            'blood_center_name' => $request->blood_center_name,
            'is_active' => true,
            'is_super_admin' => $request->has('is_super_admin') ? $request->is_super_admin : true,
        ]);

        // تسجيل النشاط
        ActivityLog::log(
            Auth::id(),
            'user_created',
            'New user created: ' . $user->email,
            null,
            ['user_id' => $user->id, 'role' => $user->role]
        );

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_super_admin' => (bool)$user->is_super_admin,
            ]
        ], 201);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        // تسجيل النشاط قبل حذف التوكن
        ActivityLog::log(
            $user->id,
            'logout',
            'User logged out',
            null,
            ['ip' => $request->ip()]
        );
        
        // حذف التوكن الحالي
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * الحصول على معلومات المستخدم الحالي
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'hospital_name' => $user->hospital_name,
                'blood_center_name' => $user->blood_center_name,
                'is_active' => (bool)$user->is_active,
                'is_super_admin' => (bool)$user->is_super_admin,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * تغيير كلمة المرور
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        // التحقق من كلمة المرور الحالية
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // تحديث كلمة المرور
        $user->password = Hash::make($request->new_password);
        $user->save();

        // تسجيل النشاط
        ActivityLog::log(
            $user->id,
            'password_changed',
            'User changed password',
            null,
            ['ip' => $request->ip()]
        );

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}