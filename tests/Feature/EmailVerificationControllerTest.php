<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\EmailVerification;
use App\Services\EmailVerificationService;
use App\Mail\EmailVerificationMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;
use Carbon\Carbon;

class EmailVerificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    public function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'name' => 'Test User'
        ]);

        Mail::fake();
    }

    public function test_can_view_email_verification_page()
    {
        $response = $this->actingAs($this->user)
            ->get('/email-verification');

        $response->assertStatus(200);
    }

    public function test_can_send_verification_code()
    {
        $response = $this->actingAs($this->user)
            ->post('/email-verification/send', [
                'purpose' => 'verification'
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('status', 'verification-code-sent');

        Mail::assertSent(EmailVerificationMail::class, function ($mail) {
            return $mail->hasTo($this->user->email);
        });

        $this->assertDatabaseHas('email_verifications', [
            'user_id' => $this->user->id,
            'purpose' => 'verification'
        ]);
    }

    public function test_can_verify_correct_code()
    {
        // First send a code
        $emailService = app(EmailVerificationService::class);
        $code = $emailService->sendVerificationCode($this->user);

        $response = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => $code,
                'purpose' => 'verification'
            ]);

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('status', 'email-verified');

        // Check that verification was marked as completed
        $verification = EmailVerification::where('user_id', $this->user->id)
            ->where('purpose', 'verification')
            ->first();

        $this->assertNotNull($verification->verified_at);
    }

    public function test_cannot_verify_incorrect_code()
    {
        // First send a code
        $emailService = app(EmailVerificationService::class);
        $emailService->sendVerificationCode($this->user);

        $response = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => '000000',
                'purpose' => 'verification'
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['code']);
    }

    public function test_rate_limiting_prevents_spam()
    {
        // Send first code
        $response1 = $this->actingAs($this->user)
            ->post('/email-verification/send', [
                'purpose' => 'verification'
            ]);

        $response1->assertRedirect();
        $response1->assertSessionHas('status', 'verification-code-sent');

        // Try to send immediately again
        $response2 = $this->actingAs($this->user)
            ->post('/email-verification/send', [
                'purpose' => 'verification'
            ]);

        $response2->assertRedirect();
        $response2->assertSessionHasErrors(['code']);
    }

    public function test_can_get_verification_status()
    {
        $response = $this->actingAs($this->user)
            ->get('/email-verification/status');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status' => [
                'has_pending',
                'is_verified',
                'expires_at',
                'attempts',
                'can_request_new'
            ],
            'email'
        ]);
    }

    public function test_can_resend_verification_code()
    {
        // First send a code and wait
        $this->actingAs($this->user)
            ->post('/email-verification/send', [
                'purpose' => 'verification'
            ]);

        // Travel forward in time to allow resend
        $this->travel(2)->minutes();

        $response = $this->actingAs($this->user)
            ->post('/email-verification/resend', [
                'purpose' => 'verification'
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('status', 'verification-code-resent');
    }

    public function test_action_verification_codes_work()
    {
        $response = $this->actingAs($this->user)
            ->post('/email-verification/action/send', [
                'action' => 'password_reset'
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('email_verifications', [
            'user_id' => $this->user->id,
            'purpose' => 'password_reset'
        ]);
    }

    public function test_action_verification_with_correct_code()
    {
        $emailService = app(EmailVerificationService::class);
        $code = $emailService->sendActionVerificationCode($this->user, 'password_reset');

        $response = $this->actingAs($this->user)
            ->post('/email-verification/action/verify', [
                'code' => $code,
                'action' => 'password_reset'
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    public function test_action_verification_with_wrong_code()
    {
        $emailService = app(EmailVerificationService::class);
        $emailService->sendActionVerificationCode($this->user, 'password_reset');

        $response = $this->actingAs($this->user)
            ->post('/email-verification/action/verify', [
                'code' => '000000',
                'action' => 'password_reset'
            ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    public function test_validation_requires_proper_code_format()
    {
        // Test empty code
        $response = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => '',
                'purpose' => 'verification'
            ]);

        $response->assertSessionHasErrors(['code']);

        // Test wrong length code
        $response = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => '123',
                'purpose' => 'verification'
            ]);

        $response->assertSessionHasErrors(['code']);

        // Test non-numeric code
        $response = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => 'abcdef',
                'purpose' => 'verification'
            ]);

        $response->assertSessionHasErrors(['code']);
    }

    public function test_expired_codes_are_rejected()
    {
        $emailService = app(EmailVerificationService::class);
        $code = $emailService->sendVerificationCode($this->user);

        // Make the code expired
        EmailVerification::where('user_id', $this->user->id)
            ->update(['expires_at' => Carbon::now()->subMinutes(15)]);

        $response = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => $code,
                'purpose' => 'verification'
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['code']);
    }

    public function test_max_attempts_reached()
    {
        $emailService = app(EmailVerificationService::class);
        $code = $emailService->sendVerificationCode($this->user);

        // Set attempts to maximum
        EmailVerification::where('user_id', $this->user->id)
            ->update(['attempts' => 3]);

        $response = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => $code,
                'purpose' => 'verification'
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['code']);
    }

    public function test_guest_cannot_access_verification_routes()
    {
        $response = $this->get('/email-verification');
        $response->assertRedirect('/login');

        $response = $this->post('/email-verification/send');
        $response->assertRedirect('/login');

        $response = $this->post('/email-verification/verify');
        $response->assertRedirect('/login');
    }

    public function test_different_purposes_work_independently()
    {
        $emailService = app(EmailVerificationService::class);

        // Send codes for different purposes
        $verificationCode = $emailService->sendVerificationCode($this->user, 'verification');
        $passwordResetCode = $emailService->sendVerificationCode($this->user, 'password_reset');

        // Verify each code with its correct purpose
        $response1 = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => $verificationCode,
                'purpose' => 'verification'
            ]);

        $response1->assertRedirect(route('dashboard'));

        $response2 = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => $passwordResetCode,
                'purpose' => 'password_reset'
            ]);

        $response2->assertRedirect(route('dashboard'));

        // Verify codes don't work with wrong purpose
        $newVerificationCode = $emailService->sendVerificationCode($this->user, 'verification');
        
        $response3 = $this->actingAs($this->user)
            ->post('/email-verification/verify', [
                'code' => $newVerificationCode,
                'purpose' => 'password_reset'
            ]);

        $response3->assertSessionHasErrors(['code']);
    }
}
