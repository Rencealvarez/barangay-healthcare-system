<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Barangay Healthcare System
|--------------------------------------------------------------------------
*/

// 1. Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// 2. Resident Portal Routes (Protected by role:resident)
Route::middleware(['role:resident'])->prefix('user')->group(function () {
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/medical-records', [AppointmentController::class, 'medicalRecords']);
});

// Public Residency Routes
Route::post('/residency/lookup', [\App\Http\Controllers\Api\ResidencyController::class, 'lookup']);
Route::post('/residency/register', [\App\Http\Controllers\Api\ResidencyController::class, 'register']);

// Public / General Appointments endpoint
Route::prefix('appointments')->group(function () {
    Route::get('/', [AppointmentController::class, 'index']);
    Route::post('/', [AppointmentController::class, 'store']);
    Route::get('/slots', [AppointmentController::class, 'getAvailableSlots']);
    Route::put('/{id}', [AppointmentController::class, 'update']);
});

// 3. Staff & Admin Portal Routes (Protected by role:staff,admin)
Route::middleware(['role:staff,admin'])->prefix('admin')->group(function () {
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::get('/patients', [\App\Http\Controllers\Api\PatientController::class, 'index']);
    Route::put('/patients/{id}', [\App\Http\Controllers\Api\PatientController::class, 'update']);
});
