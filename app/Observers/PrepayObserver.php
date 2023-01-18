<?php

namespace App\Observers;

use App\Jobs\CalculateSalary;
use App\Prepay;
use Illuminate\Support\Facades\Cache;

class PrepayObserver
{
    /**
     * Handle the prepay "created" event.
     *
     * @param  \App\Prepay  $prepay
     * @return void
     */
    public function created(Prepay $prepay)
    {
//        CalculateSalary::dispatch($prepay);
    }

    /**
     * Handle the prepay "updated" event.
     *
     * @param  \App\Prepay  $prepay
     * @return void
     */
    public function updated(Prepay $prepay)
    {
//        CalculateSalary::dispatch($prepay);
    }

    /**
     * Handle the prepay "deleted" event.
     *
     * @param  \App\Prepay  $prepay
     * @return void
     */
    public function deleted(Prepay $prepay)
    {
//        CalculateSalary::dispatch($prepay);
    }

    /**
     * Handle the prepay "restored" event.
     *
     * @param  \App\Prepay  $prepay
     * @return void
     */
    public function restored(Prepay $prepay)
    {
        //
    }

    /**
     * Handle the prepay "force deleted" event.
     *
     * @param  \App\Prepay  $prepay
     * @return void
     */
    public function forceDeleted(Prepay $prepay)
    {
        //
    }
}
