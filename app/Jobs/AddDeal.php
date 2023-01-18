<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Deal;
use Illuminate\Support\Facades\Cache;

class AddDeal implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $deal;
    protected $cache_name;
    protected $common_cache;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Deal $deal)
    {
        $this->deal = $deal;
        $date = explode(' ',$deal->created_at)[0];
        $dateArray = explode('-', $date);
        array_pop($dateArray);
        $monthStr = implode('-', $dateArray);
        $this->cache_name = 'salary_' . $deal->island_id . '_' . $monthStr;
        $this->common_cache = 'salary_0_' . $monthStr;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        //
    }

    public function insertCommon()
    {
        $commonMonthData = Cache::get($this->common_cache);
        $commonMonthData['allDeals'][] = $this->deal->toArray();
        Cache::put($this->common_cache, $commonMonthData);
    }

    public function insertCertain()
    {
        $certainMonthData = Cache::get($this->cache_name);
        $certainMonthData['allDeals'][] = $this->deal->toArray();
        Cache::put($this->cache_name, $certainMonthData);
    }
}
