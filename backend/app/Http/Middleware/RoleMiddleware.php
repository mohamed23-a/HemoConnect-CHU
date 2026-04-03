<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  string  $role
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        if (! Auth::check()) {
            return response()->json([
                'message' => 'Unauthenticated. Please login first.',
            ], 401);
        }

        $user = Auth::user();

        // التحقق من أن المستخدم نشط
        if (! $user->is_active) {
            return response()->json([
                'message' => 'Your account is deactivated. Please contact administrator.',
            ], 403);
        }

        // التحقق من أن المستخدم لديه الدور المطلوب
        // يمكن أن يكون الدور مفرداً أو متعدداً (admin|hospital)
        $roles = explode('|', $role);

        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required role.',
                'required_roles' => $roles,
                'your_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
