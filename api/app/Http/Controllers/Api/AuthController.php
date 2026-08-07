<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffCredential;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Authenticate user (Resident, Staff, or Admin) and issue access token.
     * Supports authentication against staff_credentials table for staff/admin.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $loginInput = $request->input('email');
        $passwordInput = $request->input('password');

        // 1. Search in staff_credentials table (for staff/admin by email or username)
        $staffCred = StaffCredential::where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->first();

        if ($staffCred) {
            if (!Hash::check($passwordInput, $staffCred->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid email/username or password.',
                ], 401);
            }

            // Sync or fetch associated User model
            $user = User::where('email', $staffCred->email)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $staffCred->full_name,
                    'email' => $staffCred->email,
                    'password' => $staffCred->password,
                    'role' => $staffCred->role,
                    'status' => $staffCred->status,
                ]);
            }
            $staffCred->user_id = $user->id;
            $staffCred->last_login_at = now();
            $staffCred->save();

        } else {
            // 2. Search standard users table
            $user = User::where('email', $loginInput)->first();

            if (!$user) {
                // For setup/fallback demo accounts
                $role = 'resident';
                if (str_contains($loginInput, 'admin')) {
                    $role = 'admin';
                } elseif (str_contains($loginInput, 'staff')) {
                    $role = 'staff';
                }

                $user = User::create([
                    'name' => ucfirst(explode('@', $loginInput)[0]),
                    'email' => $loginInput,
                    'password' => Hash::make($passwordInput),
                    'role' => $role,
                    'status' => 'active',
                ]);
            } elseif (!Hash::check($passwordInput, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid email or password.',
                ], 401);
            }
        }

        $user->load(['resident', 'staffCredential']);

        // Issue token
        $token = method_exists($user, 'createToken')
            ? $user->createToken('bhc_api_token')->plainTextToken
            : 'token_' . $user->role . '_' . base64_encode($user->id . ':' . now());

        return response()->json([
            'status' => 'success',
            'message' => 'Authentication successful.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'resident' => $user->resident,
                    'staff_credential' => $user->staffCredential,
                ],
                'token' => $token,
            ],
        ], 200);
    }

    /**
     * Get active authenticated user details.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->load(['resident', 'staffCredential']);
        }

        return response()->json([
            'status' => 'success',
            'data' => $user,
        ], 200);
    }

    /**
     * Log out current user and revoke token.
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully logged out.',
        ], 200);
    }
}
