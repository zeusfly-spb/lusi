<?php

namespace App\Console;

use App\Island;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\MakeNotifyList;
use Illuminate\Support\Facades\Log;
use App\Console\Commands\CalculateBalances;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {

//        $schedule->job(new MakeNotifyList)->everyMinute();
        $schedule->call(function () {
            $islands = Island::all();
            foreach ($islands as $island) {
                $island->sendReminders();
            }
        })->everyMinute();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
