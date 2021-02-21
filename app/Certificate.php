<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $guarded = [];
    protected $casts = ['history' => 'object'];
}
