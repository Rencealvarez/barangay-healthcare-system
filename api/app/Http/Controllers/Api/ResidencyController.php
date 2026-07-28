<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Patient;
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

    /**
     * Register a new residency record.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string'],
            'date_of_birth' => ['required', 'date'],
            'address' => ['required', 'string'],
            'contact_number' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
            'civil_status' => ['nullable', 'string'],
            'purok_zone' => ['nullable', 'string'],
            'id_type' => ['nullable', 'string'],
            'id_number' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

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
                'phone_number' => $request->input('contact_number'),
                'status' => 'active',
            ]);
            $userId = $user->id;
        }

        $generatedId = 'BRG-REG-' . rand(10000, 99999);

        $resident = Resident::create(array_merge(
            $request->except(['password']),
            [
                'resident_id' => $generatedId,
                'user_id' => $userId,
                'status' => 'Newly Registered Resident'
            ]
        ));


        if ($userId) {
            Patient::updateOrCreate(
                ['user_id' => $userId],
                [
                    'resident_id' => $generatedId,
                    'residency_status' => 'resident',
                    'address' => $request->input('address'),
                    'birthdate' => $request->input('date_of_birth'),
                    'gender' => $request->input('gender') === 'male' ? 'male' : ($request->input('gender') === 'female' ? 'female' : 'other'),
                    'contact_number' => $request->input('contact_number'),
                    'emergency_contact_name' => 'Barangay Office',
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
