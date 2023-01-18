<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $guarded = [];
    protected $appends = [
        'full_name',
        'sent_messages'
    ];

    public function phones()
    {
        return $this->hasMany(Phone::class);
    }

    public function getFullNameAttribute()
    {
        return $this->last_name . ' ' . $this->first_name . ' ' . $this->patronymic;
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function getSentMessagesAttribute()
    {
        $numbersArray = $this->phones->pluck('number')->transform(function ($item) {
            return '+7' . $item;
        })->all();
        return SmsReport::whereIn('number', $numbersArray)->get();
    }
}
