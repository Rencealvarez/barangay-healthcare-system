<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request and check if user possesses any of the required roles.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated. Access token or valid session required.',
            ], 401);
        }

        $allowedRoles = [];
        foreach ($roles as $roleArg) {
            foreach (explode('|', $roleArg) as $pipeSplit) {
                foreach (explode(',', $pipeSplit) as $roleItem) {
                    $trimmed = trim($roleItem);
                    if ($trimmed !== '') {
                        $allowedRoles[] = $trimmed;
                    }
                }
            }
        }

        if (!empty($allowedRoles) && !in_array($user->role, $allowedRoles)) {
            return response()->json([
                'status'         => 'error',
                'message'        => 'Forbidden: Your role [' . $user->role . '] is not authorized to access this resource.',
                'required_roles' => $allowedRoles,
            ], 403);
        }

        return $next($request);
    }
}
