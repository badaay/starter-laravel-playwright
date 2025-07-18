<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Models\User;
use App\Models\EmailVerification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EmailVerificationService
{
    /**
     * Send email verification code to user
     */
    public function sendVerificationCode(User $user, string $purpose = 'verification'): string
    {
        $code = $this->generateVerificationCode();
        
        // Store the code in database
        EmailVerification::updateOrCreate(
            [
                'user_id' => $user->id,
                'purpose' => $purpose
            ],
            [
                'code' => $code,
                'expires_at' => now()->addMinutes(10),
                'attempts' => 0,
                'verified_at' => null
            ]
        );

        // Send email
        Mail::to($user)->send(new EmailVerificationMail($code, $purpose));

        // Log for testing/debugging
        Log::info("Email verification code for user {$user->email} (purpose: {$purpose}): {$code}");

        return $code;
    }

    /**
     * Verify email verification code
     */
    public function verifyCode(User $user, string $code, string $purpose = 'verification'): bool
    {
        $verification = EmailVerification::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->where('verified_at', null)
            ->first();

        if (!$verification) {
            return false;
        }

        // Check if code has expired
        if ($verification->expires_at < now()) {
            return false;
        }

        // Check if too many attempts
        if ($verification->attempts >= 3) {
            return false;
        }

        // Check if code matches
        if ($verification->code !== $code) {
            $verification->increment('attempts');
            return false;
        }

        // Mark as verified
        $verification->update([
            'verified_at' => now(),
            'attempts' => 0
        ]);

        // For basic email verification, also mark the user's email as verified in Laravel's system
        if ($purpose === 'verification' && $user->email_verified_at === null) {
            $user->email_verified_at = now();
            $user->save();
        }

        return true;
    }

    /**
     * Check if user has verified their email for a specific purpose
     */
    public function isVerified(User $user, string $purpose = 'verification'): bool
    {
        return EmailVerification::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNotNull('verified_at')
            ->where('verified_at', '>', now()->subHours(24)) // Valid for 24 hours
            ->exists();
    }

    /**
     * Generate a 6-digit verification code
     */
    public function generateVerificationCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Clean up expired verification codes
     */
    public function cleanupExpiredCodes(): int
    {
        return EmailVerification::where('expires_at', '<', now())
            ->orWhere('verified_at', '<', now()->subDays(7))
            ->delete();
    }

    /**
     * Get verification status for user
     */
    public function getVerificationStatus(User $user, string $purpose = 'verification'): array
    {
        $verification = EmailVerification::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->latest()
            ->first();

        // For basic email verification, also check Laravel's built-in email verification
        $isEmailVerified = $purpose === 'verification' && $user->email_verified_at !== null;

        if (!$verification) {
            return [
                'has_pending' => false,
                'is_verified' => $isEmailVerified,
                'expires_at' => null,
                'attempts' => 0,
                'can_request_new' => true
            ];
        }

        $hasCustomVerification = $verification->verified_at !== null;

        return [
            'has_pending' => $verification->verified_at === null && $verification->expires_at > now(),
            'is_verified' => $isEmailVerified || $hasCustomVerification,
            'expires_at' => $verification->expires_at,
            'attempts' => $verification->attempts,
            'can_request_new' => $verification->verified_at === null || $verification->expires_at < now()
        ];
    }

    /**
     * Resend verification code (with rate limiting)
     */
    public function resendCode(User $user, string $purpose = 'verification'): bool
    {
        $lastVerification = EmailVerification::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->latest()
            ->first();

        // Rate limiting: only allow resend if last code was sent more than 1 minute ago
        if ($lastVerification && $lastVerification->created_at > now()->subMinute()) {
            return false;
        }

        $this->sendVerificationCode($user, $purpose);
        return true;
    }

    /**
     * Send verification code for specific actions
     */
    public function sendActionVerificationCode(User $user, string $action): string
    {
        $purposes = [
            'password_reset' => 'password_reset',
            'email_change' => 'email_change',
            'account_deletion' => 'account_deletion',
            'sensitive_action' => 'sensitive_action'
        ];

        $purpose = $purposes[$action] ?? 'verification';
        
        return $this->sendVerificationCode($user, $purpose);
    }

    /**
     * Verify code for specific actions
     */
    public function verifyActionCode(User $user, string $code, string $action): bool
    {
        $purposes = [
            'password_reset' => 'password_reset',
            'email_change' => 'email_change',
            'account_deletion' => 'account_deletion',
            'sensitive_action' => 'sensitive_action'
        ];

        $purpose = $purposes[$action] ?? 'verification';
        
        return $this->verifyCode($user, $code, $purpose);
    }
}
