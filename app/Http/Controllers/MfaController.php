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
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig) {
            return back()->withErrors(['code' => 'MFA setup not initialized.']);
        }

        if ($this->mfaService->verifyCode($mfaConfig->secret, $request->code)) {
            $mfaConfig->enabled = true;
            $mfaConfig->verified_at = now();
            $this->saveMfaConfig($mfaConfig);

            return redirect()->route('profile.edit')
                ->with('status', 'mfa-enabled');
        }

        return back()->withErrors(['code' => 'The verification code is invalid.']);
    }

    /**
     * Disable MFA.
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();

        if ($user->mfaConfiguration) {
            $user->mfaConfiguration->enabled = false;
            $this->saveMfaConfig($user->mfaConfiguration);
        }

        return redirect()->route('profile.edit')
            ->with('status', 'mfa-disabled');
    }

    /**
     * Show the MFA challenge page.
     */
    public function challenge()
    {
        if (session('mfa_authenticated')) {
            return redirect()->intended();
        }

        return Inertia::render('Auth/MfaChallenge', [
            'usesRecoveryCode' => session('use_recovery_code', false),
            'usesEmailCode' => session('use_email_code', false),
        ]);
    }

    /**
     * Verify MFA code.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = Auth::user();
        $mfaConfig = $user->mfaConfiguration;

        if (!$mfaConfig || !$mfaConfig->enabled) {
            return redirect()->intended();
        }

        $isValid = false;

        if (session('use_recovery_code', false)) {
            $isValid = $this->mfaService->verifyRecoveryCode($user, $request->code);
        } elseif (session('use_email_code', false)) {
            $isValid = $this->verifyEmailCode($request->code);
        } else {
            $isValid = $this->mfaService->verifyCode($mfaConfig->secret, $request->code);
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
     * Show email code form.
     */
    public function showEmailForm()
    {
        $request = request();
        $request->session()->put('use_email_code', true);
        $request->session()->forget('use_recovery_code');

        // Generate and send email code
        $user = Auth::user();
        $code = $this->mfaService->generateEmailCode();

        // Store the code in the session with a timestamp
        $request->session()->put('mfa_email_code', [
            'code' => $code,
            'expires_at' => now()->addMinutes(10)->timestamp,
        ]);

        // Send the code via email
        $this->mfaService->sendMfaCodeByEmail($user, $code);

        return redirect()->route('mfa.challenge');
    }

    /**
     * Verify an email code.
     */
    public function verifyEmailCode(string $code): bool
    {
        $emailCode = session('mfa_email_code');

        if (!$emailCode || !is_array($emailCode)) {
            return false;
        }

        // Check if the code is expired
        if (time() > $emailCode['expires_at']) {
            return false;
        }

        // Verify the code
        return $emailCode['code'] === $code;
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
