<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransfusionResource;
use App\Models\Transfusion;
use Illuminate\Http\Request;

class TransfusionController extends Controller
{
    /**
     * Display a listing of transfusions.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Transfusion::with(['demande.hospital', 'processedBy']);

        // المستشفى يرى فقط عمليات النقل الخاصة بطلباته
        if ($user->role === 'hospital') {
            $query->whereHas('demande', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $transfusions = $query->orderBy('processed_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => TransfusionResource::collection($transfusions),
            'pagination' => [
                'current_page' => $transfusions->currentPage(),
                'last_page' => $transfusions->lastPage(),
                'per_page' => $transfusions->perPage(),
                'total' => $transfusions->total(),
            ],
        ]);
    }

    /**
     * Display the specified transfusion.
     */
    public function show(Request $request, $id)
    {
        $transfusion = Transfusion::with(['demande.hospital', 'processedBy'])->findOrFail($id);

        $user = $request->user();

        // التحقق من الصلاحيات
        if ($user->role === 'hospital' && $transfusion->demande->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new TransfusionResource($transfusion),
        ]);
    }
}
