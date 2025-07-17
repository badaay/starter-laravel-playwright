<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureMfaAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            // If MFA is enabled but not authenticated in session, redirect to MFA challenge
            if ($user->hasMfaEnabled() && !session('mfa_authenticated')) {
                return redirect()->route('mfa.challenge');
            }
        }

        return $next($request);
    }
}
