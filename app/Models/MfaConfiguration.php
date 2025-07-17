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
        'secret',
        'recovery_codes',
        'verified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'enabled' => 'boolean',
        'verified_at' => 'datetime',
        'recovery_codes' => 'array',
    ];

    /**
     * Get the user that owns the MFA configuration.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
