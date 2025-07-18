<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The verification code.
     *
     * @var string
     */
    public $code;

    /**
     * The purpose of verification.
     *
     * @var string
     */
    public $purpose;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code, string $purpose = 'verification')
    {
        $this->code = $code;
        $this->purpose = $purpose;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjects = [
            'verification' => 'Email Verification Code',
            'password_reset' => 'Password Reset Verification Code',
            'email_change' => 'Email Change Verification Code',
            'account_deletion' => 'Account Deletion Verification Code',
            'sensitive_action' => 'Security Verification Code',
        ];

        $subject = $subjects[$this->purpose] ?? 'Verification Code';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.auth.email-verification',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
