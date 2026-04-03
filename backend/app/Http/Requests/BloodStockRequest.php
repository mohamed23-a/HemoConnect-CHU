<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BloodStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['blood_center', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'blood_type' => ['required', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'quantity' => 'required|integer|min:1',
            'action' => ['required', Rule::in(['add', 'deduct'])],
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'blood_type.required' => 'فصيلة الدم مطلوبة',
            'quantity.required' => 'الكمية مطلوبة',
            'quantity.min' => 'الكمية يجب أن تكون 1 على الأقل',
            'action.required' => 'نوع العملية مطلوب',
        ];
    }
}
