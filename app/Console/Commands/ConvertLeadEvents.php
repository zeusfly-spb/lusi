<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Lead;

class ConvertLeadEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'convert:events';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Modifying Lead models to have just one Appointment';

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
        $convertedCount = 0;
        $start = microtime(true);
        $leads = Lead::all();
        $toModify = [];
        $leads->each(function ($lead) use (&$toModify) {
            $events = json_decode($lead->getAttributes()['appointments']) ?? null;
            if ($events && count($events)) {
                $toModify[] = $lead;
            }
        });
        if ($count = count($toModify)) {
            $this->info("That are $count leads to be modified!");
            foreach ($toModify as $item) {
                $events = json_decode($item->getAttributes()['appointments']) ?? null;
                if (count($events)) {
                    $lastEventId = $events[count($events) - 1];
                    $item->update(['appointment_id' => $lastEventId]);
                    ++$convertedCount;
                }
            }
        }
        $finish = microtime(true);
        $estimated = $finish - $start;
        $this->info("Converted $convertedCount leads in $estimated sec.");
    }
}
