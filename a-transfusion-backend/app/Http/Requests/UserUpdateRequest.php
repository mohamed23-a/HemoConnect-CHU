<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = auth()->user();
        $targetUser = $this->route('id') ?? $this->route('user');
        
        // Admin يمكنه تحديث أي مستخدم، المستخدم يمكنه تحديث نفسه فقط
        return $user->role === 'admin' || $user->id == $targetUser;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $userId = $this->route('id') ?? $this->route('user');
        
        $rules = [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $userId,
            'password' => 'sometimes|string|min:8|confirmed',
        ];

        // فقط admin يمكنه تغيير الدور والحالة
        if (auth()->user()->role === 'admin') {
            $rules['role'] = ['sometimes', Rule::in(['admin', 'hospital', 'blood_center'])];
            $rules['is_active'] = 'sometimes|boolean';
            $rules['hospital_name'] = 'nullable|string|max:255';
            $rules['blood_center_name'] = 'nullable|string|max:255';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'هذا البريد الإلكتروني مستخدم بالفعل',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
        ];
    }
}