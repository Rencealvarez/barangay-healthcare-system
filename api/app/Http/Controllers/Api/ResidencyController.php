<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Patient;
use App\Http\Requests\RegisterResidentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ResidencyController extends Controller
{
    /**
     * Look up a resident record by full name and birthdate.
     */
    public function lookup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string'],
            'date_of_birth' => ['required', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $resident = Resident::where('full_name', $request->input('full_name'))
            ->whereDate('date_of_birth', $request->input('date_of_birth'))
            ->first();

        if (!$resident) {
            return response()->json([
                'status' => 'error',
                'message' => 'Residency record not found. Please register as a new resident.'
            ], 404);
        }

        // Link active user ID if logged in and not already linked
        $userId = Auth::id() ?? $request->input('user_id');
        if ($userId && !$resident->user_id) {
            $resident->update(['user_id' => $userId]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $resident
        ]);
    }

    public function register(RegisterResidentRequest $request): JsonResponse
    {
        $email = $request->input('email');
        $password = $request->input('password');
        $userId = Auth::id() ?? $request->input('user_id');

        // Automatically create a user account if email and password are provided and they aren't logged in
        if (!$userId && $email && $password) {
            $existingUser = \App\Models\User::where('email', $email)->first();
            if ($existingUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'An account with this email already exists. Please log in or use a different email.'
                ], 422);
            }

            $user = \App\Models\User::create([
                'name' => $request->input('full_name'),
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make($password),
                'role' => 'resident',
                'phone_number' => $request->input('mobile_number'),
                'status' => 'active',
            ]);
            $userId = $user->id;
        }

        $generatedId = 'BRG-REG-' . rand(10000, 99999);

        $resident = Resident::create([
            'resident_id'    => $generatedId,
            'user_id'        => $userId,
            'full_name'      => $request->input('full_name'),
            'gender'         => $request->input('gender'),
            'date_of_birth'  => $request->input('date_of_birth'),
            'civil_status'   => $request->input('civil_status'),
            'purok_zone'     => $request->input('zone_purok'),
            'address'        => $request->input('address'),
            'contact_number' => $request->input('mobile_number'),
            'email'          => $request->input('email'),
            'id_type'        => $request->input('id_type'),
            'id_number'      => $request->input('id_reference_number'),
            'status'         => 'Newly Registered Resident'
        ]);

        if ($userId) {
            Patient::updateOrCreate(
                ['user_id' => $userId],
                [
                    'resident_id'             => $generatedId,
                    'residency_status'        => 'resident',
                    'address'                 => $request->input('address'),
                    'birthdate'               => $request->input('date_of_birth'),
                    'gender'                  => strtolower($request->input('gender')) === 'male' ? 'male' : (strtolower($request->input('gender')) === 'female' ? 'female' : 'other'),
                    'contact_number'          => $request->input('mobile_number'),
                    'emergency_contact_name'  => 'Barangay Office',
                    'emergency_contact_phone' => '09170000000',
                ]
            );
        }

        // Generate auth token if a user was created/linked
        $token = null;
        if ($userId) {
            $user = \App\Models\User::find($userId);
            if ($user) {
                $token = 'token_' . $user->role . '_' . base64_encode($user->id . ':' . now());
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $resident,
            'token' => $token,
        ], 201);
    }
}
