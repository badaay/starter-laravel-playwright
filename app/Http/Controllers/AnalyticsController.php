<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Controller for handling analytics-related requests
 *
 * @category Controllers
 * @package  App\Http\Controllers
 * @author   AI Laravel Team
 * @license  MIT License
 * @link     http://localhost/analytics
 */
class AnalyticsController extends Controller
{
    /**
     * Analytics service instance
     *
     * @var AnalyticsService
     */
    protected $analyticsService;

    /**
     * Create a new controller instance
     *
     * @param AnalyticsService $analyticsService Analytics service
     */
    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Show the analytics dashboard
     *
     * @return \Inertia\Response
     */
    public function index(): \Inertia\Response
    {
        $user = Auth::user();
        $userId = $user->id;

        $productivityScore = $this->analyticsService->getProductivityScore($userId);
        $weeklyOverview = $this->analyticsService->getWeeklyOverview($userId);
        $focusDistribution = $this->analyticsService->getFocusDistribution($userId);

        return Inertia::render('Analytics/Dashboard', [
            'productivityScore' => $productivityScore,
            'weeklyOverview' => $weeklyOverview,
            'focusDistribution' => $focusDistribution,
        ]);
    }

    /**
     * Get productivity score data
     */
    public function getProductivityScore(Request $request): JsonResponse
    {
        $user = Auth::user();
        $days = $request->input('days', 7);

        $data = $this->analyticsService->getProductivityScore($user->id, $days);

        return response()->json($data);
    }

    /**
     * Get weekly overview data
     */
    public function getWeeklyOverview(): JsonResponse
    {
        $user = Auth::user();

        $data = $this->analyticsService->getWeeklyOverview($user->id);

        return response()->json($data);
    }

    /**
     * Get focus distribution data
     */
    public function getFocusDistribution(Request $request): JsonResponse
    {
        $user = Auth::user();
        $days = $request->input('days', 30);

        $data = $this->analyticsService->getFocusDistribution($user->id, $days);

        return response()->json($data);
    }
}
