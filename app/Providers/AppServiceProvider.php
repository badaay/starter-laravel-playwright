<?php

namespace App\Providers;

use App\Services\MfaService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use PragmaRX\Google2FA\Google2FA;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Google2FA::class, function () {
            return new Google2FA();
        });

        $this->app->singleton(MfaService::class, function ($app) {
            return new MfaService($app->make(Google2FA::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
