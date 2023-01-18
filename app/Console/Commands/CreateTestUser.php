<?php

namespace App\Console\Commands;

use App\Group;
use App\User;
use Illuminate\Console\Command;

class CreateTestUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test-user:make';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test user';

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
        $test = User::where('name', 'test')->first();
        if ($test) {
            $test->update(['password' => bcrypt('test')]);
            $this->info('Test user found, test:test');
            return;
        }
        User::create([
            'name' => 'test',
            'password' => bcrypt('test'),
            'first_name' => 'Test',
            'group_id' => Group::where('purpose', 'admin')->first()->id
        ]);
        $this->info('Test user created (test:test) with admin purpose');
    }
}
