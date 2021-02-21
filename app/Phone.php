<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Phone extends Model
{
    protected $guarded = [];

    public function customer()
    {
        return $this->belongsTo(Customer::class)->with('deals');
    }

    public function leads()
    {
        return $this->hasMany(Lead::class, 'phone', 'number');
    }
}
