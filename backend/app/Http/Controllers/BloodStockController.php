<?php

namespace App\Http\Controllers;

use App\Http\Requests\BloodStockRequest;
use App\Http\Resources\BloodStockResource;
use App\Models\ActivityLog;
use App\Models\BloodStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BloodStockController extends Controller
{
    /**
     * Display a listing of blood stock.
     */
    public function index(Request $request)
    {
        $stocks = BloodStock::orderBy('blood_type')->get();

        return response()->json([
            'success' => true,
            'data' => BloodStockResource::collection($stocks),
            'summary' => [
                'total_units' => $stocks->sum('quantity'),
                'low_stock_count' => $stocks->filter->isLow()->count(),
                'out_of_stock_count' => $stocks->where('quantity', 0)->count(),
            ],
        ]);
    }

    /**
     * Display the specified blood stock.
     */
    public function show(Request $request, $bloodType)
    {
        $stock = BloodStock::where('blood_type', $bloodType)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new BloodStockResource($stock),
        ]);
    }

    /**
     * Update blood stock (set exact quantity).
     */
    public function update(Request $request, $bloodType)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
            'minimum_threshold' => 'sometimes|integer|min:1',
        ]);

        try {
            DB::beginTransaction();
            $stock = BloodStock::where('blood_type', $bloodType)->lockForUpdate()->firstOrFail();
            $oldQuantity = $stock->quantity;

            $stock->quantity = $request->quantity;

            if ($request->has('minimum_threshold')) {
                $stock->minimum_threshold = $request->minimum_threshold;
            }

            $stock->last_updated = now();
            $stock->save();

            ActivityLog::log(
                $request->user()->id,
                'stock_updated',
                "Blood stock for {$bloodType} updated from {$oldQuantity} to {$request->quantity}",
                ['old_quantity' => $oldQuantity],
                ['new_quantity' => $request->quantity]
            );

            // التحقق من التنبيه
            if ($stock->isLow()) {
                // يمكن إرسال إشعار للمسؤولين
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Blood stock updated successfully',
                'data' => new BloodStockResource($stock),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating blood stock: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while updating blood stock.',
            ], 500);
        }
    }

    /**
     * Add stock to blood bank.
     */
    public function addStock(BloodStockRequest $request)
    {
        try {
            DB::beginTransaction();
            $stock = BloodStock::where('blood_type', $request->blood_type)->lockForUpdate()->first();
            $oldQuantity = $stock?->quantity ?? 0;

            if ($stock) {
                $stock->addQuantity($request->quantity);
            } else {
                $stock = BloodStock::create([
                    'blood_type' => $request->blood_type,
                    'quantity' => $request->quantity,
                    'minimum_threshold' => 5,
                    'last_updated' => now(),
                ]);
            }

            ActivityLog::log(
                $request->user()->id,
                'stock_added',
                "Added {$request->quantity} units of {$request->blood_type} blood",
                ['old_quantity' => $oldQuantity],
                ['new_quantity' => $stock->quantity, 'added' => $request->quantity]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Blood stock added successfully',
                'data' => new BloodStockResource($stock),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adding blood stock: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while adding blood stock.',
            ], 500);
        }
    }

    /**
     * Deduct stock from blood bank.
     */
    public function deductStock(BloodStockRequest $request)
    {
        try {
            DB::beginTransaction();
            $stock = BloodStock::where('blood_type', $request->blood_type)->lockForUpdate()->firstOrFail();
            $oldQuantity = $stock->quantity;

            if (! $stock->hasEnoughQuantity($request->quantity)) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Insufficient stock',
                    'available' => $stock->quantity,
                    'requested' => $request->quantity,
                ], 400);
            }

            $stock->deductQuantity($request->quantity);

            ActivityLog::log(
                $request->user()->id,
                'stock_deducted',
                "Deducted {$request->quantity} units of {$request->blood_type} blood",
                ['old_quantity' => $oldQuantity],
                ['new_quantity' => $stock->quantity, 'deducted' => $request->quantity]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Blood stock deducted successfully',
                'data' => new BloodStockResource($stock),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deducting blood stock: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'An error occurred while deducting blood stock.',
            ], 500);
        }
    }
}
