<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class Subscribe extends Model
{
    protected $guarded = [];
    protected $casts = [
        'comments' => 'array'
    ];
    protected $appends = [
        'finish_date',
        'last_comment',
        'nominal',
        'customer_name',
        'customer_phone',
        'last_event',
        'scale'
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function getCustomerNameAttribute()
    {
        return $this->customer->full_name ?? '';
    }

    public function getCustomerPhoneAttribute()
    {
        return $this->customer->phones->last()->number ?? null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function addComment(string $text, int $user_id = null)
    {
        $comments = $this->attributes['comments'] ? $this->comments : [];
         array_unshift($comments, (object) [
             'id' => Str::uuid(),
             'user_id' => $user_id,
             'text' => $text,
             'created_at' => now()->toDateTimeString()
        ]);
        $this->update(['comments' => $comments]);
    }

    public function deleteComment(string $id)
    {
        $comments = $this->comments;
        $comments = Arr::where($comments, function ($item) use ($id) {
            return $item['id'] !== $id;
        });
        $this->update(['comments' => $comments]);
    }

    public function getLastCommentAttribute()
    {
        if (!$this->attributes['comments']) {
            return null;
        }
        return $this->comments[0] ?? null;
    }

    public function getFinishDateAttribute()
    {
        $startDate = new Carbon($this->start_date);
        $finishDate = $startDate->addDays($this->subscription->number_days);
        return $finishDate->toDateString();
    }

    public function events()
    {
        return $this->hasMany(Appointment::class);
    }

    public function getLastEventAttribute()
    {
        return $this->events->last() || null;
    }

    public function getNominalAttribute()
    {
        return $this->subscription->supply_amount ?? 0;
    }

    public function getScaleAttribute()
    {
        $scale = [];
        $eventsCount = $this->events->count() ?? 0;
        for ($i = 0; $i < $this->nominal; $i++) {
            $step = null;
            if ($i <= ($eventsCount - 1)) {
                $step = $this->events[$i]->status;
            }
            $scale[] = $step;
        }
        return $scale;
    }
}
