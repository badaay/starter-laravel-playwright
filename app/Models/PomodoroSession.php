<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PomodoroSession Model
 *
 * @category Models
 * @package  App\Models
 * @author   AI Laravel Team
 * @license  MIT License
 * @link     http://localhost/pomodoro
 */
class PomodoroSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'todo_id',
        'type',
        'duration',
        'completed',
        'started_at',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'completed' => 'boolean',
    ];

    /**
     * Get the user that owns the Pomodoro session.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the todo that the session is associated with.
     *
     * @return BelongsTo
     */
    public function todo(): BelongsTo
    {
        return $this->belongsTo(Todo::class);
    }
}
