<?php

namespace App\Services;

use App\Models\Todo;
use App\Models\PomodoroSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

/**
 * Analytics Service for processing productivity data.
 *
 * @category Services
 * @package  App\Services
 * @author   AI Laravel Team
 * @license  MIT License
 * @link     http://localhost/analytics
 */
class AnalyticsService
{
    /**
     * Get the productivity score for a user
     *
     * @param int $userId User identifier
     * @param int $days   Number of days to analyze
     *
     * @return array{
     *  score: int,
     *  trend: float,
     *  taskCompletionRate: float,
     *  focusSessionsCount: int,
     *  totalTasks: int,
     *  completedTasks: int
     * }
     */
    public function getProductivityScore(int $userId, int $days = 7): array
    {
        $cacheKey = "productivity_score_{$userId}_{$days}";

        return Cache::remember($cacheKey, 60 * 60, function () use ($userId, $days) {
            // Get completed vs total tasks
            $startDate = Carbon::now()->subDays($days);

            $totalTasks = Todo::where('user_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->count();

            $completedTasks = Todo::where('user_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->where('completed', true)
                ->count();

            // Get Pomodoro focus time
            $focusSessions = PomodoroSession::where('user_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->where('type', 'focus')
                ->count();

            // Calculate productivity score (0-100)
            $taskScore = $totalTasks > 0 ? ($completedTasks / $totalTasks) * 50 : 0;
            $focusScore = min($focusSessions * 2, 50); // Cap at 50 points, 25 sessions = full score

            $currentScore = round($taskScore + $focusScore);

            // Get previous period for trend
            $previousStartDate = Carbon::now()->subDays($days * 2);
            $previousEndDate = Carbon::now()->subDays($days);

            $previousTotalTasks = Todo::where('user_id', $userId)
                ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
                ->count();

            $previousCompletedTasks = Todo::where('user_id', $userId)
                ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
                ->where('completed', true)
                ->count();

            $previousFocusSessions = PomodoroSession::where('user_id', $userId)
                ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
                ->where('type', 'focus')
                ->count();

            $previousTaskScore = $previousTotalTasks > 0 ? ($previousCompletedTasks / $previousTotalTasks) * 50 : 0;
            $previousFocusScore = min($previousFocusSessions * 2, 50);

            $previousScore = round($previousTaskScore + $previousFocusScore);

            $trend = $previousScore > 0 ? (($currentScore - $previousScore) / $previousScore) * 100 : 0;

            return [
                'score' => $currentScore,
                'trend' => round($trend, 1),
                'taskCompletionRate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0,
                'focusSessionsCount' => $focusSessions,
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks
            ];
        });
    }

    /**
     * Get weekly overview data for tasks and Pomodoro sessions
     *
     * @param int $userId
     * @return array
     */
    public function getWeeklyOverview(int $userId): array
    {
        $cacheKey = "weekly_overview_{$userId}";

        return Cache::remember($cacheKey, 60 * 60, function () use ($userId) {
            $startDate = Carbon::now()->startOfWeek();
            $endDate = Carbon::now()->endOfWeek();

            $weeklyData = [];

            // Initialize data structure for the week
            for ($i = 0; $i <= 6; $i++) {
                $date = $startDate->copy()->addDays($i);
                $weeklyData[$date->format('Y-m-d')] = [
                    'dayName' => $date->format('D'),
                    'completedTasks' => 0,
                    'pomodoroSessions' => 0,
                    'pomodoroMinutes' => 0
                ];
            }

            // Get completed tasks by day
            $completedTasks = Todo::where('user_id', $userId)
                ->whereBetween('updated_at', [$startDate, $endDate])
                ->where('completed', true)
                ->get();

            foreach ($completedTasks as $task) {
                $dateKey = $task->updated_at->format('Y-m-d');
                if (isset($weeklyData[$dateKey])) {
                    $weeklyData[$dateKey]['completedTasks']++;
                }
            }

            // Get Pomodoro sessions by day
            $pomodoroSessions = PomodoroSession::where('user_id', $userId)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            foreach ($pomodoroSessions as $session) {
                $dateKey = $session->created_at->format('Y-m-d');
                if (isset($weeklyData[$dateKey])) {
                    $weeklyData[$dateKey]['pomodoroSessions']++;
                    $weeklyData[$dateKey]['pomodoroMinutes'] += $session->duration / 60; // Convert seconds to minutes
                }
            }

            return array_values($weeklyData);
        });
    }

    /**
     * Get focus distribution data
     *
     * @param int $userId
     * @param int $days
     * @return array
     */
    public function getFocusDistribution(int $userId, int $days = 30): array
    {
        $cacheKey = "focus_distribution_{$userId}_{$days}";

        return Cache::remember($cacheKey, 60 * 60, function () use ($userId, $days) {
            $startDate = Carbon::now()->subDays($days);

            // Get todos with tags/categories
            $todos = Todo::where('user_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->get();

            // Group by category/tag
            $categoryDistribution = [];
            $totalTime = 0;

            foreach ($todos as $todo) {
                $category = $todo->category ?? 'Uncategorized';

                if (!isset($categoryDistribution[$category])) {
                    $categoryDistribution[$category] = [
                        'name' => $category,
                        'taskCount' => 0,
                        'completedCount' => 0,
                        'focusTime' => 0, // in minutes
                    ];
                }

                $categoryDistribution[$category]['taskCount']++;

                if ($todo->completed) {
                    $categoryDistribution[$category]['completedCount']++;
                }

                // Get associated Pomodoro sessions
                $sessions = PomodoroSession::where('user_id', $userId)
                    ->where('todo_id', $todo->id)
                    ->where('type', 'focus')
                    ->get();

                foreach ($sessions as $session) {
                    $minutesSpent = $session->duration / 60;
                    $categoryDistribution[$category]['focusTime'] += $minutesSpent;
                    $totalTime += $minutesSpent;
                }
            }

            // Calculate percentages
            $result = [];
            foreach ($categoryDistribution as $category => $data) {
                $data['percentage'] = $totalTime > 0 ? round(($data['focusTime'] / $totalTime) * 100, 1) : 0;
                $result[] = $data;
            }

            return $result;
        });
    }
}
