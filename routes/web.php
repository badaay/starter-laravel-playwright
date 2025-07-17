<?php

use App\Http\Controllers\MfaController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
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
    $user = Auth::user();
    $todos = $user->todos()->latest()->take(5)->get();
    $todosCount = $user->todos()->count();
    $completedTodosCount = $user->todos()->where('completed', true)->count();
    $pendingTodosCount = $user->todos()->where('completed', false)->count();
    $mfaEnabled = $user->hasMfaEnabled();

    return Inertia::render('Dashboard', [
        'todos' => $todos,
        'todosCount' => $todosCount,
        'completedTodosCount' => $completedTodosCount,
        'pendingTodosCount' => $pendingTodosCount,
        'mfaEnabled' => $mfaEnabled,
    ]);
})->middleware(['auth', 'verified', \App\Http\Middleware\EnsureMfaAuthenticated::class])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Todo Routes
    Route::resource('todos', \App\Http\Controllers\TodoController::class);

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
});

require __DIR__ . '/auth.php';
