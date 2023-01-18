<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Appointment;

class ConvertEventStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'convert:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert Appointments statuses';

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
        $events = Appointment::all();
        $this->info('Всего записей: ' . $events->count());
        $statuses = [];
        foreach ($events as $event) {
            $statuses[] = $event->getAttributes()['status'];
        }
        $statusModes = array_unique($statuses);
        foreach ($statusModes as $mode) {
            $modeEvents = $events->filter(function ($val) use ($mode) {
                return $val->getAttributes()['status'] == $mode;
            });
            $this->info($mode . ': ' . $modeEvents->count());
            $faults = 0;
            $modeEvents->each(function ($item) use ($mode, $faults) {
                $res = $item->setStatus($item->getAttributes()['status']);
                if ($res) {
                    ++$faults;
                }
            });
            if ($faults > 0) {
                $this->info('Mode ' . $mode . ' has ' . $faults . ' errors while converting');
            }
        }
    }
}
