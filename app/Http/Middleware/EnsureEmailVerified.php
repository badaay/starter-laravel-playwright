<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\EmailVerificationService;

/**
 * Middleware to ensure user's email is verified before accessing protected routes
 */
class EnsureEmailVerified
{
    protected EmailVerificationService $emailVerificationService;

    /**
     * Create a new middleware instance
     *
     * @param EmailVerificationService $emailVerificationService
     */
    public function __construct(EmailVerificationService $emailVerificationService)
    {
        $this->emailVerificationService = $emailVerificationService;
    }

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     * @param mixed ...$guards
     * @return Response
     */
    public function handle(Request $request, Closure $next, ...$guards): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Check if email is verified using our custom email verification service
        $status = $this->emailVerificationService->getVerificationStatus($user);

        if (!$status['is_verified']) {
            // Allow access to email verification routes
            if (
                $request->routeIs('email-verification.*')
                || $request->routeIs('logout')
                || $request->routeIs('profile.edit')
            ) {
                return $next($request);
            }

            // For API requests, return JSON response
            if ($request->expectsJson()) {
                return response()->json(
                    [
                        'message' => 'Email verification required.',
                        'redirect' => route('email-verification.show')
                    ],
                    403
                );
            }

            // Redirect to email verification page
            return redirect()->route('email-verification.show')
                ->with('message', 'Please verify your email address to continue.');
        }

        return $next($request);
    }
}
