<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MfaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class MfaController extends Controller
{
    protected $mfaService;

    public function __construct(MfaService $mfaService)
    {
        $this->mfaService = $mfaService;
        // In Laravel 12, middleware should be applied in the routes file, not here
    }

    /**
     * Show the MFA setup page.
     */
    public function setup()
    {
        $user = Auth::user();
        $secretKey = $this->mfaService->generateSecretKey();

        // Create or update MFA configuration
        $mfaConfig = $user->mfaConfiguration()->firstOrNew();
        $mfaConfig->secret = $secretKey;
        $mfaConfig->recovery_codes = $this->mfaService->generateRecoveryCodes()->toArray();
        $this->saveMfaConfig($mfaConfig);

        // Generate QR code - with larger size
        $qrCodeUrl = $this->mfaService->getQrCodeUrl($user, $secretKey);
        $renderer = new ImageRenderer(
            new RendererStyle(300), // Increased from 200 to 300
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);

        return Inertia::render('Auth/MfaSetup', [
            'qrCodeSvg' => $qrCodeSvg,
            'secretKey' => $secretKey,
            'recoveryCodes' => $mfaConfig->recovery_codes,
        ]);
    }

    /**
     * Verify and enable MFA.
     */
    public function enable(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'type' => 'required|in:totp,email',
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return back()->withErrors(['code' => 'MFA setup not initialized.']);
        }

        $verified = false;

        if ($request->type === 'totp') {
            $verified = $this->mfaService->verifyCode($mfaConfig->secret, $request->code);
            if ($verified) {
                $mfaConfig->totp_enabled = true;
            }
        } elseif ($request->type === 'email') {
            $verified = $this->mfaService->verifyEmailCode($user, $request->code);
            if ($verified) {
                $mfaConfig->email_enabled = true;
            }
        }

        if ($verified) {
            $mfaConfig->enabled = $mfaConfig->hasAnyMfaEnabled();
            $mfaConfig->verified_at = now();
            $this->saveMfaConfig($mfaConfig);

            $type_name = $request->type === 'totp' ? 'Authenticator App' : 'Email';
            return redirect()->route('profile.edit')
                ->with('status', "mfa-{$request->type}-enabled")
                ->with('message', "{$type_name} MFA has been enabled successfully.");
        }

        return back()->withErrors(['code' => 'The verification code is invalid.']);
    }

    /**
     * Disable specific MFA type.
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
            'type' => 'required|in:totp,email,all',
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return redirect()->route('profile.edit')
                ->withErrors(['error' => 'MFA configuration not found.']);
        }

        if ($request->type === 'totp') {
            $mfaConfig->totp_enabled = false;
            $mfaConfig->secret = null; // Clear the secret key
        } elseif ($request->type === 'email') {
            $mfaConfig->email_enabled = false;
            $mfaConfig->clearEmailCode(); // Clear any pending codes
        } elseif ($request->type === 'all') {
            $mfaConfig->totp_enabled = false;
            $mfaConfig->email_enabled = false;
            $mfaConfig->secret = null;
            $mfaConfig->clearEmailCode();
        }

        // Update the general enabled flag
        $mfaConfig->enabled = $mfaConfig->hasAnyMfaEnabled();
        $this->saveMfaConfig($mfaConfig);

        $type_name = match ($request->type) {
            'totp' => 'Authenticator App',
            'email' => 'Email',
            'all' => 'All',
        };

        return redirect()->route('profile.edit')
            ->with('status', "mfa-{$request->type}-disabled")
            ->with('message', "{$type_name} MFA has been disabled.");
    }

    /**
     * Show the MFA challenge page.
     */
    public function challenge()
    {
        if (session('mfa_authenticated')) {
            return redirect()->intended();
        }

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;
        
        $usesRecoveryCode = session('use_recovery_code', false);
        $usesEmailCode = session('use_email_code', false);

        // If user only has email MFA enabled and no specific mode is set, automatically use email
        if ($mfaConfig && !$mfaConfig->totp_enabled && $mfaConfig->email_enabled && !$usesRecoveryCode && !$usesEmailCode) {
            session(['use_email_code' => true]);
            $usesEmailCode = true;
            
            // Automatically send email code
            $this->mfaService->sendMfaCodeByEmail($user);
        }

        return Inertia::render('Auth/MfaChallenge', [
            'usesRecoveryCode' => $usesRecoveryCode,
            'usesEmailCode' => $usesEmailCode,
        ]);
    }

    /**
     * Verify MFA code.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'type' => 'sometimes|in:totp,email,recovery',
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig || !$mfaConfig->enabled) {
            return redirect()->intended();
        }

        $isValid = false;
        $type = $request->type ?? 'totp';

        // Determine verification type based on what's enabled and what's requested
        if ($type === 'recovery' || session('use_recovery_code', false)) {
            $isValid = $this->mfaService->verifyRecoveryCode($user, $request->code);
        } elseif ($type === 'email' || session('use_email_code', false)) {
            $isValid = $this->mfaService->verifyEmailCodeForLogin($user, $request->code);
        } elseif ($mfaConfig->totp_enabled && $mfaConfig->secret) {
            // Only try TOTP if it's enabled and secret exists
            $isValid = $this->mfaService->verifyCode($mfaConfig->secret, $request->code);
        } elseif ($mfaConfig->email_enabled) {
            // Fall back to email verification if TOTP is not available
            $isValid = $this->mfaService->verifyEmailCodeForLogin($user, $request->code);
        }

        if ($isValid) {
            $request->session()->put('mfa_authenticated', true);
            $request->session()->forget('use_recovery_code');
            $request->session()->forget('use_email_code');
            $request->session()->forget('mfa_email_code');
            return redirect()->intended();
        }

        return back()->withErrors(['code' => 'The verification code is invalid.']);
    }

    /**
     * Show recovery code form.
     */
    public function showRecoveryForm()
    {
        $request = request();
        $request->session()->put('use_recovery_code', true);

        return redirect()->route('mfa.challenge');
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes()
    {
        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if ($mfaConfig) {
            $mfaConfig->recovery_codes = $this->mfaService->generateRecoveryCodes()->toArray();
            $mfaConfig->save($mfaConfig);

            return redirect()->route('profile.edit')
                ->with('status', 'recovery-codes-regenerated')
                ->with('recovery-codes', $mfaConfig->recovery_codes);
        }

        return back()->withErrors(['error' => 'MFA not configured.']);
    }

    /**
     * Setup email MFA.
     */
    public function setupEmailMfa()
    {
        $user = Auth::user();

        // Create or get MFA configuration
        $mfaConfig = $user->mfaConfiguration()->firstOrCreate([
            'user_id' => $user->id,
        ]);

        return Inertia::render('Auth/MfaEmailSetup');
    }

    /**
     * Send email code for setup.
     */
    public function sendEmailCode()
    {
        $user = Auth::user();

        // Send email code for verification
        $code = $this->mfaService->sendMfaCodeByEmail($user);

        return back()->with('status', 'email-code-sent')
            ->with('message', 'A verification code has been sent to your email address.');
    }

    /**
     * Enable email MFA.
     */
    public function enableEmailMfa(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return back()->withErrors(['code' => 'MFA setup not initialized.']);
        }

        $verified = $this->mfaService->verifyEmailCode($user, $request->code);

        if ($verified) {
            $mfaConfig->email_enabled = true;
            $mfaConfig->enabled = $mfaConfig->hasAnyMfaEnabled();
            $mfaConfig->verified_at = now();
            $this->saveMfaConfig($mfaConfig);

            return redirect()->route('profile.edit')
                ->with('status', 'mfa-email-enabled')
                ->with('message', 'Email MFA has been enabled successfully.');
        }

        return back()->withErrors(['code' => 'The verification code is invalid.']);
    }

    /**
     * Disable TOTP MFA.
     */
    public function disableTotpMfa(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return redirect()->route('profile.edit')
                ->withErrors(['error' => 'MFA configuration not found.']);
        }

        $mfaConfig->totp_enabled = false;
        $mfaConfig->secret = null; // Clear the secret key
        $mfaConfig->enabled = $mfaConfig->hasAnyMfaEnabled();
        $this->saveMfaConfig($mfaConfig);

        return redirect()->route('profile.edit')
            ->with('status', 'mfa-totp-disabled')
            ->with('message', 'Authenticator App MFA has been disabled.');
    }

    /**
     * Disable email MFA.
     */
    public function disableEmailMfa(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return redirect()->route('profile.edit')
                ->withErrors(['error' => 'MFA configuration not found.']);
        }

        $mfaConfig->email_enabled = false;
        $mfaConfig->clearEmailCode(); // Clear any pending codes
        $mfaConfig->enabled = $mfaConfig->hasAnyMfaEnabled();
        $this->saveMfaConfig($mfaConfig);

        return redirect()->route('profile.edit')
            ->with('status', 'mfa-email-disabled')
            ->with('message', 'Email MFA has been disabled.');
    }

    /**
     * Request email code.
     */
    public function requestEmailCode()
    {
        $user = Auth::user();

        if (!$user->hasEmailMfaEnabled()) {
            return response()->json([
                'error' => 'Email MFA is not enabled for this account.'
            ], 400);
        }

        $success = $this->mfaService->requestEmailCode($user);

        if ($success) {
            return response()->json([
                'message' => 'Verification code sent to your email address.',
                'email' => $user->email
            ]);
        }

        return response()->json([
            'error' => 'Failed to send verification code.'
        ], 500);
    }

    /**
     * Show email code form for MFA challenge.
     */
    public function showEmailMfaForm()
    {
        $user = Auth::user();

        if (!$user->hasEmailMfaEnabled()) {
            return redirect()->route('mfa.challenge')
                ->withErrors(['error' => 'Email MFA is not enabled.']);
        }

        // Send a new email code
        $this->mfaService->requestEmailCode($user);

        return Inertia::render('Auth/MfaChallenge', [
            'email_mfa' => true,
            'email' => $user->email,
            'message' => 'A verification code has been sent to your email address.',
        ]);
    }

    /**
     * Helper method to save MFA configuration.
     *
     * This is a workaround for linting issues with the save() method.
     */
    private function saveMfaConfig($mfaConfig)
    {
        $mfaConfig->save();
    }
}
