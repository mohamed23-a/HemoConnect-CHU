<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardStatsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'total_demandes' => $this['total_demandes'] ?? 0,
            'pending_demandes' => $this['pending_demandes'] ?? 0,
            'approved_demandes' => $this['approved_demandes'] ?? 0,
            'rejected_demandes' => $this['rejected_demandes'] ?? 0,
            'completed_demandes' => $this['completed_demandes'] ?? 0,
            'total_transfusions' => $this['total_transfusions'] ?? 0,
            'blood_stock_summary' => $this['blood_stock_summary'] ?? [],
            'demandes_by_blood_type' => $this['demandes_by_blood_type'] ?? [],
            'demandes_by_urgency' => $this['demandes_by_urgency'] ?? [],
            'recent_demandes' => DemandeResource::collection($this['recent_demandes'] ?? []),
            'low_stock_alerts' => $this['low_stock_alerts'] ?? [],
        ];
    }
}
