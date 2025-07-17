<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MfaConfiguration extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'enabled',
        'totp_enabled',
        'email_enabled',
        'secret',
        'recovery_codes',
        'email_code',
        'email_code_expires_at',
        'email_code_attempts',
        'verified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'enabled' => 'boolean',
        'totp_enabled' => 'boolean',
        'email_enabled' => 'boolean',
        'verified_at' => 'datetime',
        'email_code_expires_at' => 'datetime',
        'recovery_codes' => 'array',
    ];

    /**
     * Get the user that owns the MFA configuration.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if any MFA method is enabled.
     */
    public function hasAnyMfaEnabled(): bool
    {
        return $this->totp_enabled || $this->email_enabled;
    }

    /**
     * Check if email code is valid and not expired.
     */
    public function isEmailCodeValid(string $code): bool
    {
        return $this->email_code === $code
            && $this->email_code_expires_at
            && $this->email_code_expires_at > now()
            && $this->email_code_attempts < 3; // Max 3 attempts
    }

    /**
     * Increment email code attempts.
     */
    public function incrementEmailCodeAttempts(): void
    {
        $this->increment('email_code_attempts');
    }

    /**
     * Clear email code after successful verification.
     */
    public function clearEmailCode(): void
    {
        $this->update([
            'email_code' => null,
            'email_code_expires_at' => null,
            'email_code_attempts' => 0,
        ]);
    }
}
