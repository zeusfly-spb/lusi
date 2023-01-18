<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $guarded = [];
    protected $casts = [
        'data' => 'array',
    ];
}
