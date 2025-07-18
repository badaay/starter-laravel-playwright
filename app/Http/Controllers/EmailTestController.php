<?php

namespace App\Http\Controllers;

use App\Services\EmailVerificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmailTestController extends Controller
{
    protected EmailVerificationService $emailService;

    public function __construct(EmailVerificationService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Show the email testing interface
     */
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('EmailTest/Index', [
            'user' => $user,
            'purposes' => [
                'verification' => 'Email Verification',
                'password_reset' => 'Password Reset',
                'email_change' => 'Email Change',
                'account_deletion' => 'Account Deletion',
                'sensitive_action' => 'Sensitive Action'
            ]
        ]);
    }

    /**
     * Send a test email verification code
     */
    public function sendTestCode(Request $request)
    {
        $request->validate([
            'purpose' => 'required|string|in:verification,password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose');

        try {
            $code = $this->emailService->sendVerificationCode($user, $purpose);
            
            return response()->json([
                'success' => true,
                'message' => "Test verification code sent to {$user->email}",
                'code' => $code, // Only for testing - remove in production
                'purpose' => $purpose,
                'email' => $user->email
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test verification of a code
     */
    public function testVerification(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'purpose' => 'required|string|in:verification,password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $code = $request->input('code');
        $purpose = $request->input('purpose');

        $verified = $this->emailService->verifyCode($user, $code, $purpose);
        
        return response()->json([
            'success' => $verified,
            'message' => $verified 
                ? 'Code verified successfully!' 
                : 'Invalid or expired verification code.',
            'status' => $this->emailService->getVerificationStatus($user, $purpose)
        ]);
    }

    /**
     * Get verification status
     */
    public function getStatus(Request $request)
    {
        $request->validate([
            'purpose' => 'string|in:verification,password_reset,email_change,account_deletion,sensitive_action'
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose', 'verification');
        $status = $this->emailService->getVerificationStatus($user, $purpose);

        return response()->json([
            'status' => $status,
            'user' => [
                'email' => $user->email,
                'name' => $user->name
            ]
        ]);
    }

    /**
     * Demonstrate different email types
     */
    public function demonstrateEmails()
    {
        $user = Auth::user();
        $results = [];

        $purposes = ['verification', 'password_reset', 'email_change', 'account_deletion', 'sensitive_action'];

        foreach ($purposes as $purpose) {
            try {
                $code = $this->emailService->sendVerificationCode($user, $purpose);
                $results[$purpose] = [
                    'success' => true,
                    'code' => $code,
                    'message' => "Code sent for {$purpose}"
                ];
            } catch (\Exception $e) {
                $results[$purpose] = [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => 'Demonstration emails sent (check logs for codes)',
            'results' => $results,
            'note' => 'In production, codes would only be sent via email'
        ]);
    }
}
