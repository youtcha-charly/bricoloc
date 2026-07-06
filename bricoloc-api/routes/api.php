<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'app' => 'BricoLoc API v1.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// ============ PUBLIC ROUTES ============
Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public data
    Route::get('/cities', function () {
        return response()->json([
            'data' => ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Limbe', 'Kribi']
        ]);
    });
    
    Route::get('/categories', function () {
        $categories = \App\Models\JobCategory::all();
        return response()->json(['data' => $categories]);
    });
});

// ============ PROTECTED ROUTES ============
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // User
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Jobs
    Route::get('/jobs', [JobController::class, 'index']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::get('/jobs/{id}', [JobController::class, 'show']);
});