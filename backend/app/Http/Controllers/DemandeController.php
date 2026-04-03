<?php

namespace App\Http\Controllers;

use App\Events\DemandeCreated;
use App\Http\Requests\DemandeRequest;
use App\Http\Resources\DemandeResource;
use App\Models\ActivityLog;
use App\Models\Demande;
use App\Models\Notification;
use App\Models\Transfusion;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DemandeController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Demande::with(['hospital', 'treatedBy', 'transfusion']);

        if ($user->role === 'hospital') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'blood_center') {
            $query->orderBy('created_at', 'desc');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('blood_type')) {
            $query->where('blood_type', $request->blood_type);
        }

        if ($request->has('user_id') && in_array($user->role, ['admin', 'blood_center'])) {
            $query->where(function ($q) use ($request) {
                $q->where('user_id', $request->user_id)
                    ->orWhere('treated_by', $request->user_id);
            });
        }

        $demandes = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => DemandeResource::collection($demandes),
            'pagination' => [
                'current_page' => $demandes->currentPage(),
                'last_page' => $demandes->lastPage(),
                'per_page' => $demandes->perPage(),
                'total' => $demandes->total(),
            ],
        ]);
    }

    public function store(DemandeRequest $request)
    {
        $user = $request->user();

        if ($user->role !== 'hospital') {
            return response()->json([
                'message' => 'Only hospitals can create transfusion requests.',
            ], 403);
        }

        try {
            DB::beginTransaction();

            $demande = Demande::create([
                'user_id' => $user->id,
                'patient_name' => $request->patient_name,
                'patient_age' => $request->patient_age,
                'blood_type' => $request->blood_type,
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'urgency' => $request->urgency,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            event(new DemandeCreated($demande));

            ActivityLog::log(
                $user->id,
                'demande_created',
                "New transfusion request created for patient {$request->patient_name}",
                null,
                $demande->toArray()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfusion request created successfully',
                'data' => new DemandeResource($demande->load('hospital')),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating demande: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while creating the request.',
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $demande = Demande::with(['hospital', 'treatedBy', 'transfusion'])->findOrFail($id);

        $user = $request->user();

        if ($user->role === 'hospital' && $demande->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new DemandeResource($demande),
        ]);
    }

    public function update(DemandeRequest $request, $id)
    {
        $demande = Demande::findOrFail($id);
        $user = $request->user();

        $errorResponse = null;
        if ($user->role !== 'hospital' || $demande->user_id !== $user->id) {
            $errorResponse = response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($demande->status !== 'pending') {
            $errorResponse = response()->json(['message' => 'Cannot update demande that has already been processed.'], 400);
        }

        if ($errorResponse) {
            return $errorResponse;
        }

        try {
            DB::beginTransaction();
            $oldData = $demande->toArray();
            $demande->update($request->validated());

            ActivityLog::log(
                $user->id,
                'demande_updated',
                "Transfusion request updated for patient {$demande->patient_name}",
                $oldData,
                $demande->toArray()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Demande updated successfully',
                'data' => new DemandeResource($demande),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating demande: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while updating the request.',
            ], 500);
        }
    }

    public function cancel(Request $request, $id)
    {
        $demande = Demande::findOrFail($id);
        $user = $request->user();

        $errorResponse = null;
        if ($user->role !== 'hospital' || $demande->user_id !== $user->id) {
            $errorResponse = response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($demande->status !== 'pending') {
            $errorResponse = response()->json(['message' => 'Cannot cancel demande that has already been processed.'], 400);
        }

        if ($errorResponse) {
            return $errorResponse;
        }

        try {
            DB::beginTransaction();
            $demande->status = 'cancelled';
            $demande->save();

            ActivityLog::log(
                $user->id,
                'demande_cancelled',
                "Transfusion request cancelled for patient {$demande->patient_name}",
                ['status' => 'pending'],
                ['status' => 'cancelled']
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Demande cancelled successfully',
                'data' => new DemandeResource($demande),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error cancelling demande: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while cancelling the request.',
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        $demande = Demande::findOrFail($id);
        $user = $request->user();

        $errorResponse = null;
        if (! in_array($user->role, ['blood_center', 'admin'])) {
            $errorResponse = response()->json(['message' => 'Unauthorized'], 403);
        } elseif (! $demande->isPending()) {
            $errorResponse = response()->json(['message' => 'This demande has already been processed.'], 400);
        } else {
            $availability = $this->stockService->checkAvailability($demande->blood_type, $demande->quantity);
            if (! $availability['available']) {
                $errorResponse = response()->json([
                    'message' => $availability['message'],
                    'available_quantity' => $availability['current_stock'],
                    'requested_quantity' => $demande->quantity,
                ], 400);
            }
        }

        if ($errorResponse) {
            return $errorResponse;
        }

        DB::beginTransaction();

        try {
            $this->stockService->deductForDemande($demande, $user->id);

            $demande->approve($user->id);

            $transfusion = Transfusion::create([
                'demande_id' => $demande->id,
                'blood_type' => $demande->blood_type,
                'quantity' => $demande->quantity,
                'processed_by' => $user->id,
                'processed_at' => now(),
                'notes' => $request->notes ?? 'Demande approved and processed',
            ]);

            ActivityLog::log(
                $user->id,
                'demande_approved',
                "Demande #{$demande->id} approved by {$user->name}",
                null,
                ['demande' => $demande->toArray()]
            );

            Notification::createNotification(
                $demande->user_id,
                '✅ Demande Approuvée',
                "Votre demande de transfusion pour {$demande->patient_name} a été approuvée. Quantité: {$demande->quantity} unités",
                'demande_approved',
                $demande->id
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Demande approved successfully',
                'data' => new DemandeResource($demande->load(['hospital', 'transfusion'])),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            ActivityLog::log(
                $user->id,
                'demande_approve_failed',
                "Failed to approve demande #{$demande->id}: ".$e->getMessage()
            );

            return response()->json([
                'message' => 'An error occurred while processing the demande.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|min:10',
        ]);

        $demande = Demande::findOrFail($id);
        $user = $request->user();

        $errorResponse = null;
        if (! in_array($user->role, ['blood_center', 'admin'])) {
            $errorResponse = response()->json(['message' => 'Unauthorized'], 403);
        } elseif (! $demande->isPending()) {
            $errorResponse = response()->json(['message' => 'This demande has already been processed.'], 400);
        }

        if ($errorResponse) {
            return $errorResponse;
        }

        try {
            DB::beginTransaction();
            $demande->reject($user->id, $request->rejection_reason);

            ActivityLog::log(
                $user->id,
                'demande_rejected',
                "Demande #{$demande->id} rejected by {$user->name}",
                null,
                ['rejection_reason' => $request->rejection_reason]
            );

            Notification::createNotification(
                $demande->user_id,
                '❌ Demande Refusée',
                "Votre demande de transfusion pour {$demande->patient_name} a été refusée. Raison: {$request->rejection_reason}",
                'demande_rejected',
                $demande->id
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Demande rejected successfully',
                'data' => new DemandeResource($demande),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error rejecting demande: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while rejecting the request.',
            ], 500);
        }
    }

    public function complete(Request $request, $id)
    {
        $demande = Demande::findOrFail($id);
        $user = $request->user();

        $errorResponse = null;
        if (! in_array($user->role, ['blood_center', 'admin'])) {
            $errorResponse = response()->json(['message' => 'Unauthorized'], 403);
        } elseif (! $demande->isApproved()) {
            $errorResponse = response()->json(['message' => 'Only approved demandes can be completed.'], 400);
        }

        if ($errorResponse) {
            return $errorResponse;
        }

        try {
            DB::beginTransaction();
            $demande->complete();

            if ($demande->transfusion) {
                $demande->transfusion->update([
                    'notes' => $request->notes ?? ($demande->transfusion->notes.' - Completed'),
                ]);
            }

            ActivityLog::log(
                $user->id,
                'demande_completed',
                "Demande #{$demande->id} completed by {$user->name}",
                null,
                ['completed_at' => now()]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Demande completed successfully',
                'data' => new DemandeResource($demande),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error completing demande: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while completing the request.',
            ], 500);
        }
    }
}
