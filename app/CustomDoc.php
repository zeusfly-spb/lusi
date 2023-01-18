<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CustomDoc extends Model
{
    protected $guarded = [];

    public function documentPack()
    {
        return $this->belongsTo(DocumentPack::class);
    }

}
