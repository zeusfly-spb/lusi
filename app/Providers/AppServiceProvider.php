<?php

namespace App\Providers;

use App\Appointment;
use App\DocumentPack;
use App\Observers\UserObserver;
use App\User;
use Carbon\Carbon;
use Illuminate\Support\ServiceProvider;
use App\Observers\DocPackObserver;
use App\Observers\AppointmentObserver;
use Illuminate\Pagination\Paginator;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        setlocale(LC_TIME, 'ru_RU.UTF-8');
        Carbon::setLocale('ru');
        DocumentPack::observe(DocPackObserver::class);
        User::observe(UserObserver::class);
        Appointment::observe(AppointmentObserver::class);
        Paginator::useBootstrap();
    }
}
