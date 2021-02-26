<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use App\Stock\Type;

class TypesTableSeeder extends Seeder
{
    /**
     * Run the database seeders.
     *
     * @return void
     */

    private $types = [
        'Флис',
        'Колоф',
        'Кожа'
    ];
    public function run()
    {
        echo PHP_EOL;
        foreach ($this->types as $type) {
            if (!Type::where('name', $type)->first()) {
                Type::create(['name' => $type]);
                echo "Type $type created" . PHP_EOL;
            } else {
                echo "Type $type already exists" . PHP_EOL;
            }
        }
    }
}
