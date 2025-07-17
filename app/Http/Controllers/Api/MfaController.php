<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MfaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MfaController extends Controller
{
    protected $mfaService;

    public function __construct(MfaService $mfaService)
    {
        $this->mfaService = $mfaService;
    }

    /**
     * Get MFA status for the authenticated user.
     *
     * @authenticated
     * @return \Illuminate\Http\JsonResponse
     */
    public function status()
    {
        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        return response()->json([
            'enabled' => $user->hasMfaEnabled(),
            'verified' => $mfaConfig ? $mfaConfig->verified_at !== null : false,
        ]);
    }

    /**
     * Setup MFA and generate QR code and secret key.
     *
     * @authenticated
     * @return \Illuminate\Http\JsonResponse
     */
    public function setup()
    {
        $user = Auth::user();
        $secretKey = $this->mfaService->generateSecretKey();

        // Create or update MFA configuration
        $mfaConfig = $user->mfaConfiguration()->firstOrNew();
        $mfaConfig->secret = $secretKey;
        $mfaConfig->recovery_codes = $this->mfaService->generateRecoveryCodes()->toArray();
        $mfaConfig->save();

        // Generate QR code URL (client can generate QR from this)
        $qrCodeUrl = $this->mfaService->getQrCodeUrl($user, $secretKey);

        return response()->json([
            'secret_key' => $secretKey,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $mfaConfig->recovery_codes,
        ]);
    }

    /**
     * Verify and enable MFA.
     *
     * @authenticated
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function enable(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return response()->json(['error' => 'MFA setup not initialized'], 400);
        }

        if ($this->mfaService->verifyCode($mfaConfig->secret, $request->code)) {
            $mfaConfig->enabled = true;
            $mfaConfig->verified_at = now();
            $mfaConfig->save();

            return response()->json(['message' => 'MFA enabled successfully']);
        }

        return response()->json(['error' => 'Invalid verification code'], 422);
    }

    /**
     * Disable MFA.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = Auth::user();

        if (!$user->mfaConfiguration) {
            return response()->json(['error' => 'MFA is not enabled'], 400);
        }

        $user->mfaConfiguration->enabled = false;
        $user->mfaConfiguration->save();

        return response()->json(['message' => 'MFA disabled successfully']);
    }

    /**
     * Verify MFA code during login challenge.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'type' => 'required|in:totp,recovery,email',
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig || !$mfaConfig->enabled) {
            return response()->json(['error' => 'MFA is not enabled'], 400);
        }

        $isValid = false;

        switch ($request->type) {
            case 'totp':
                $isValid = $this->mfaService->verifyCode($mfaConfig->secret, $request->code);
                break;
            case 'recovery':
                $isValid = $this->mfaService->verifyRecoveryCode($user, $request->code);
                break;
            case 'email':
                // This would need to be implemented with session handling
                // For API, we'd need a different approach like temporary tokens
                return response()->json(['error' => 'Email verification not supported via API'], 400);
        }

        if ($isValid) {
            // For API, we'd return a token rather than setting session
            return response()->json(['message' => 'MFA verification successful']);
        }

        return response()->json(['error' => 'Invalid verification code'], 422);
    }

    /**
     * Request a new email verification code.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function requestEmailCode()
    {
        $user = Auth::user();

        if (!$user->hasMfaEnabled()) {
            return response()->json(['error' => 'MFA is not enabled'], 400);
        }

        $code = $this->mfaService->generateEmailCode();

        // Store the code with expiration (in a real application, you'd use a cache or database)
        // Here, we're returning it for demonstration purposes only
        $this->mfaService->sendMfaCodeByEmail($user, $code);

        return response()->json(['message' => 'Email verification code sent']);
    }

    /**
     * Regenerate recovery codes.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function regenerateRecoveryCodes()
    {
        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return response()->json(['error' => 'MFA not configured'], 400);
        }

        $mfaConfig->recovery_codes = $this->mfaService->generateRecoveryCodes()->toArray();
        $mfaConfig->save();

        return response()->json([
            'message' => 'Recovery codes regenerated successfully',
            'recovery_codes' => $mfaConfig->recovery_codes,
        ]);
    }
}
