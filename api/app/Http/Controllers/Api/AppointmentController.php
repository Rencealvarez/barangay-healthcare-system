<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Store a newly created appointment request from a resident.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'service_type'   => ['required', 'string', 'max:100'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'preferred_time' => ['required', 'date_format:H:i'],
            'reason'         => ['nullable', 'string', 'max:1000'],
            'patient_id'     => ['nullable', 'exists:patients,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $userId = Auth::id() ?? $request->input('user_id');

        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User ID is required to create an appointment.',
            ], 401);
        }

        $appointment = Appointment::create([
            'user_id'        => $userId,
            'patient_id'     => $request->input('patient_id'),
            'service_type'   => $request->input('service_type'),
            'preferred_date' => $request->input('preferred_date'),
            'preferred_time' => $request->input('preferred_time'),
            'reason'         => $request->input('reason'),
            'status'         => 'pending',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Appointment request submitted successfully.',
            'data'    => $appointment,
        ], 201);
    }

    /**
     * Display a listing of appointments for the authenticated resident.
     */
    public function index(Request $request): JsonResponse
    {
        // If query is specifically under resident prefix, ignore admin bypass and restrict to Auth::id()
        if ($request->is('api/user/*')) {
            $userId = Auth::id();
            $appointments = Appointment::where('user_id', $userId)
                ->with('patient.user')
                ->orderBy('preferred_date', 'asc')
                ->get();
        } else {
            $userId = Auth::id() ?? $request->query('user_id');
            $user = Auth::user();
            if ($user && in_array($user->role, ['staff', 'admin'])) {
                $appointments = Appointment::with(['user', 'patient.user'])
                    ->orderBy('preferred_date', 'asc')
                    ->get();
            } else {
                $appointments = Appointment::where('user_id', $userId)
                    ->with('patient.user')
                    ->orderBy('preferred_date', 'asc')
                    ->get();
            }
        }

        $formatted = $appointments->map(function ($apt) {
            $apt->status = ucfirst($apt->status);
            $apt->resident_name = $apt->user->name ?? ($apt->patient->user->name ?? 'Valued Resident');
            $apt->reference_number = 'BHC-APT-' . str_pad($apt->id, 5, '0', STR_PAD_LEFT);
            return $apt;
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formatted,
        ], 200);
    }

    /**
     * Display a listing of completed medical records/consultations for the authenticated resident.
     */
    public function medicalRecords(Request $request): JsonResponse
    {
        $userId = Auth::id() ?? $request->query('user_id');

        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Fetch completed appointments for this resident which contain consultation notes, diagnosis, and prescriptions
        $records = Appointment::where('user_id', $userId)
            ->where('status', 'completed')
            ->orderBy('preferred_date', 'desc')
            ->get()
            ->map(function ($apt) {
                return [
                    'id'           => $apt->id,
                    'date'         => $apt->preferred_date->format('Y-m-d'),
                    'type'         => $apt->service_type,
                    'attending'    => $apt->assigned_doctor ?? 'Health Station Staff',
                    'diagnosis'    => $apt->diagnosis ?? $apt->notes ?? 'General Wellness Consult',
                    'prescription' => $apt->prescription ?? 'N/A',
                    'status'       => 'Completed',
                ];
            });

        return response()->json([
            'status' => 'success',
            'data'   => $records,
        ], 200);
    }

    /**
     * Check slot availability for a preferred date.
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = $request->query('date');
        $slots = [
            '08:00' => 'available',
            '09:00' => 'available',
            '10:00' => 'available',
            '11:00' => 'available',
            '13:00' => 'available',
            '14:00' => 'available',
            '15:00' => 'available',
            '16:00' => 'available',
        ];

        $appointmentsCount = Appointment::where('preferred_date', $date)
            ->whereIn('status', ['pending', 'approved', 'completed'])
            ->select('preferred_time', \DB::raw('count(*) as count'))
            ->groupBy('preferred_time')
            ->pluck('count', 'preferred_time');

        $limit = 3; // Maximum capacity per slot
        $formattedSlots = [];

        foreach ($slots as $time => $defaultStatus) {
            $count = 0;
            foreach ($appointmentsCount as $aptTime => $aptCount) {
                if (substr($aptTime, 0, 5) === $time) {
                    $count = $aptCount;
                    break;
                }
            }

            // Simulate the 11:00 AM slot as full for demonstration if desired,
            // or let the database handle it naturally.
            $status = ($count >= $limit || $time === '11:00') ? 'full' : 'available';

            $formattedSlots[] = [
                'value'  => $time,
                'label'  => date('h:i A', strtotime($time)),
                'status' => $status,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data'   => $formattedSlots,
        ]);
    }

    /**
     * Update appointment status (Staff approval/rejection workflow).
     */
    public function update(Request $request, $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status'           => ['required', 'string', 'in:Approved,Rejected,completed,cancelled'],
            'assigned_doctor'  => ['nullable', 'string', 'max:255'],
            'assigned_room'    => ['nullable', 'string', 'max:255'],
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment->update([
            'status'           => strtolower($request->input('status')),
            'assigned_doctor'  => $request->input('assigned_doctor'),
            'assigned_room'    => $request->input('assigned_room'),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Appointment status updated successfully.',
            'data'    => $appointment
        ]);
    }
}
