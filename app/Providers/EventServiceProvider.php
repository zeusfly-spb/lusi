<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\DealPerformed;
use App\Listeners\DealPerformedListener;
use App\Http\Controllers\CacheController;

class EventServiceProvider extends ServiceProvider
{
    protected $controller;
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        DealPerformed::class => [
            DealPerformedListener::class
        ],
    ];



    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();
//        $this->controller = new CacheController();
//        Event::listen('eloquent.created: *', function($eventName, $object) {
//            $this->controller->add($object[0]);
//        });
//        Event::listen('eloquent.updated: *', function($eventName, $object) {
//            $this->controller->update($object[0]);
//        });
//        Event::listen('eloquent.deleted: *', function($eventName, $object) {
//            $this->controller->delete($object[0]);
//        });
    }
}
