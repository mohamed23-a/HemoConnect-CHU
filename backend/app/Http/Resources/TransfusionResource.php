<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\DemandeResource;
use App\Http\Resources\UserResource;

class TransfusionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'demande_id' => $this->demande_id,
            'demande' => new DemandeResource($this->whenLoaded('demande')),
            'blood_type' => $this->blood_type,
            'quantity' => $this->quantity,
            'processed_by' => $this->processed_by,
            'processed_by_user' => new UserResource($this->whenLoaded('processedBy')),
            'processed_at' => $this->processed_at?->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}