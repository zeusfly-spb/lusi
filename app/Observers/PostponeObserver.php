<?php

namespace App\Observers;

use App\Postpone;
use Illuminate\Support\Facades\Cache;
use App\Jobs\RefreshLeadsList;

class PostponeObserver
{
    /**
     * Handle the postpone "created" event.
     *
     * @param  \App\Postpone  $postpone
     * @return void
     */
    public function created(Postpone $postpone)
    {
//        clearPostponesCache();
    }

    /**
     * Handle the postpone "updated" event.
     *
     * @param  \App\Postpone  $postpone
     * @return void
     */
    public function updated(Postpone $postpone)
    {
//        clearPostponesCache();
    }

    /**
     * Handle the postpone "deleted" event.
     *
     * @param  \App\Postpone  $postpone
     * @return void
     */
    public function deleted(Postpone $postpone)
    {
//        clearPostponesCache();
    }

    /**
     * Handle the postpone "restored" event.
     *
     * @param  \App\Postpone  $postpone
     * @return void
     */
    public function restored(Postpone $postpone)
    {
//        clearPostponesCache();
    }

    /**
     * Handle the postpone "force deleted" event.
     *
     * @param  \App\Postpone  $postpone
     * @return void
     */
    public function forceDeleted(Postpone $postpone)
    {
        //
    }
}
