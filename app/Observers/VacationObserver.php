<?php

namespace App\Observers;

use App\Jobs\CalculateSalary;
use App\Vacation;
use Illuminate\Support\Facades\Cache;

class VacationObserver
{
    /**
     * Handle the vacation "created" event.
     *
     * @param  \App\Vacation  $vacation
     * @return void
     */
    public function created(Vacation $vacation)
    {
//        CalculateSalary::dispatch($vacation);
    }

    /**
     * Handle the vacation "updated" event.
     *
     * @param  \App\Vacation  $vacation
     * @return void
     */
    public function updated(Vacation $vacation)
    {

//        CalculateSalary::dispatch($vacation);
    }

    /**
     * Handle the vacation "deleted" event.
     *
     * @param  \App\Vacation  $vacation
     * @return void
     */
    public function deleted(Vacation $vacation)
    {
//        CalculateSalary::dispatch($vacation);
    }

    /**
     * Handle the vacation "restored" event.
     *
     * @param  \App\Vacation  $vacation
     * @return void
     */
    public function restored(Vacation $vacation)
    {
        //
    }

    /**
     * Handle the vacation "force deleted" event.
     *
     * @param  \App\Vacation  $vacation
     * @return void
     */
    public function forceDeleted(Vacation $vacation)
    {
        //
    }
}
