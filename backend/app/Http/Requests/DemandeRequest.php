<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DemandeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // التحقق من أن المستخدم مسجل دخوله ومن نوع hospital
        return auth()->check() && in_array(auth()->user()->role, ['hospital', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'patient_name' => 'required|string|max:255',
            'patient_age' => 'required|integer|min:0|max:120',
            'blood_type' => ['required', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'product_type' => ['required', Rule::in(['RBC', 'WBC', 'Plasma', 'WB'])],
            'quantity' => 'required|integer|min:1|max:50',
            'reason' => 'required|string|min:10',
            'urgency' => ['required', Rule::in(['normal', 'urgent', 'emergency'])],
            'notes' => 'nullable|string|max:500',
        ];

        // إذا كان الطلب للتحديث، نجعل بعض الحقول اختيارية
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules = array_map(function ($rule) {
                return str_replace('required', 'sometimes', $rule);
            }, $rules);
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'patient_name.required' => 'اسم المريض مطلوب',
            'patient_age.required' => 'عمر المريض مطلوب',
            'patient_age.min' => 'عمر المريض يجب أن يكون أكبر من 0',
            'blood_type.required' => 'فصيلة الدم مطلوبة',
            'blood_type.in' => 'فصيلة الدم غير صحيحة',
            'quantity.required' => 'الكمية مطلوبة',
            'quantity.min' => 'الكمية يجب أن تكون وحدة واحدة على الأقل',
            'reason.required' => 'سبب النقل مطلوب',
            'reason.min' => 'سبب النقل يجب أن يكون 10 أحرف على الأقل',
            'urgency.required' => 'درجة الاستعجال مطلوبة',
        ];
    }
}
