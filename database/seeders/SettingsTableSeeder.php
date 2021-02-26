<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use App\Setting;

class SettingsTableSeeder extends Seeder
{
    private $data = [
        'switcherPanel' => [
            'maxAvaCount' => 3,
            'sortingParam' => 'income',
            'chiefFirst' => false,
            'reverseList' => false
        ],
        'salaryPage' => [
            'visible' => false,
            'showPersonal' => true,
            'showOther' => false,
            'showTotal' => false,
            'showChief' => false
        ]
    ];
    /**
     * Run the database seeders.
     *
     * @return void
     */
    public function run()
    {
        echo PHP_EOL;
        $setting = Setting::find(1);
        if ($setting) {
            $setting->update(['data' => $this->data]);
            echo "Settings updated" . PHP_EOL;
            return;
        }
        Setting::create(['data' => $this->data]);
        echo "Settings created" . PHP_EOL;
    }
}
