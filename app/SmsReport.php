<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SmsReport extends Model
{
    protected $guarded = [];
    protected $appends = ['length'];

    public function getLengthAttribute()
    {
        return Str::length($this->text);
    }
}
