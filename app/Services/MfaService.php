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
     * Send MFA verification email
     */
    public function sendMfaCodeByEmail(User $user, string $code): void
    {
        Mail::to($user)->send(new MfaCodeMail($code));
        // Also log the code for testing/debugging purposes
        Log::info("MFA code for user {$user->email}: $code");
    }

    /**
     * Generate a 6-digit verification code for email delivery
     */
    public function generateEmailCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
