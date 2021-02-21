<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $guarded = [];

    public function setHiglight(string $color = null)
    {
        return $this->update(['highlight' => $color]);
    }
}
