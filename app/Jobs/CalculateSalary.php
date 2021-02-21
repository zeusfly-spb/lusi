<?php

namespace App\Jobs;

use App\Listeners\DealPerformedListener;
use App\Http\Controllers\SalaryController;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class CalculateSalary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $island_id;
    protected $date;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Model $model)
    {
        $this->island_id = $model->island_id;
        $this->date = explode(' ', $model->created_at)[0];
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $dateArray = explode('-', $this->date);
        array_pop($dateArray);
        $monthStr = implode('-', $dateArray);
        $cache_name = 'salary_' . $this->island_id . '_' . $monthStr;
        Cache::forget($cache_name);
        Cache::forever($cache_name, SalaryController::retrieveMonthData($this->date, $this->island_id));
        $cache_name = 'salary_0_' . $monthStr;
        Cache::forget($cache_name);
        Cache::forever($cache_name, SalaryController::retrieveMonthData($this->date, 0));
    }
}
