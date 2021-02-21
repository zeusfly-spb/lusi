<?php

namespace App\Observers;

use App\Jobs\CalculateSalary;
use App\Sick;
use Illuminate\Support\Facades\Cache;

class SickObserver
{
    /**
     * Handle the sick "created" event.
     *
     * @param  \App\Sick  $sick
     * @return void
     */
    public function created(Sick $sick)
    {
//        CalculateSalary::dispatch($sick);
    }

    /**
     * Handle the sick "updated" event.
     *
     * @param  \App\Sick  $sick
     * @return void
     */
    public function updated(Sick $sick)
    {
//        CalculateSalary::dispatch($sick);
    }

    /**
     * Handle the sick "deleted" event.
     *
     * @param  \App\Sick  $sick
     * @return void
     */
    public function deleted(Sick $sick)
    {
//        CalculateSalary::dispatch($sick);
    }

    /**
     * Handle the sick "restored" event.
     *
     * @param  \App\Sick  $sick
     * @return void
     */
    public function restored(Sick $sick)
    {
        //
    }

    /**
     * Handle the sick "force deleted" event.
     *
     * @param  \App\Sick  $sick
     * @return void
     */
    public function forceDeleted(Sick $sick)
    {
        //
    }
}
