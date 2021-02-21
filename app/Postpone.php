<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Postpone extends Model
{
    protected $guarded = [];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
