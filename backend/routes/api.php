<?php

use App\Http\Controllers\Api\Admin\CampaignController as AdminCampaignController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DonationController as AdminDonationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\DonationController;
use Illuminate\Support\Facades\Route;

Route::get('/campaign', [CampaignController::class, 'show']);
Route::get('/donations', [DonationController::class, 'index']);
Route::post('/donations', [DonationController::class, 'store']);
Route::get('/donations/{publicRef}/status', [DonationController::class, 'status']);
Route::match(['get', 'post'], '/donations/{publicRef}/pesepay/result', [DonationController::class, 'result']);

Route::post('/admin/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/overview', [DashboardController::class, 'overview']);
    Route::get('/campaign', [AdminCampaignController::class, 'show']);
    Route::put('/campaign', [AdminCampaignController::class, 'update']);
    Route::get('/donations', [AdminDonationController::class, 'index']);
    Route::post('/donations/{donation}/confirm', [AdminDonationController::class, 'confirm']);
    Route::post('/donations/{donation}/reject', [AdminDonationController::class, 'reject']);
});
