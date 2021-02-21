<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\CacheController;

class CreateActiveLeadsCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:leads';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create active leads cache';

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
        $elapsed = CacheController::createActiveLeadsCache();
        $this->info("Created active leads cache in $elapsed sec.");
    }
}
