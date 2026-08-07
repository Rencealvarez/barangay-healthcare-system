<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StaffAppointmentController extends Controller
{
    /**
     * Display a listing of appointments for healthcare staff.
     */
    public function index(Request $request): JsonResponse
    {
        $appointments = Appointment::with(['user', 'patient.user'])
            ->orderBy('preferred_date', 'asc')
            ->get();

        $formatted = $appointments->map(function ($apt) {
            $dateStr = $apt->preferred_date ? $apt->preferred_date->format('Y-m-d') : null;
            $timeStr = $apt->preferred_time;

            return [
                'id'               => $apt->id,
                'reference_number' => 'BHC-APT-' . str_pad($apt->id, 5, '0', STR_PAD_LEFT),
                'user_id'          => $apt->user_id,
                'resident_name'    => $apt->user->name ?? ($apt->patient->user->name ?? 'Valued Resident'),
                'contact_number'   => $apt->user->phone_number ?? ($apt->patient->emergency_contact_phone ?? 'N/A'),
                'service_type'     => $apt->service_type,
                'preferred_date'   => $dateStr,
                'preferred_time'   => $timeStr,
                'reason'           => $apt->reason ?? 'General Consultation',
                'status'           => ucfirst(strtolower($apt->status)),
                'created_at'       => $apt->created_at ? $apt->created_at->toISOString() : null,
                'assigned_doctor'  => $apt->assigned_doctor ?? '',
                'assigned_room'    => $apt->assigned_room ?? '',
                'rejection_reason' => $apt->rejection_reason ?? '',
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formatted,
        ], 200);
    }

    /**
     * Update status and assignments for an appointment.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Appointment not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status'           => ['required', 'string'],
            'assigned_doctor'  => ['nullable', 'string', 'max:255'],
            'assigned_room'    => ['nullable', 'string', 'max:255'],
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation error.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $normalizedStatus = strtolower($request->input('status'));

        $appointment->update([
            'status'           => $normalizedStatus,
            'assigned_doctor'  => $request->input('assigned_doctor', $appointment->assigned_doctor),
            'assigned_room'    => $request->input('assigned_room', $appointment->assigned_room),
            'rejection_reason' => $request->input('rejection_reason', $appointment->rejection_reason),
        ]);

        $formatted = [
            'id'               => $appointment->id,
            'reference_number' => 'BHC-APT-' . str_pad($appointment->id, 5, '0', STR_PAD_LEFT),
            'user_id'          => $appointment->user_id,
            'resident_name'    => $appointment->user->name ?? ($appointment->patient->user->name ?? 'Valued Resident'),
            'contact_number'   => $appointment->user->phone_number ?? ($appointment->patient->emergency_contact_phone ?? 'N/A'),
            'service_type'     => $appointment->service_type,
            'preferred_date'   => $appointment->preferred_date ? $appointment->preferred_date->format('Y-m-d') : null,
            'preferred_time'   => $appointment->preferred_time,
            'reason'           => $appointment->reason,
            'status'           => ucfirst($normalizedStatus),
            'created_at'       => $appointment->created_at ? $appointment->created_at->toISOString() : null,
            'assigned_doctor'  => $appointment->assigned_doctor,
            'assigned_room'    => $appointment->assigned_room,
            'rejection_reason' => $appointment->rejection_reason,
        ];

        return response()->json([
            'status'  => 'success',
            'message' => 'Appointment status updated successfully.',
            'data'    => $formatted,
        ], 200);
    }
}
