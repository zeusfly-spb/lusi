<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
         $this->call([
             DealActionSeeder::class,
             ProductsTableSeeder::class,
             SettingsTableSeeder::class,
             SizesTableSeeder::class,
             TypesTableSeeder::class,
             GroupSeeder::class
         ]);
    }
}
