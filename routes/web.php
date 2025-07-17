<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MfaController;
use App\Http\Controllers\PomodoroSessionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', \App\Http\Middleware\EnsureMfaAuthenticated::class])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Pomodoro Timer Route
    Route::get('/pomodoro', function () {
        return Inertia::render('Pomodoro');
    })->name('pomodoro');

    // Todo Routes
    Route::resource('todos', \App\Http\Controllers\TodoController::class);

    // Analytics Routes
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');
    Route::prefix('api/analytics')->name('api.analytics.')->group(function () {
        Route::get('/productivity-score', [AnalyticsController::class, 'getProductivityScore'])
            ->name('productivity-score');
        Route::get('/weekly-overview', [AnalyticsController::class, 'getWeeklyOverview'])->name('weekly-overview');
        Route::get('/focus-distribution', [AnalyticsController::class, 'getFocusDistribution'])
            ->name('focus-distribution');
    });

    // Pomodoro API Routes
    Route::prefix('api/pomodoro')->name('api.pomodoro.')->group(function () {
        Route::post('/sessions', [PomodoroSessionController::class, 'store'])->name('sessions.store');
        Route::get('/sessions/today', [PomodoroSessionController::class, 'getTodaySessions'])->name('sessions.today');
        Route::get('/stats', [PomodoroSessionController::class, 'getStats'])->name('stats');
    });

    // MFA Routes
    Route::prefix('mfa')->name('mfa.')->middleware('auth')->group(function () {
        Route::get('/setup', [MfaController::class, 'setup'])->name('setup');
        Route::post('/enable', [MfaController::class, 'enable'])->name('enable');
        Route::post('/disable', [MfaController::class, 'disable'])->name('disable');
        Route::get('/challenge', [MfaController::class, 'challenge'])->name('challenge');
        Route::post('/verify', [MfaController::class, 'verify'])->name('verify');
        Route::get('/recovery', [MfaController::class, 'showRecoveryForm'])->name('recovery');
        Route::get('/email', [MfaController::class, 'showEmailForm'])->name('email');
        Route::post('/recovery/regenerate', [MfaController::class, 'regenerateRecoveryCodes'])
            ->name('recovery.regenerate');
    });

    // Add route for CORS Test page
    Route::get('/cors-test', function () {
        return Inertia::render('CorsTest');
    })->middleware(['auth', 'verified'])->name('cors.test');
});

// Add CORS collector route directly in web.php - no middleware for testing
Route::match(['GET', 'POST'], '/collector', function (Illuminate\Http\Request $request) {
    return response()->json([
        'message' => 'Random message: ' . \Illuminate\Support\Str::random(10),
        'received' => $request->all(),
        'method' => $request->method(),
        'source' => 'web.php'
    ]);
})->middleware('api')->name('collector');

require __DIR__ . '/auth.php';
