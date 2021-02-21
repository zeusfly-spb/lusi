<?php

namespace App\Observers;

use App\Jobs\CalculateSalary;
use App\Prize;
use Illuminate\Support\Facades\Cache;

class PrizeObserver
{
    /**
     * Handle the prize "created" event.
     *
     * @param  \App\Prize  $prize
     * @return void
     */
    public function created(Prize $prize)
    {

//        CalculateSalary::dispatch($prize);
    }

    /**
     * Handle the prize "updated" event.
     *
     * @param  \App\Prize  $prize
     * @return void
     */
    public function updated(Prize $prize)
    {
//        CalculateSalary::dispatch($prize);
    }

    /**
     * Handle the prize "deleted" event.
     *
     * @param  \App\Prize  $prize
     * @return void
     */
    public function deleted(Prize $prize)
    {
//        CalculateSalary::dispatch($prize);
    }

    /**
     * Handle the prize "restored" event.
     *
     * @param  \App\Prize  $prize
     * @return void
     */
    public function restored(Prize $prize)
    {
        //
    }

    /**
     * Handle the prize "force deleted" event.
     *
     * @param  \App\Prize  $prize
     * @return void
     */
    public function forceDeleted(Prize $prize)
    {
        //
    }
}
