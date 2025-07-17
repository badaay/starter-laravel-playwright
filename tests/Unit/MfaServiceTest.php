<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\MfaConfiguration;
use App\Services\MfaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PragmaRX\Google2FA\Google2FA;
use Mockery;
use Illuminate\Support\Facades\Mail;
use App\Mail\MfaCodeMail;

class MfaServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $google2fa;
    protected $mfaService;
    protected $user;

    public function setUp(): void
    {
        parent::setUp();

        // Mock Google2FA
        $this->google2fa = Mockery::mock(Google2FA::class);
        $this->mfaService = new MfaService($this->google2fa);

        // Create a test user
        $this->user = User::factory()->create();
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_generate_secret_key()
    {
        $secretKey = 'TESTSECRETKEY';
        $this->google2fa->shouldReceive('generateSecretKey')->once()->andReturn($secretKey);

        $result = $this->mfaService->generateSecretKey();
        $this->assertEquals($secretKey, $result);
    }

    public function test_get_qr_code_url()
    {
        $secretKey = 'TESTSECRETKEY';
        $qrCodeUrl = 'otpauth://totp/Laravel:test@example.com?secret=TESTSECRETKEY&issuer=Laravel';

        $this->google2fa->shouldReceive('getQRCodeUrl')
            ->once()
            ->with(config('app.name'), $this->user->email, $secretKey)
            ->andReturn($qrCodeUrl);

        $result = $this->mfaService->getQrCodeUrl($this->user, $secretKey);
        $this->assertEquals($qrCodeUrl, $result);
    }

    public function test_verify_code()
    {
        $secretKey = 'TESTSECRETKEY';
        $code = '123456';

        $this->google2fa->shouldReceive('verifyKey')
            ->once()
            ->with($secretKey, $code)
            ->andReturn(true);

        $result = $this->mfaService->verifyCode($secretKey, $code);
        $this->assertTrue($result);
    }

    public function test_generate_recovery_codes()
    {
        $recoveryCodes = $this->mfaService->generateRecoveryCodes(4);

        $this->assertCount(4, $recoveryCodes);
        foreach ($recoveryCodes as $code) {
            $this->assertEquals(10, strlen($code));
        }
    }

    public function test_verify_recovery_code()
    {
        // Create MFA configuration with recovery codes
        $recoveryCodes = ['code1', 'code2', 'code3'];
        $mfaConfig = new MfaConfiguration();
        $mfaConfig->user_id = $this->user->id;
        $mfaConfig->recovery_codes = $recoveryCodes;
        $this->user->mfaConfiguration()->save($mfaConfig);

        // Test valid recovery code
        $result = $this->mfaService->verifyRecoveryCode($this->user, 'code2');
        $this->assertTrue($result);

        // Reload the user to get the updated recovery codes
        $this->user->refresh();

        // Check that the used recovery code was removed
        $this->assertCount(2, $this->user->mfaConfiguration->recovery_codes);
        $this->assertNotContains('code2', $this->user->mfaConfiguration->recovery_codes);

        // Test invalid recovery code
        $result = $this->mfaService->verifyRecoveryCode($this->user, 'invalid');
        $this->assertFalse($result);
    }

    public function test_generate_email_code()
    {
        $code = $this->mfaService->generateEmailCode();

        $this->assertEquals(6, strlen($code));
        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
    }

    public function test_send_mfa_code_by_email()
    {
        Mail::fake();

        $code = '123456';
        $this->mfaService->sendMfaCodeByEmail($this->user, $code);

        Mail::assertSent(MfaCodeMail::class, function ($mail) use ($code) {
            return $mail->hasTo($this->user->email) && $mail->code === $code;
        });
    }
}
