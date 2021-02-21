<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class Lead extends Model
{
    protected $guarded = [];
    protected $appends = ['last_postpone', 'last_comment', 'last_call', 'customer'];
    protected $casts = [
        'calls' => 'array',
        'appointments' => 'array'
    ];
    protected $hidden = ['appointments'];

    public function comments()
    {
        return $this->hasMany(LeadComment::class)->with('user');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function postpones()
    {
        return $this->hasMany(Postpone:: class)->with('user');
    }

    public function addComment(string $text, $user_id = null)
    {
        return $this->comments()->create(['user_id' => $user_id, 'text' => $text]);
    }

    public function addPostpone($date, $user_id)
    {
        return $this->postpones()->create([
            'user_id' => $user_id,
            'date' => $date
        ]);
    }

    public function getLastPostponeAttribute()
    {
        return $this->postpones->last() ?? null;
    }

    public function getLastCommentAttribute()
    {
        return $this->comments->last() ?? null;
    }

    public function addCall($call)
    {
        $calls = $this->calls;
        $calls[] = $call;
        $this->update(['calls' => $calls]);
    }

    public function getLastCallAttribute()
    {
        if ($this->calls && count($this->calls)) {
            return $this->calls[count($this->calls) - 1] ?? null;
        } else {
            return null;
        }
    }

    public function getPhoneAttribute($val)
    {
        $modified = preg_replace("~\D~", "", $val);
        return substr($modified, -10);
    }

    public function number()
    {
        return $this->belongsTo(Phone::class, 'phone', 'number')->with('customer');
    }

    public function getCustomerAttribute()
    {
        return $this->number->customer ?? null;
    }


    public function event()
    {
        return $this->hasOne(Appointment::class);
    }
}
