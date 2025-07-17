<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Test routes for CORS
Route::get('/api/cors-test', function (Request $request) {
    return response()->json([
        'message' => 'CORS test endpoint - GET',
        'timestamp' => now()->toIso8601String(),
    ]);
})->middleware('cors');

Route::post('/api/cors-test', function (Request $request) {
    return response()->json([
        'message' => 'CORS test endpoint - POST',
        'received' => $request->all(),
        'timestamp' => now()->toIso8601String(),
    ]);
})->middleware('cors');

Route::options('/api/cors-test', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});
