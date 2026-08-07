<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PatientCensusController;
use App\Http\Controllers\Api\StaffAppointmentController;
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

// 3. Healthcare Staff & Admin Portal Routes (Protected under role:staff|admin)
Route::middleware(['role:staff|admin'])->prefix('admin')->group(function () {
    // Staff Appointment Management
    Route::get('/appointments', [StaffAppointmentController::class, 'index']);
    Route::put('/appointments/{id}/status', [StaffAppointmentController::class, 'updateStatus']);
    Route::put('/appointments/{id}', [StaffAppointmentController::class, 'updateStatus']);

    // Health Inventory Management
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::post('/inventory/{id}/quick-restock', [InventoryController::class, 'quickRestock']);
    Route::post('/inventory/{id}/restock', [InventoryController::class, 'quickRestock']);

    // Resident Patients Census & Clinical Health Records
    Route::get('/patients', [PatientCensusController::class, 'index']);
    Route::get('/census', [PatientCensusController::class, 'index']);
    Route::put('/patients/{id}/clinical-record', [PatientCensusController::class, 'updateClinicalRecord']);
    Route::put('/patients/{id}', [PatientCensusController::class, 'updateClinicalRecord']);
});
