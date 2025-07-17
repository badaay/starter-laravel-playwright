<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * A controller for CORS testing
 */
class TestController extends Controller
{
    /**
     * A simple endpoint that returns the request data
     */
    public function echo(Request $request)
    {
        return response()->json([
            'message' => 'Random message: ' . Str::random(10),
            'received' => $request->all(),
            'method' => $request->method(),
            'timestamp' => now()->toIso8601String(),
            'headers' => $request->headers->all()
        ]);
    }
}
