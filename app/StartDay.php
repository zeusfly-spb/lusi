<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class StartDay extends Model
{
    protected $guarded = [];

    public function island()
    {
        return $this->belongsTo(Island::class);
    }
}
