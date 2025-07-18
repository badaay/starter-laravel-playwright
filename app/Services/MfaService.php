<?php

namespace App\Services;

use App\Mail\MfaCodeMail;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class MfaService
{
    protected Google2FA $google2fa;

    public function __construct(Google2FA $google2fa)
    {
        $this->google2fa = $google2fa;
    }

    /**
     * Generate a new secret key for a user
     */
    public function generateSecretKey(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Generate a QR code URL for the Google Authenticator app
     */
    public function getQrCodeUrl(User $user, string $secretKey): string
    {
        return $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secretKey
        );
    }

    /**
     * Verify a TOTP code
     */
    public function verifyCode(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }

    /**
     * Generate recovery codes for the user
     */
    public function generateRecoveryCodes(int $count = 8): Collection
    {
        return Collection::times($count, function () {
            return Str::random(10);
        });
    }

    /**
     * Verify a recovery code
     */
    public function verifyRecoveryCode(User $user, string $recoveryCode): bool
    {
        $mfa = $user->mfaConfiguration;

        if (!$mfa || !$mfa->recovery_codes) {
            return false;
        }

        $recoveryCodes = $mfa->recovery_codes;

        if (in_array($recoveryCode, $recoveryCodes)) {
            // Remove used recovery code
            $mfa->recovery_codes = array_values(array_diff($recoveryCodes, [$recoveryCode]));
            $mfa->save();
            return true;
        }

        return false;
    }

    /**
     * Send MFA verification email and store the code
     */
    public function sendMfaCodeByEmail(User $user, string $code = null): string
    {
        $code = $code ?? $this->generateEmailCode();

        // Store the code in the database with expiration
        $mfaConfig = $user->mfaConfiguration;
        if ($mfaConfig) {
            $mfaConfig->update([
                'email_code' => $code,
                'email_code_expires_at' => now()->addMinutes(10), // Code expires in 10 minutes
                'email_code_attempts' => 0, // Reset attempts
            ]);
        }

        Mail::to($user)->send(new MfaCodeMail($code));

        // Also log the code for testing/debugging purposes
        Log::info("MFA code for user {$user->email}: $code");

        return $code;
    }

    /**
     * Verify email MFA code
     */
    public function verifyEmailCode(User $user, string $code): bool
    {
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return false;
        }

        // Allow verification during setup (when email_enabled is false) or when already enabled
        if ($mfaConfig->isEmailCodeValid($code)) {
            $mfaConfig->clearEmailCode();
            return true;
        }

        // Increment attempts on failed verification
        $mfaConfig->incrementEmailCodeAttempts();

        return false;
    }

    /**
     * Request a new email code for MFA
     */
    public function requestEmailCode(User $user): bool
    {
        if (!$user->hasEmailMfaEnabled()) {
            return false;
        }

        $this->sendMfaCodeByEmail($user);
        return true;
    }

    /**
     * Generate a 6-digit verification code for email delivery
     */
    public function generateEmailCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Verify email MFA code for login (requires email MFA to be already enabled)
     */
    public function verifyEmailCodeForLogin(User $user, string $code): bool
    {
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig || !$mfaConfig->email_enabled) {
            return false;
        }

        if ($mfaConfig->isEmailCodeValid($code)) {
            $mfaConfig->clearEmailCode();
            return true;
        }

        // Increment attempts on failed verification
        $mfaConfig->incrementEmailCodeAttempts();

        return false;
    }
}
