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
    // Debug route - remove in production
    Route::get('/debug/user', function () {
        $user = Auth::user();
        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'fresh_email_verified_at' => \App\Models\User::find($user->id)->email_verified_at
        ]);
    })->name('debug.user');

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
        Route::post('/recovery/regenerate', [MfaController::class, 'regenerateRecoveryCodes'])
            ->name('recovery.regenerate');

        // Email MFA routes
        Route::get('/email/setup', [MfaController::class, 'setupEmailMfa'])->name('email.setup');
        Route::post('/email/send', [MfaController::class, 'sendEmailCode'])->name('email.send');
        Route::post('/email/enable', [MfaController::class, 'enableEmailMfa'])->name('email.enable');
        Route::post('/email/disable', [MfaController::class, 'disableEmailMfa'])->name('email.disable');
        Route::get('/email', [MfaController::class, 'showEmailMfaForm'])->name('email');
        Route::post('/email/request', [MfaController::class, 'requestEmailCode'])->name('email.request');

        // TOTP MFA routes
        Route::post('/totp/disable', [MfaController::class, 'disableTotpMfa'])->name('totp.disable');
    });

    // Email Verification Routes (standalone)
    Route::prefix('email-verification')->name('email-verification.')->middleware('auth')->group(function () {
        Route::get('/', [App\Http\Controllers\EmailVerificationController::class, 'show'])->name('show');
        Route::post('/send', [App\Http\Controllers\EmailVerificationController::class, 'sendCode'])->name('send');
        Route::post('/verify', [App\Http\Controllers\EmailVerificationController::class, 'verify'])->name('verify');
        Route::post('/resend', [App\Http\Controllers\EmailVerificationController::class, 'resend'])->name('resend');
        Route::get('/status', [App\Http\Controllers\EmailVerificationController::class, 'status'])->name('status');

        // Action-specific verification routes
        Route::post('/action/send', [App\Http\Controllers\EmailVerificationController::class, 'sendActionCode'])->name('action.send');
        Route::post('/action/verify', [App\Http\Controllers\EmailVerificationController::class, 'verifyActionCode'])->name('action.verify');
    });

    // Email Testing Routes (for development/testing)
    Route::prefix('email-test')->name('email-test.')->middleware('auth')->group(function () {
        Route::get('/', [App\Http\Controllers\EmailTestController::class, 'index'])->name('index');
        Route::post('/send', [App\Http\Controllers\EmailTestController::class, 'sendTestCode'])->name('send');
        Route::post('/verify', [App\Http\Controllers\EmailTestController::class, 'testVerification'])->name('verify');
        Route::get('/status', [App\Http\Controllers\EmailTestController::class, 'getStatus'])->name('status');
        Route::post('/demo', [App\Http\Controllers\EmailTestController::class, 'demonstrateEmails'])->name('demo');
    });
});

require __DIR__ . '/auth.php';
