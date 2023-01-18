<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TimeBreak extends Model
{
    protected $guarded = [];

    public function workday()
    {
        return $this->belongsTo(WorkDay::class);
    }
}
