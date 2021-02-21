<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Island;

class CalculateBalances extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'calculate:balances';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate Islands balances & store StartDay amount';

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
        $islands = Island::all();
        foreach ($islands as $island) {
            $island->makeReserves();
            $this->info($island->name . ' reserves counted');
            $this->info($island->name . ' = ' .$island->makeStartDate()->amount . PHP_EOL);
        }
    }
}
