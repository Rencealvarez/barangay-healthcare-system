<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PatientCensusController extends Controller
{
    /**
     * Display a listing of resident patient records and census.
     */
    public function index(): JsonResponse
    {
        $patients = Patient::with('user')->orderBy('id', 'asc')->get()->map(function ($patient) {
            $age = $patient->birthdate ? $patient->birthdate->age : 28;
            $residencyLabel = 'Verified';
            if ($patient->residency_status === 'non_resident') {
                $residencyLabel = 'Non-Resident';
            } elseif ($age >= 60) {
                $residencyLabel = 'Verified (Senior Citizen)';
            }

            return [
                'id'                 => $patient->id,
                'resident_id'        => $patient->resident_id ?? ('RES-2026-' . str_pad($patient->id, 4, '0', STR_PAD_LEFT)),
                'full_name'          => $patient->user->name ?? 'Barangay Resident',
                'age'                => $age,
                'gender'             => ucfirst($patient->gender ?? 'Female'),
                'purok_zone'         => $patient->purok_zone ?? 'Zone 1',
                'contact_number'     => $patient->user->phone_number ?? ($patient->emergency_contact_phone ?? '09171234567'),
                'blood_type'         => $patient->blood_type ?? 'O+',
                'residency_status'   => $residencyLabel,
                'consultation_count' => $patient->appointments()->count(),
                'allergies'          => $patient->allergies ?? '',
                'medical_history'    => $patient->medical_history ?? '',
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $patients,
        ], 200);
    }

    /**
     * Update clinical health file and patient record.
     */
    public function updateClinicalRecord(Request $request, $id): JsonResponse
    {
        $patient = Patient::find($id);

        if (!$patient) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Patient record not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'blood_type'      => ['nullable', 'string', 'max:20'],
            'allergies'       => ['nullable', 'string', 'max:1000'],
            'medical_history' => ['nullable', 'string', 'max:2000'],
            'purok_zone'      => ['nullable', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation error.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $patient->update([
            'blood_type'      => $request->input('blood_type', $patient->blood_type),
            'allergies'       => $request->input('allergies', $patient->allergies),
            'medical_history' => $request->input('medical_history', $patient->medical_history),
            'purok_zone'      => $request->input('purok_zone', $patient->purok_zone),
        ]);

        $age = $patient->birthdate ? $patient->birthdate->age : 28;
        $residencyLabel = 'Verified';
        if ($patient->residency_status === 'non_resident') {
            $residencyLabel = 'Non-Resident';
        } elseif ($age >= 60) {
            $residencyLabel = 'Verified (Senior Citizen)';
        }

        $responseData = [
            'id'                 => $patient->id,
            'resident_id'        => $patient->resident_id ?? ('RES-2026-' . str_pad($patient->id, 4, '0', STR_PAD_LEFT)),
            'full_name'          => $patient->user->name ?? 'Barangay Resident',
            'age'                => $age,
            'gender'             => ucfirst($patient->gender ?? 'Female'),
            'purok_zone'         => $patient->purok_zone ?? 'Zone 1',
            'contact_number'     => $patient->user->phone_number ?? ($patient->emergency_contact_phone ?? '09171234567'),
            'blood_type'         => $patient->blood_type ?? 'O+',
            'residency_status'   => $residencyLabel,
            'consultation_count' => $patient->appointments()->count(),
            'allergies'          => $patient->allergies ?? '',
            'medical_history'    => $patient->medical_history ?? '',
        ];

        return response()->json([
            'status'  => 'success',
            'message' => 'Clinical health file updated successfully.',
            'data'    => $responseData,
        ], 200);
    }
}
