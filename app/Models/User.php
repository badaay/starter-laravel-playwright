<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the MFA configuration associated with the user.
     */
    public function mfaConfiguration(): HasOne
    {
        return $this->hasOne(MfaConfiguration::class);
    }

    /**
     * Get the todos for the user.
     */
    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    /**
     * Check if the user has MFA enabled.
     */
    public function hasMfaEnabled(): bool
    {
        return $this->mfaConfiguration?->hasAnyMfaEnabled() ?? false;
    }

    /**
     * Check if the user has TOTP MFA enabled.
     */
    public function hasTotpEnabled(): bool
    {
        return $this->mfaConfiguration?->totp_enabled ?? false;
    }

    /**
     * Check if the user has Email MFA enabled.
     */
    public function hasEmailMfaEnabled(): bool
    {
        return $this->mfaConfiguration?->email_enabled ?? false;
    }
}
