<?php

namespace App\Providers;
use App\Contracts\AIClientInterface;
use App\Services\AI\GeminiClient;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AIClientInterface::class, GeminiClient::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
