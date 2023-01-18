<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\CacheController;

class CacheData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Put all data into cache';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    protected $controller;

    public function __construct()
    {
        parent::__construct();
        $this->controller = new CacheController();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $elapsed = $this->controller->cacheAll();
        $this->info("All app data cached in $elapsed sec.");
    }
}
