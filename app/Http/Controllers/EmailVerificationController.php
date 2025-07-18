<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EmailVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmailVerificationController extends Controller
{
    protected EmailVerificationService $emailVerificationService;

    public function __construct(EmailVerificationService $emailVerificationService)
    {
        $this->emailVerificationService = $emailVerificationService;
    }

    /**
     * Show the email verification form
     */
    public function show()
    {
        $user = Auth::user();
        $status = $this->emailVerificationService->getVerificationStatus($user);

        return Inertia::render('Auth/EmailVerification', [
            'status' => $status,
            'email' => $user->email
        ]);
    }

    /**
     * Send verification code to user's email
     */
    public function sendCode(Request $request)
    {
        $request->validate([
            'purpose' => 'string|in:verification,password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose', 'verification');

        // Check rate limiting
        if (!$this->emailVerificationService->resendCode($user, $purpose)) {
            return back()->withErrors([
                'code' => 'Please wait at least 1 minute before requesting a new code.'
            ]);
        }

        return back()->with('status', 'verification-code-sent')
                    ->with('message', 'Verification code sent to your email address.');
    }

    /**
     * Verify the email verification code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'purpose' => 'string|in:verification,password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose', 'verification');

        if ($this->emailVerificationService->verifyCode($user, $request->code, $purpose)) {
            $messages = [
                'verification' => 'Email verified successfully!',
                'password_reset' => 'Identity verified. You can now reset your password.',
                'email_change' => 'Email change verified successfully!',
                'account_deletion' => 'Account deletion verified.',
                'sensitive_action' => 'Identity verified successfully.'
            ];

            $message = $messages[$purpose] ?? 'Verification successful!';

            // Refresh the user session to ensure email_verified_at is updated
            $updatedUser = User::find($user->id);
            Auth::setUser($updatedUser);

            // For basic email verification, redirect to profile to show updated status
            $redirectRoute = $purpose === 'verification' ? 'profile.edit' : 'dashboard';

            return redirect()->route($redirectRoute)
                           ->with('status', 'email-verified')
                           ->with('message', $message);
        }

        // Get current status to check for specific error messages
        $status = $this->emailVerificationService->getVerificationStatus($user, $purpose);
        
        $errorMessage = 'The verification code is invalid.';
        
        if ($status['attempts'] >= 3) {
            $errorMessage = 'Too many failed attempts. Please request a new code.';
        } elseif (!$status['has_pending']) {
            $errorMessage = 'The verification code has expired. Please request a new one.';
        }

        return back()->withErrors(['code' => $errorMessage]);
    }

    /**
     * Resend verification code
     */
    public function resend(Request $request)
    {
        $request->validate([
            'purpose' => 'string|in:verification,password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose', 'verification');

        if ($this->emailVerificationService->resendCode($user, $purpose)) {
            return back()->with('status', 'verification-code-resent')
                        ->with('message', 'A new verification code has been sent to your email.');
        }

        return back()->withErrors([
            'code' => 'Please wait at least 1 minute before requesting a new code.'
        ]);
    }

    /**
     * Get verification status via API
     */
    public function status(Request $request)
    {
        $request->validate([
            'purpose' => 'string|in:verification,password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose', 'verification');
        $status = $this->emailVerificationService->getVerificationStatus($user, $purpose);

        return response()->json([
            'status' => $status,
            'email' => $user->email
        ]);
    }

    /**
     * Send verification code for specific action
     */
    public function sendActionCode(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $action = $request->input('action');

        try {
            $this->emailVerificationService->sendActionVerificationCode($user, $action);
            
            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to your email address.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code. Please try again.'
            ], 500);
        }
    }

    /**
     * Verify code for specific action
     */
    public function verifyActionCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'action' => 'required|string|in:password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $action = $request->input('action');

        if ($this->emailVerificationService->verifyActionCode($user, $request->code, $action)) {
            return response()->json([
                'success' => true,
                'message' => 'Verification successful!'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired verification code.'
        ], 422);
    }
}
