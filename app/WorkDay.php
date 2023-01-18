<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class WorkDay extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timeBreaks()
    {
        return $this->hasMany(TimeBreak::class);
    }

    public function startTimeBreak()
    {
        return $this->timeBreaks()->create(['start_time' => now()->toTimeString()]);
    }

    public function finishTimeBreak()
    {
        $currentTimeBreak = $this->timeBreaks()->whereDate('created_at', now()->toDateString())->where('finish_time', null)->first();
        $currentTimeBreak->update(['finish_time' => now()->toTimeString()]);
        return $currentTimeBreak;
    }

    public function isOnTimeBreak()
    {
        $unclosedBreaks = $this->timeBreaks->filter(function ($value) {
            return $value->finish_time === null;
        });
        return $unclosedBreaks->count() > 0;
    }

    public function closeDay()
    {
        if ($this->isOnTimeBreak()) {
            $this->finishTimeBreak();
        }
        $start = Carbon::create($this->time_start) ;
        $now = now();
        $difference = $now->diffInMinutes($start);

        $breakTime = $this->timeBreaks->reduce(function ($carry, $item) {
            $tb_start = Carbon::create($item->start_time);
            $tb_finish = Carbon::create($item->finish_time);
            return $carry + $tb_finish->diffInMinutes($tb_start);
        }, 0);

        $workingHours = round(($difference - $breakTime) / 60, 2);
        $this->update(['time_finish' => $now->toTimeString(), 'working_hours' => $workingHours]);
        $this->load('user', 'timeBreaks');
        return $this;
    }
}
