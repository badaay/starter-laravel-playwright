<?php

namespace Tests\Feature;

use App\Models\PomodoroSession;
use App\Models\Todo;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function testUnauthenticatedUsersCannotAccessAnalytics(): void
    {
        $response = $this->get('/analytics');
        $response->assertRedirect('/login');
    }

    public function testAuthenticatedUsersCanAccessAnalyticsDashboard(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/analytics');

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Analytics/Dashboard')
                ->has('productivityScore')
                ->has('weeklyOverview')
                ->has('focusDistribution'));
    }

    public function testAnalyticsShowsProductivityScore(): void
    {
        // Create a mix of completed and incomplete todos
        Todo::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        Todo::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'completed' => false,
        ]);

        PomodoroSession::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'focus',
            'duration' => 1500, // 25 minutes in seconds
            'completed' => true,
            'started_at' => now()->subHours(2),
            'completed_at' => now()->subHours(1),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/api/analytics/productivity-score');

        $response->assertStatus(200)
            ->assertJson(fn (AssertableJson $json) => $json
                ->has('trend')
                ->has('taskCompletionRate')
                ->has('focusSessionsCount'));
    }

    public function testAnalyticsShowsPomodoroSessionData(): void
    {
        $today = Carbon::now();

        PomodoroSession::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'focus',
            'duration' => 1500,
            'completed' => true,
            'started_at' => $today,
            'completed_at' => $today->copy()->addMinutes(25),
        ]);

        PomodoroSession::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'focus',
            'duration' => 1500,
            'completed' => true,
            'started_at' => $today->copy()->subDay(),
            'completed_at' => $today->copy()->subDay()->addMinutes(25),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/api/analytics/focus-distribution');

        $response->assertStatus(200)
            ->assertJson(fn (AssertableJson $json) => $json
                ->has('focusDistribution')
                ->has('totalMinutes')
                ->has('sessionsCompleted'));
    }

    public function testAnalyticsShowsWeeklyOverview(): void
    {
        $today = Carbon::now();

        Todo::factory()->create([
            'user_id' => $this->user->id,
            'completed' => true,
            'completed_at' => $today,
        ]);

        Todo::factory()->create([
            'user_id' => $this->user->id,
            'completed' => true,
            'completed_at' => $today->copy()->subDays(2),
        ]);

        PomodoroSession::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'focus',
            'duration' => 1500,
            'completed' => true,
            'started_at' => $today,
            'completed_at' => $today->copy()->addMinutes(25),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/api/analytics/weekly-overview');

        $response->assertStatus(200)
            ->assertJson(fn (AssertableJson $json) => $json
                ->has('data')
                ->has('completedTasks')
                ->has('focusMinutes')
                ->has('productivityTrend'));
    }

    public function testAnalyticsDataIsUserSpecific(): void
    {
        // Create data for our test user
        Todo::factory()->create([
            'user_id' => $this->user->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        PomodoroSession::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'focus',
            'duration' => 1500,
            'completed' => true,
            'started_at' => now()->subMinutes(25),
            'completed_at' => now(),
        ]);

        // Create another user with different data
        $otherUser = User::factory()->create();
        Todo::factory()->count(3)->create([
            'user_id' => $otherUser->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        PomodoroSession::factory()->create([
            'user_id' => $otherUser->id,
            'type' => 'focus',
            'duration' => 1500,
            'completed' => true,
            'started_at' => now()->subMinutes(25),
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/api/analytics/weekly-overview');

        $response->assertStatus(200)
            ->assertJson(fn (AssertableJson $json) => $json
                ->has('data')
                ->has('completedTasks')
                ->where('completedTasks', 1) // Should only see their own completed tasks
                ->has('focusMinutes'));
    }
}
