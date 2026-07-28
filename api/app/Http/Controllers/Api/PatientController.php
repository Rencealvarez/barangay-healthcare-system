<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PatientController extends Controller
{
    /**
     * Display a listing of patients/residents census for staff.
     */
    public function index(): JsonResponse
    {
        $patients = Patient::with('user')->get()->map(function ($patient) {
            // Calculate age from birthdate
            $age = $patient->birthdate ? $patient->birthdate->age : 0;
            return [
                'id'                 => $patient->id,
                'resident_id'        => $patient->resident_id ?? 'N/A',
                'full_name'          => $patient->user->name ?? 'Unknown Patient',
                'age'                => $age,
                'gender'             => $patient->gender,
                'blood_type'         => $patient->blood_type ?? 'Unknown',
                'residency_status'   => $patient->residency_status === 'resident' ? 'Resident' : 'Non-Resident',
                'purok_zone'         => $patient->purok_zone ?? 'Health Center District',
                'contact_number'     => $patient->user->phone_number ?? $patient->contact_number ?? 'N/A',
                'consultation_count' => $patient->appointments()->count(),
                'allergies'          => $patient->allergies,
                'medical_history'    => $patient->medical_history,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $patients
        ]);
    }

    /**
     * Update a patient's health record.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $patient = Patient::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'blood_type'      => ['nullable', 'string'],
            'allergies'        => ['nullable', 'string'],
            'medical_history'  => ['nullable', 'string'],
            'purok_zone'       => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $patient->update($request->only(['blood_type', 'allergies', 'medical_history', 'purok_zone']));

        return response()->json([
            'status'  => 'success',
            'message' => 'Patient record updated successfully.',
            'data'    => $patient
        ]);
    }
}
