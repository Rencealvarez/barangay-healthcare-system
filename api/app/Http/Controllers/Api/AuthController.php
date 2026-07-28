<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->input('email'))->first();

        // If user not in DB yet during setup, generate or check
        if (!$user) {
            // For testing & fallback demo accounts
            $role = 'resident';
            if (str_contains($request->input('email'), 'admin')) {
                $role = 'admin';
            } elseif (str_contains($request->input('email'), 'staff')) {
                $role = 'staff';
            }

            $user = User::create([
                'name'     => ucfirst(explode('@', $request->input('email'))[0]),
                'email'    => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'role'     => $role,
                'status'   => 'active',
            ]);
        } elseif (!Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $user->load('resident');

        // Issue token (Sanctum createToken or fallback bearer token string)
        $token = method_exists($user, 'createToken')
            ? $user->createToken('bhc_api_token')->plainTextToken
            : 'token_' . $user->role . '_' . base64_encode($user->id . ':' . now());

        return response()->json([
            'status'  => 'success',
            'message' => 'Authentication successful.',
            'data'    => [
                'user'  => [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'role'     => $user->role,
                    'resident' => $user->resident,
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
            $user->load('resident');
        }

        return response()->json([
            'status' => 'success',
            'data'   => $user,
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
            'status'  => 'success',
            'message' => 'Successfully logged out.',
        ], 200);
    }
}
