<?php

namespace App\Observers;

use App\Deal;
use App\Events\DealPerformed;
use Illuminate\Support\Facades\Cache;
use App\Jobs\CalculateSalary;


class DealObserver
{
    /**
     * Handle the deal "created" event.
     *
     * @param  \App\Deal  $deal
     * @return void
     */
    public function created(Deal $deal)
    {
//        CalculateSalary::dispatch($deal);
    }

    /**
     * Handle the deal "updated" event.
     *
     * @param  \App\Deal  $deal
     * @return void
     */
    public function updated(Deal $deal)
    {
//        CalculateSalary::dispatch($deal);
    }

    /**
     * Handle the deal "deleted" event.
     *
     * @param  \App\Deal  $deal
     * @return void
     */
    public function deleted(Deal $deal)
    {
//        CalculateSalary::dispatch($deal);
    }

    /**
     * Handle the deal "restored" event.
     *
     * @param  \App\Deal  $deal
     * @return void
     */
    public function restored(Deal $deal)
    {
        //
    }

    /**
     * Handle the deal "force deleted" event.
     *
     * @param  \App\Deal  $deal
     * @return void
     */
    public function forceDeleted(Deal $deal)
    {
        //
    }
}
