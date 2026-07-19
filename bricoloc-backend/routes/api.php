<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\BidController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DisputeController;

Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'app' => 'BricoLoc API v1.0']);
});

// ============ PUBLIC ROUTES ============
Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
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
    Route::put('/jobs/{id}', [JobController::class, 'update']);
    Route::delete('/jobs/{id}', [JobController::class, 'destroy']);
    Route::put('/jobs/{id}/complete', [JobController::class, 'complete']);
    Route::put('/jobs/{id}/cancel', [JobController::class, 'cancel']);

    // Bids
    Route::post('/jobs/{jobId}/bids', [BidController::class, 'store']);
    Route::get('/my-bids', [BidController::class, 'myBids']);
    Route::get('/bids/my', [BidController::class, 'myBids']);
    Route::put('/bids/{bidId}/accept', [BidController::class, 'accept']);
    Route::put('/bids/{bidId}/reject', [BidController::class, 'reject']);

    // Chats
    Route::get('/chats', [ChatController::class, 'index']);
    Route::get('/chats/{id}', [ChatController::class, 'show']);
    Route::post('/chats/{id}/messages', [ChatController::class, 'sendMessage']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Reviews
    Route::get('/jobs/{jobId}/review/check', [ReviewController::class, 'check']);
    Route::post('/jobs/{jobId}/review', [ReviewController::class, 'store']);

    // Disputes (user-facing)
    Route::post('/disputes', [DisputeController::class, 'store']);

    // ============ ADMIN ROUTES ============
    Route::prefix('admin')->middleware('admin')->group(function () {
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
        Route::get('/jobs', [AdminController::class, 'jobs']);
    });
});
