<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * CORS test controller
 */
class CorsController extends Controller
{
    /**
     * Handle incoming test requests
     *
     * @param Request $request The incoming request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handle(Request $request)
    {
        return response()->json([
            'message' => 'CORS Test Successful! ' . Str::random(8),
            'received' => $request->all(),
            'method' => $request->method(),
            'timestamp' => now()->toIso8601String(),
            'headers' => collect($request->headers->all())
                ->map(function ($item) {
                    return $item[0] ?? null;
                })
                ->toArray()
        ]);
    }
}
