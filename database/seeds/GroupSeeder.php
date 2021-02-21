<?php

use Illuminate\Database\Seeder;
use App\Group;

class GroupSeeder extends Seeder
{
    private $prototypes = [
        ['name' => 'Администраторы', 'description' => 'Администрация', 'purpose' => 'admin'],
        ['name' => 'Логисты', 'description' => 'Логистика', 'purpose' => 'logistics'],
    ];

    public function run()
    {
        foreach ($this->prototypes as $proto) {
            $before = Group::where('purpose', $proto['purpose'])->first();
            if ($before) {
                $before->update($proto);
                echo 'Group with purpose "' . $proto['purpose'] . '" exists & was updated.' . PHP_EOL;
            } else {
                Group::create($proto);
                echo 'Group with purpose "' . $proto['purpose'] . '" created.' . PHP_EOL;
            }
        }
    }
}
