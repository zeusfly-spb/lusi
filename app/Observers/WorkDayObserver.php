<?php

namespace App\Observers;

use App\WorkDay;
use App\Jobs\CalculateSalary;

class WorkDayObserver
{
    /**
     * Handle the work day "created" event.
     *
     * @param  \App\WorkDay  $workDay
     * @return void
     */
    public function created(WorkDay $workDay)
    {
//        CalculateSalary::dispatch($workDay);
    }

    /**
     * Handle the work day "updated" event.
     *
     * @param  \App\WorkDay  $workDay
     * @return void
     */
    public function updated(WorkDay $workDay)
    {
//        CalculateSalary::dispatch($workDay);
    }

    /**
     * Handle the work day "deleted" event.
     *
     * @param  \App\WorkDay  $workDay
     * @return void
     */
    public function deleted(WorkDay $workDay)
    {
//        CalculateSalary::dispatch($workDay);
    }

    /**
     * Handle the work day "restored" event.
     *
     * @param  \App\WorkDay  $workDay
     * @return void
     */
    public function restored(WorkDay $workDay)
    {
        //
    }

    /**
     * Handle the work day "force deleted" event.
     *
     * @param  \App\WorkDay  $workDay
     * @return void
     */
    public function forceDeleted(WorkDay $workDay)
    {
        //
    }
}
