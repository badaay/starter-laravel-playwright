<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\EmailVerification;
use App\Services\EmailVerificationService;
use App\Mail\EmailVerificationMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;
use Carbon\Carbon;

class EmailVerificationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected EmailVerificationService $emailService;
    protected User $user;

    public function setUp(): void
    {
        parent::setUp();
        
        $this->emailService = new EmailVerificationService();
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'name' => 'Test User'
        ]);

        // Fake mail sending
        Mail::fake();
    }

    /** @test */
    public function it_can_send_verification_code()
    {
        $code = $this->emailService->sendVerificationCode($this->user);

        // Assert email was sent
        Mail::assertSent(EmailVerificationMail::class, function ($mail) use ($code) {
            return $mail->hasTo($this->user->email) && 
                   $mail->code === $code;
        });

        // Assert database record was created
        $this->assertDatabaseHas('email_verifications', [
            'user_id' => $this->user->id,
            'purpose' => 'verification',
            'code' => $code,
            'attempts' => 0,
            'verified_at' => null
        ]);

        // Assert code is 6 digits
        $this->assertEquals(6, strlen($code));
        $this->assertTrue(is_numeric($code));
    }

    /** @test */
    public function it_can_send_verification_code_with_different_purposes()
    {
        $purposes = ['verification', 'password_reset', 'email_change', 'account_deletion', 'sensitive_action'];

        foreach ($purposes as $purpose) {
            $code = $this->emailService->sendVerificationCode($this->user, $purpose);

            $this->assertDatabaseHas('email_verifications', [
                'user_id' => $this->user->id,
                'purpose' => $purpose,
                'code' => $code
            ]);
        }

        Mail::assertSent(EmailVerificationMail::class, 5);
    }

    /** @test */
    public function it_can_verify_valid_code()
    {
        $code = $this->emailService->sendVerificationCode($this->user);

        $result = $this->emailService->verifyCode($this->user, $code);

        $this->assertTrue($result);
        
        // Assert verification was marked as verified
        $this->assertDatabaseHas('email_verifications', [
            'user_id' => $this->user->id,
            'code' => $code,
            'attempts' => 0
        ]);

        $verification = EmailVerification::where('user_id', $this->user->id)
            ->where('code', $code)
            ->first();
        
        $this->assertNotNull($verification->verified_at);
        
        // For basic email verification, user's email_verified_at should be updated
        $this->user->refresh();
        $this->assertNotNull($this->user->email_verified_at);
    }

    /** @test */
    public function it_rejects_invalid_code()
    {
        $this->emailService->sendVerificationCode($this->user);

        $result = $this->emailService->verifyCode($this->user, '000000');

        $this->assertFalse($result);
        
        // Assert attempts were incremented
        $this->assertDatabaseHas('email_verifications', [
            'user_id' => $this->user->id,
            'attempts' => 1,
            'verified_at' => null
        ]);
    }

    /** @test */
    public function it_rejects_expired_code()
    {
        $code = $this->emailService->sendVerificationCode($this->user);

        // Make the code expired
        EmailVerification::where('user_id', $this->user->id)
            ->update(['expires_at' => Carbon::now()->subMinutes(15)]);

        $result = $this->emailService->verifyCode($this->user, $code);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_rejects_code_after_max_attempts()
    {
        $code = $this->emailService->sendVerificationCode($this->user);

        // Set attempts to maximum
        EmailVerification::where('user_id', $this->user->id)
            ->update(['attempts' => 3]);

        $result = $this->emailService->verifyCode($this->user, $code);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_can_check_verification_status()
    {
        // Ensure user email is not verified initially
        $this->user->email_verified_at = null;
        $this->user->save();
        
        // Test with no verification
        $status = $this->emailService->getVerificationStatus($this->user);
        
        $this->assertFalse($status['has_pending']);
        $this->assertFalse($status['is_verified']);
        $this->assertTrue($status['can_request_new']);
        $this->assertEquals(0, $status['attempts']);

        // Test with pending verification
        $code = $this->emailService->sendVerificationCode($this->user);
        $status = $this->emailService->getVerificationStatus($this->user);
        
        $this->assertTrue($status['has_pending']);
        $this->assertFalse($status['is_verified']);
        $this->assertEquals(0, $status['attempts']);

        // Test with verified code
        $this->emailService->verifyCode($this->user, $code);
        $status = $this->emailService->getVerificationStatus($this->user);
        
        $this->assertFalse($status['has_pending']);
        $this->assertTrue($status['is_verified']);
    }

    /** @test */
    public function it_can_resend_code_with_rate_limiting()
    {
        // First send should work
        $result = $this->emailService->resendCode($this->user);
        $this->assertTrue($result);

        // Immediate resend should be blocked
        $result = $this->emailService->resendCode($this->user);
        $this->assertFalse($result);

        // After time passes, should work again
        $this->travel(2)->minutes();
        $result = $this->emailService->resendCode($this->user);
        $this->assertTrue($result);
    }

    /** @test */
    public function it_generates_unique_codes()
    {
        $codes = [];
        
        for ($i = 0; $i < 10; $i++) {
            $codes[] = $this->emailService->generateVerificationCode();
        }

        // All codes should be 6 digits
        foreach ($codes as $code) {
            $this->assertEquals(6, strlen($code));
            $this->assertTrue(is_numeric($code));
        }

        // Codes should be different (very high probability)
        $this->assertEquals(10, count(array_unique($codes)));
    }

    /** @test */
    public function it_can_send_action_verification_codes()
    {
        $actions = [
            'password_reset' => 'password_reset',
            'email_change' => 'email_change',
            'account_deletion' => 'account_deletion',
            'sensitive_action' => 'sensitive_action'
        ];

        foreach ($actions as $action => $expectedPurpose) {
            $code = $this->emailService->sendActionVerificationCode($this->user, $action);
            
            $this->assertDatabaseHas('email_verifications', [
                'user_id' => $this->user->id,
                'purpose' => $expectedPurpose,
                'code' => $code
            ]);
        }
    }

    /** @test */
    public function it_can_verify_action_codes()
    {
        $code = $this->emailService->sendActionVerificationCode($this->user, 'password_reset');
        
        $result = $this->emailService->verifyActionCode($this->user, $code, 'password_reset');
        
        $this->assertTrue($result);
    }

    /** @test */
    public function it_can_cleanup_expired_codes()
    {
        // Create some expired codes
        EmailVerification::create([
            'user_id' => $this->user->id,
            'purpose' => 'verification',
            'code' => '111111',
            'expires_at' => Carbon::now()->subHours(2),
            'attempts' => 0
        ]);

        EmailVerification::create([
            'user_id' => $this->user->id,
            'purpose' => 'verification',
            'code' => '222222',
            'expires_at' => Carbon::now()->addHours(1),
            'attempts' => 0
        ]);

        // Create some old verified codes
        EmailVerification::create([
            'user_id' => $this->user->id,
            'purpose' => 'verification',
            'code' => '333333',
            'expires_at' => Carbon::now()->subHours(1),
            'attempts' => 0,
            'verified_at' => Carbon::now()->subDays(8)
        ]);

        $deletedCount = $this->emailService->cleanupExpiredCodes();

        $this->assertEquals(2, $deletedCount);
        
        // Only the valid unexpired code should remain
        $this->assertDatabaseHas('email_verifications', [
            'code' => '222222'
        ]);
        
        $this->assertDatabaseMissing('email_verifications', [
            'code' => '111111'
        ]);
        
        $this->assertDatabaseMissing('email_verifications', [
            'code' => '333333'
        ]);
    }

    /** @test */
    public function it_updates_existing_verification_when_resending()
    {
        $firstCode = $this->emailService->sendVerificationCode($this->user);
        
        // Travel forward to allow resend
        $this->travel(2)->minutes();
        
        $secondCode = $this->emailService->sendVerificationCode($this->user);

        // Should have only one record per user per purpose
        $verifications = EmailVerification::where('user_id', $this->user->id)
            ->where('purpose', 'verification')
            ->get();

        $this->assertEquals(1, $verifications->count());
        
        // Should have the new code
        $this->assertEquals($secondCode, $verifications->first()->code);
        $this->assertNotEquals($firstCode, $secondCode);
    }

    /** @test */
    public function email_verification_model_helper_methods_work()
    {
        $verification = EmailVerification::create([
            'user_id' => $this->user->id,
            'purpose' => 'verification',
            'code' => '123456',
            'expires_at' => Carbon::now()->addMinutes(10),
            'attempts' => 0
        ]);

        // Test helper methods
        $this->assertFalse($verification->hasExpired());
        $this->assertFalse($verification->isVerified());
        $this->assertFalse($verification->hasMaxAttemptsReached());

        // Test expired
        $verification->update(['expires_at' => Carbon::now()->subMinutes(1)]);
        $verification->refresh();
        $this->assertTrue($verification->hasExpired());

        // Test verified
        $verification->update(['verified_at' => Carbon::now()]);
        $verification->refresh();
        $this->assertTrue($verification->isVerified());

        // Test max attempts
        $verification->update(['attempts' => 3]);
        $verification->refresh();
        $this->assertTrue($verification->hasMaxAttemptsReached());
    }

    /** @test */
    public function it_handles_multiple_users_independently()
    {
        $user2 = User::factory()->create(['email' => 'user2@example.com']);

        $code1 = $this->emailService->sendVerificationCode($this->user);
        $code2 = $this->emailService->sendVerificationCode($user2);

        // Codes should be different
        $this->assertNotEquals($code1, $code2);

        // Each user should only be able to verify their own code
        $this->assertTrue($this->emailService->verifyCode($this->user, $code1));
        $this->assertFalse($this->emailService->verifyCode($user2, $code1));

        $this->assertTrue($this->emailService->verifyCode($user2, $code2));
        $this->assertFalse($this->emailService->verifyCode($this->user, $code2));
    }

    /** @test */
    public function it_handles_multiple_purposes_per_user()
    {
        $verificationCode = $this->emailService->sendVerificationCode($this->user, 'verification');
        $passwordResetCode = $this->emailService->sendVerificationCode($this->user, 'password_reset');

        // Codes should be different
        $this->assertNotEquals($verificationCode, $passwordResetCode);

        // Each purpose should work independently
        $this->assertTrue($this->emailService->verifyCode($this->user, $verificationCode, 'verification'));
        $this->assertFalse($this->emailService->verifyCode($this->user, $verificationCode, 'password_reset'));

        $this->assertTrue($this->emailService->verifyCode($this->user, $passwordResetCode, 'password_reset'));
        $this->assertFalse($this->emailService->verifyCode($this->user, $passwordResetCode, 'verification'));
    }
}
