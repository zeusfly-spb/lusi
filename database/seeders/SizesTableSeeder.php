<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use App\Stock\Size;

class SizesTableSeeder extends Seeder
{
    /**
     * Run the database seeders.
     *
     * @return void
     */
    private $sizes = [
        '29-30',
        '31-31.5',
        '32-33',
        '34-34.5',
        '35-36',
        '37-37.5',
        '38-39',
        '40-40.5',
        '41-42',
        '43-43.5',
        '44-45',
        '46-46.5',
        '47'
    ];

    public function run()
    {
        echo PHP_EOL;
        foreach ($this->sizes as $size) {
            if (!Size::where('name', $size)->first()) {
                Size::create(['name' => $size]);
                echo "Size $size created" . PHP_EOL;
            } else {
                echo "Size $size already exists" . PHP_EOL;
            }
        }
    }
}
