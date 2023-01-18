<?php

namespace App\Stock;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];
    protected $casts = [
        'changeable_price' => 'boolean'
    ];
}
