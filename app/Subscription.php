<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $guarded = [];
    protected $casts = [
        'changeable_price' => 'boolean'
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
