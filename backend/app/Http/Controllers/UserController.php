<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * قائمة جميع المستخدمين (لـ admin فقط)
     */
    public function index(Request $request)
    {
        // التحقق من الصلاحيات
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::withCount('demandes')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * عرض معلومات مستخدم محدد
     */
    public function show(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // التحقق من الصلاحيات (admin أو المستخدم نفسه)
        if ($request->user()->role !== 'admin' && $request->user()->id != $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * تحديث معلومات المستخدم
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // التحقق من الصلاحيات
        if ($request->user()->role !== 'admin' && $request->user()->id != $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rules = [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$id,
            'is_active' => 'sometimes|boolean',
        ];

        // فقط admin يمكنه تغيير الدور
        if ($request->user()->role === 'admin') {
            $rules['role'] = 'sometimes|in:admin,hospital,blood_center';
            $rules['hospital_name'] = 'nullable|string|max:255';
            $rules['blood_center_name'] = 'nullable|string|max:255';
            $rules['is_super_admin'] = 'sometimes|boolean';
        }

        $request->validate($rules);

        $oldData = $user->toArray();

        // تحديث البيانات
        $user->update($request->only(array_keys($rules)));

        // تسجيل النشاط
        ActivityLog::log(
            $request->user()->id,
            'user_updated',
            'User updated: '.$user->email,
            $oldData,
            $user->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * حذف مستخدم
     */
    public function destroy(Request $request, $id)
    {
        // فقط admin يمكنه حذف المستخدمين
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        // منع حذف نفسه
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 400);
        }

        $userEmail = $user->email;

        try {
            DB::beginTransaction();

            // حذف سجلات النشاط يدوياً لتجنب أي مشاكل في Constraints إذا لم تكن مضبوطة جيداً
            ActivityLog::where('user_id', $user->id)->delete();

            // إذا كان مستشفى أو مركز دم، نحذف طلباته
            $demandeIds = Demande::where('user_id', $user->id)->pluck('id');
            if ($demandeIds->isNotEmpty()) {
                DB::table('transfusions')->whereIn('demande_id', $demandeIds)->delete();
                Demande::whereIn('id', $demandeIds)->delete();
            }

            // إذا كان معالِجاً للطلبات (treated_by)
            Demande::where('treated_by', $user->id)->update(['treated_by' => null]);
            DB::table('transfusions')->where('processed_by', $user->id)->update(['processed_by' => $request->user()->id]); // نقل العمليات المعالجة إلى الأدمن الحالي

            // حذف الإشعارات
            DB::table('notifications')->where('user_id', $user->id)->delete();

            $user->delete();

            // تسجيل النشاط
            ActivityLog::log(
                $request->user()->id,
                'user_deleted',
                'User deleted: '.$userEmail,
                null,
                ['deleted_user_id' => $id]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * تفعيل/تعطيل مستخدم
     */
    public function toggleStatus(Request $request, $id)
    {
        // فقط admin يمكنه تغيير الحالة
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        // منع تعطيل نفسه
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot change your own status'], 400);
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        // تسجيل النشاط
        ActivityLog::log(
            $request->user()->id,
            'user_status_changed',
            'User status changed: '.$user->email.' to '.($user->is_active ? 'active' : 'inactive'),
            null,
            ['is_active' => $user->is_active]
        );

        return response()->json([
            'success' => true,
            'message' => 'User status changed successfully',
            'is_active' => $user->is_active,
        ]);
    }
}
