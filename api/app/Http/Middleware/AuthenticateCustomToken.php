<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateCustomToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token && str_starts_with($token, 'token_')) {
            $parts = explode('_', $token);
            if (count($parts) >= 3) {
                $decoded = base64_decode($parts[2]);
                if ($decoded) {
                    $userParts = explode(':', $decoded);
                    if (count($userParts) >= 2) {
                        $userId = $userParts[0];
                        $user = User::find($userId);
                        if ($user) {
                            // Authenticate the user for the current request
                            Auth::setUser($user);
                        }
                    }
                }
            }
        }

        return $next($request);
    }
}
