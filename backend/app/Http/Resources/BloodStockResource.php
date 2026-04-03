<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BloodStockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'blood_type' => $this->blood_type,
            'quantity' => $this->quantity,
            'minimum_threshold' => $this->minimum_threshold,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'is_low' => $this->isLow(),
            'has_stock' => $this->quantity > 0,
            'last_updated' => $this->last_updated?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
    
    private function getStatusLabel(): string
    {
        return match($this->status) {
            'available' => 'متوفر',
            'low' => 'مخزون منخفض',
            'out_of_stock' => 'نفد المخزون',
            default => $this->status,
        };
    }
}