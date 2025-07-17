<?php

namespace Database\Factories;

use App\Models\PomodoroSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for creating Pomodoro session test data
 */
class PomodoroSessionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model
     *
     * @var string
     */
    protected $model = PomodoroSession::class;

    /**
     * Define the model's default state
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(['focus', 'shortBreak', 'longBreak']),
            'duration' => $this->faker->randomElement([15, 25, 30, 45]) * 60, // Convert to seconds
            'completed' => $this->faker->boolean(),
            'started_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'completed_at' => function (array $attributes) {
                return $attributes['completed'] ?
                    $this->faker->dateTimeBetween($attributes['started_at']) :
                    null;
            },
            'created_at' => function (array $attributes) {
                return $attributes['started_at'];
            },
            'updated_at' => function (array $attributes) {
                return $attributes['completed'] ?
                    $attributes['completed_at'] :
                    $attributes['started_at'];
            },
        ];
    }
}
