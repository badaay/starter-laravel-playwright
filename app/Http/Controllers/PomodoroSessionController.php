<?php

namespace App\Http\Controllers;

use App\Models\PomodoroSession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PomodoroSessionController extends Controller
{
    /**
     * Store a new Pomodoro session
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:focus,shortBreak,longBreak',
            'duration' => 'required|integer|min:1',
            'completed' => 'required|boolean',
            'todoId' => 'nullable|exists:todos,id',
            'startedAt' => 'required|date',
            'completedAt' => 'nullable|date',
        ]);

        $session = new PomodoroSession();
        $session->user_id = Auth::id();
        $session->todo_id = $request->input('todoId');
        $session->type = $request->input('type');
        $session->duration = $request->input('duration');
        $session->completed = $request->input('completed');
        $session->started_at = $request->input('startedAt');
        $session->completed_at = $request->input('completedAt');
        $session->save();

        return response()->json($session, 201);
    }

    /**
     * Get today's Pomodoro sessions
     */
    public function getTodaySessions(): JsonResponse
    {
        $today = Carbon::today();
        $sessions = PomodoroSession::where('user_id', Auth::id())
            ->whereDate('created_at', $today)
            ->get();

        return response()->json($sessions);
    }

    /**
     * Get Pomodoro session stats
     */
    public function getStats(Request $request): JsonResponse
    {
        $days = $request->input('days', 7);
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        $sessions = PomodoroSession::where('user_id', Auth::id())
            ->where('created_at', '>=', $startDate)
            ->get();

        $totalFocusTime = $sessions->where('type', 'focus')->sum('duration');
        $totalFocusSessions = $sessions->where('type', 'focus')->count();
        $totalBreakTime = $sessions->whereIn('type', ['shortBreak', 'longBreak'])->sum('duration');

        // Group by day
        $sessionsByDay = $sessions->groupBy(function ($session) {
            return Carbon::parse($session->created_at)->format('Y-m-d');
        });

        $dailyStats = [];

        // Initialize all days in range
        for ($i = $days; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $dailyStats[$date] = [
                'date' => $date,
                'focusTime' => 0,
                'focusSessions' => 0,
                'breakTime' => 0,
            ];
        }

        // Fill in actual data
        foreach ($sessionsByDay as $date => $daySessions) {
            $dailyStats[$date] = [
                'date' => $date,
                'focusTime' => $daySessions->where('type', 'focus')->sum('duration'),
                'focusSessions' => $daySessions->where('type', 'focus')->count(),
                'breakTime' => $daySessions->whereIn('type', ['shortBreak', 'longBreak'])->sum('duration'),
            ];
        }

        return response()->json([
            'totalFocusTime' => $totalFocusTime,
            'totalFocusSessions' => $totalFocusSessions,
            'totalBreakTime' => $totalBreakTime,
            'averageFocusSessionTime' => $totalFocusSessions > 0 ? $totalFocusTime / $totalFocusSessions : 0,
            'dailyStats' => array_values($dailyStats),
        ]);
    }
}
