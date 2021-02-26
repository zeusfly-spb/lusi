<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use App\DealAction;

class DealActionSeeder extends Seeder
{
    /**
     * Run the database seeders.
     *
     * @return void
     */
    private $actions = [
        'produce' => 'Изготовление',
        'correction' => 'Коррекция',
        'prodDefect' => 'Брак производства',
        'islandDefect' => 'Брак островка',
        'alteration' => 'Переделка',
        'return' => 'Возврат',
        'sale' => 'Продажа',
        'subscribe' => 'Оформление абонемента',
        'service' => 'Оказание услуги',
        'certificate' => 'Оформление сертификата'
    ];

    public function run()
    {
        echo PHP_EOL;
        foreach ($this->actions as $type => $text) {
            if (!DealAction::where('type', $type)->where('text', $text)->first()) {
                DealAction::create(['type' => $type, 'text' => $text]);
                echo "Deal Action $type ($text) created" . PHP_EOL;
            } else {
                echo "Deal Action $type ($text) already exists" . PHP_EOL;
            }
        }
    }
}
