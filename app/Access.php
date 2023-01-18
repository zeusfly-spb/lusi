<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Access extends Model
{
    protected $guarded = [];

    public function island()
    {
        return $this->belongsTo(Island::class);
    }
}
