<?php

namespace App\Console\Commands;

use App\Island;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use App\Listeners\DealPerformedListener;

class CacheSalary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:salary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cache users salary';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $islandIds = Island::all()->pluck('id')->all();
        foreach ($islandIds as $id) {
            $date = now()->toDateString();
            $dateArray = explode('-', $date);
            array_pop($dateArray);
            $monthStr = implode('-', $dateArray);
            $cache_name = 'salary_' . $id . '_' . $monthStr;
            if (!Cache::has($cache_name)) {
                Cache::put($cache_name, DealPerformedListener::retrieveMonthData($date, $id));
                $cache_name = 'salary_0_' . $monthStr;
                Cache::forget($cache_name);
                Cache::put($cache_name, DealPerformedListener::retrieveMonthData($date, 0));
                $this->info($id . '# Island salary counted');
            }
        }

    }
}
