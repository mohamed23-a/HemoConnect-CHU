<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BloodStockController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\TransfusionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // User management (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    });

    // Demandes routes
    Route::middleware('role:hospital|blood_center|admin')->group(function () {
        Route::get('/demandes', [DemandeController::class, 'index']);
        Route::get('/demandes/{id}', [DemandeController::class, 'show']);
        Route::post('/demandes', [DemandeController::class, 'store']);
        Route::put('/demandes/{id}', [DemandeController::class, 'update']);
        Route::put('/demandes/{id}/cancel', [DemandeController::class, 'cancel']);

        Route::middleware('role:blood_center|admin')->group(function () {
            Route::post('/demandes/{id}/approve', [DemandeController::class, 'approve']);
            Route::post('/demandes/{id}/reject', [DemandeController::class, 'reject']);
            Route::post('/demandes/{id}/complete', [DemandeController::class, 'complete']);
        });
    });

    // Blood stock routes
    Route::middleware('role:blood_center|admin')->group(function () {
        Route::get('/blood-stock', [BloodStockController::class, 'index']);
        Route::get('/blood-stock/{bloodType}', [BloodStockController::class, 'show']);
        Route::put('/blood-stock/{bloodType}', [BloodStockController::class, 'update']);
        Route::post('/blood-stock/add', [BloodStockController::class, 'addStock']);
        Route::post('/blood-stock/deduct', [BloodStockController::class, 'deductStock']);
    });

    // Transfusions routes
    Route::middleware('role:hospital|blood_center|admin')->group(function () {
        Route::get('/transfusions', [TransfusionController::class, 'index']);
        Route::get('/transfusions/{id}', [TransfusionController::class, 'show']);
    });

    // Dashboard routes
    Route::middleware('role:hospital|blood_center|admin')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
        Route::get('/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity']);
    });

    // Activity logs (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/activity-logs', [DashboardController::class, 'getActivityLogs']);
    });
});

// Test route
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'status' => 'success',
        'version' => '1.0.0',
    ]);
});
