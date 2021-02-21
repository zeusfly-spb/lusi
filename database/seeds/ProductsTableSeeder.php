<?php

use Illuminate\Database\Seeder;
use App\Stock\Product;

class ProductsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */


    private $prototypes = [
        ['name' => 'Стельки', 'description' => null, 'price' => null],
        ['name' => 'Полустельки', 'description' => null, 'price' => null],
        ['name' => 'Подпяточник 1см.', 'description' => 'good', 'price' => 100],
        ['name' => 'Подпяточник 0.5 см.', 'description' => 'good', 'price' => 100],
        ['name' => 'Пластинка для варуса 0.5 см.', 'description' => 'good', 'price' => 100],
        ['name' => 'Пластинка для варуса 1 см.', 'description' => 'good', 'price' => 100],
        ['name' => 'Фиксатор для большого пальца', 'description' => 'good', 'price' => 300],
        ['name' => 'Абонемент', 'description' => 'subscription', 'price' => null]
    ];

    public function run()
    {
        echo PHP_EOL;
        foreach ($this->prototypes as $proto) {
            if (!Product::where('name', $proto['name'])->first()) {
                Product::create(['name' => $proto['name'], 'description' => $proto['description'], 'price' => $proto['price']]);
                echo "Product " . $proto['name'] . " created" . PHP_EOL;
            } else {
                $product = Product::where('name', $proto['name'])->first();
                $product->update([
                    'description' => $proto['description'],
                    'price' => $proto['price']
                ]);
                echo "Product " . $proto['name'] . " already exists & was updated" . PHP_EOL;
            }
        }
    }
}
