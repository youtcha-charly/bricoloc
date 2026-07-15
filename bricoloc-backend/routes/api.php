<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\BidController;

Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'app' => 'BricoLoc API v1.0']);
});

// ============ PUBLIC ROUTES ============
Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

// ============ PROTECTED ROUTES ============
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // User Profile
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Jobs
    Route::get('/jobs', [JobController::class, 'index']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::get('/jobs/{id}', [JobController::class, 'show']);

    // Bids
    Route::post('/jobs/{id}/bids', [BidController::class, 'store']);
    Route::get('/my-bids', [BidController::class, 'myBids']);
    Route::put('/bids/{id}/accept', [BidController::class, 'accept']);
    Route::put('/bids/{id}/reject', [BidController::class, 'reject']);
Route::put('/jobs/{id}/complete', [JobController::class, 'complete']);

    // Notifications
    Route::get('/notifications', [App\Http\Controllers\Api\NotificationController::class, 'index']);

    // ============ ADMIN ROUTES ============
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/clients', [AdminController::class, 'clients']);
        Route::get('/bricoleurs', [AdminController::class, 'bricoleurs']);
        Route::get('/users/{id}', [AdminController::class, 'userDetails']);
        Route::put('/bricoleurs/{id}/verify', [AdminController::class, 'verifyBricoleur']);
        Route::put('/bricoleurs/{id}/reject', [AdminController::class, 'rejectBricoleur']);
        Route::put('/users/{id}/toggle-suspend', [AdminController::class, 'toggleSuspend']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/disputes', [AdminController::class, 'disputes']);
        Route::put('/disputes/{id}/resolve', [AdminController::class, 'resolveDispute']);
    });
});