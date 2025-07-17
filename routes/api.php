<?php

use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\CollectorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Simple test route at the API root
Route::get('/', function () {
    return response()->json([
        'message' => 'API is working',
        'time' => now(),
    ]);
});

// Todo API Routes
Route::middleware('auth:sanctum')->apiResource('todos', TodoController::class);

// MFA API Routes
Route::middleware('auth:sanctum')->prefix('mfa')->name('api.mfa.')->group(function () {
    Route::get('/status', [App\Http\Controllers\Api\MfaController::class, 'status'])->name('status');
    Route::get('/setup', [App\Http\Controllers\Api\MfaController::class, 'setup'])->name('setup');
    Route::post('/enable', [App\Http\Controllers\Api\MfaController::class, 'enable'])->name('enable');
    Route::post('/disable', [App\Http\Controllers\Api\MfaController::class, 'disable'])->name('disable');
    Route::post('/verify', [App\Http\Controllers\Api\MfaController::class, 'verify'])->name('verify');
    Route::post('/email-code', [App\Http\Controllers\Api\MfaController::class, 'requestEmailCode'])->name('email-code');
    Route::post('/recovery-codes', [App\Http\Controllers\Api\MfaController::class, 'regenerateRecoveryCodes'])->name('recovery-codes');
});

// Collector API Route - supports both GET and POST
Route::match(['GET', 'POST'], '/collector', function (Illuminate\Http\Request $request) {
    return response()->json([
        'message' => 'Random message from API: ' . Str::random(10),
        'received' => $request->all(),
        'method' => $request->method(),
        'source' => 'api.php',
        'timestamp' => now()
    ]);
});
