<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DemandeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'hospital' => new UserResource($this->whenLoaded('hospital')),
            'patient_name' => $this->patient_name,
            'patient_age' => $this->patient_age,
            'blood_type' => $this->blood_type,
            'product_type' => $this->product_type,
            'quantity' => $this->quantity,
            'reason' => $this->reason,
            'urgency' => $this->urgency,
            'urgency_label' => $this->getUrgencyLabel(),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'status_color' => $this->getStatusColor(),
            'rejection_reason' => $this->rejection_reason,
            'treated_by' => $this->treated_by,
            'treated_by_user' => new UserResource($this->whenLoaded('treatedBy')),
            'treated_at' => $this->treated_at?->format('Y-m-d H:i:s'),
            'completed_at' => $this->completed_at?->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'transfusion' => new TransfusionResource($this->whenLoaded('transfusion')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function getUrgencyLabel(): string
    {
        return match ($this->urgency) {
            'normal' => 'عادي',
            'urgent' => 'عاجل',
            'emergency' => 'طارئ',
            default => $this->urgency,
        };
    }

    private function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending' => 'قيد الانتظار',
            'approved' => 'مقبول',
            'rejected' => 'مرفوض',
            'completed' => 'مكتمل',
            default => $this->status,
        };
    }

    private function getStatusColor(): string
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'approved' => 'blue',
            'rejected' => 'red',
            'completed' => 'green',
            default => 'gray',
        };
    }
}
