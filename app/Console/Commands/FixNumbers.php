<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Lead;

class FixNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:numbers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix all lead phone numbers';

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
        $leads = Lead::all();
        $this->info('Starting fix ' . $leads->count() . ' leads');
        $start = microtime(true);
        foreach ($leads as $lead) {
            $modified = preg_replace("~\D~", "", $lead->phone);
            $clear = substr($modified, -10);
            $lead->update(['phone' => $clear]);
        }
        $end = microtime(true);
        $elapsed = $end - $start;
        $this->info('Fixed numbers on ' . $elapsed . ' sec.');
    }
}
