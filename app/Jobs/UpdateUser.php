<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\User;
use Illuminate\Support\Facades\Cache;

class UpdateUser implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $date;
    protected $monthStr;
    protected $commonCache;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(User $user)
    {
        $this->user = $user;
        $this->date = explode(' ', $user->updated_at)[0];
        $dateArray = explode('-', $this->date);
        array_pop($dateArray);
        $this->monthStr = implode('-', $dateArray);
        $this->common_cache = 'salary_0_' . $this->monthStr;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $rateMonths = [];
        foreach ($this->user->rates as $rate) {
            $rateMonths[] = $rate['month'];
        }
        $rateMonths = array_unique($rateMonths);
        $islandIds = $this->user->islands->pluck('id')->all();
        foreach ($islandIds as $islandId) {
            foreach ($rateMonths as $month) {
                $cache_name = 'salary_' . $islandId . '_' . $month;
                Cache::forget($cache_name);
            }
        }
        Cache::forget('salary_0_' . $month);
    }
}
