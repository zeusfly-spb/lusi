<?php

namespace App;

use App\Stock\Product;
use App\Stock\Reserve;
use App\Stock\Size;
use App\Stock\StockAction;
use App\Stock\Type;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Island extends Model
{
    protected $guarded = [];

    protected $casts = [
        'options' => 'array',
        'chiefs' => 'array',
        'cabinets' => 'array'
    ];

    protected $appends = ['services', 'cabinets', 'is_call_center'];
    public $morningNotifyTime = '08:00';

    public function workDays()
    {
        return $this->hasMany(WorkDay::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class)->whereNull('fired_at');
    }

    public function startDays()
    {
        return $this->hasMany(StartDay::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function handovers()
    {
        return $this->hasMany(HandOver::class);
    }

    public function dateHandover(string $date)
    {
        $handover = $this->handovers()->whereDate('created_at', $date)->first();
        return $handover->amount ?? 0;
    }

    public function dateBalance(string $date)
    {
        return $this->deals()->whereDate('created_at', $date)->get()
            ->reduce(function ($acc, $deal) {
                return $deal->is_cache ? $acc + $deal->income - $deal->expense : $acc;
            }, $this->startBalance($date));
    }

    public function startBalance(string $date)
    {
        return $this->startDays()->whereDate('created_at', $date)->first()->amount ?? 0;
    }

    public function dateExpenses(string $date)
    {
        return $this->expenses()->whereDate('created_at', $date)->get()
            ->reduce(function ($acc, $item) {
                return $acc + $item->amount;
            }, 0);
    }

    public function makeStartDate()
    {
        $yesterday = Carbon::yesterday()->toDateString();
        return $this->startDays()->create(['amount' => $this->dateBalance($yesterday) - $this->dateExpenses($yesterday) - $this->dateHandover($yesterday)]);
    }

    //Stock

    public function reserves()
    {
        return $this->hasMany(Reserve::class);
    }

    public function dateReserves(string $date)
    {
        return $this->reserves()->whereDate('created_at', $date)->get();
    }

    public function stockActions()
    {
        return $this->hasMany(StockAction::class);
    }

    public function dateStockActions(string $date)
    {
        return $this->stockActions()->whereDate('created_at', $date)->get();
    }

    public function makeReserves()
    {
        $productIds = Product::pluck('id')->all();
        $typeIds = Type::pluck('id')->all();
        $sizeIds = Size::pluck('id')->all();

        $yesterday = Carbon::yesterday()->toDateString();
        $yesterdayReserves = $this->dateReserves($yesterday);
        $yesterdayActions = $this->dateStockActions($yesterday);

        foreach ($productIds as $productId) {

            $product = Product::find($productId);
            if ($product->description === 'good') {
                $prevCount = $yesterdayReserves->where('product_id', $productId)->first()->count ?? 0;
                $actions = $yesterdayActions->where('product_id', $productId);
                $count = $actions->reduce(function ($carry, $action) {
                    return $action->type === 'receipt' ? $carry + $action->count : $carry - $action->count;
                }, $prevCount);
                $this->reserves()->create([
                    'product_id' => $productId,
                    'count' => $count
                ]);
                continue;
            }

            foreach ($typeIds as $typeId) {
                foreach ($sizeIds as $sizeId) {
                    $prevCount = $yesterdayReserves
                        ->where('product_id', $productId)
                        ->where('type_id', $typeId)
                        ->where('size_id', $sizeId)
                        ->first()
                        ->count ?? 0;
                    $actions = $yesterdayActions
                        ->where('product_id', $productId)
                        ->where('type_id', $typeId)
                        ->where('size_id', $sizeId);
                    $count = $actions->reduce(function ($carry, $action) {
                        return $action->type === 'receipt' ?  $carry + $action->count : $carry - $action->count;
                    }, $prevCount);
                    $this->reserves()->create([
                        'product_id' => $productId,
                        'type_id' => $typeId,
                        'size_id' => $sizeId,
                        'count' => $count
                    ]);
                }
            }
        }
    }

    public function chief()
    {
        return $this->belongsTo(User::class, 'chief_id', 'id');
    }

    public function setChiefToDate(string $date, int $user_id)
    {
        $chiefs = collect($this->chiefs);
        $exists = $chiefs->where('date', $date)->first();
        if ($exists) {
            $exists->user_id = $user_id;
        } else {
            $chiefs->push((object) ['date' => $date, 'user_id' => $user_id]);
        }
        return $this->update(['chiefs' => $chiefs->all()]);
    }

    public function getChiefAtDate(string $date)
    {
        $chiefs = collect($this->chiefs);
        $user_id = $chiefs->where('date', '<=', $date)->first();
        return User::find($user_id) ?? null;
    }

    public function getServicesAttribute()
    {
        $services = $this->options['service_ids'] ?? [];
        if (Cache::has('services')) {
            return Cache::get('services')->whereIn('id', $services)->values();
        } else {
            return Service::whereIn('id', $services)->get();
        }
    }

    public function getCabinetsAttribute()
    {
        $cabinets = $this->options['cabinets'] ?? [];
        return collect($cabinets);
    }

    public function getEventsAttribute()
    {
        return Appointment::where('island_id', $this->id)->get();
    }

    public function cabinetsReduced()
    {
        if (!$this->cabinets->count()) {
            $this->events->each(function ($item) {
                $item->update(['cabinet_id' => null]);
            });
            $result = (object) [
                'mode' => 'last',
                'count' => $this->events->count()
            ];
        } else {
            $lastCabinetId = $this->cabinets->last()['id'];
            $cabinetIds = $this->cabinets->pluck('id')->all();
            $toUpdate = $this->events->whereNotIn('cabinet_id', $cabinetIds);
            $toUpdate->each(function ($item) use ($lastCabinetId) {
                $item->update(['cabinet_id' => $lastCabinetId]);
            });
            $result = (object) [
                'mode' => 'middle',
                'count' => $toUpdate->count()
            ];
        }
        return $result;
    }

    public function firstCabinetCreated()
    {
        if ($this->cabinets->count() !== 1) {
            return (object) [
                'mode' => 'error',
                'count' => $this->cabinets->count()
            ];
        }
        $firstCabinetId = $this->cabinets->first()['id'];
        $this->events->each(function ($item) use ($firstCabinetId) {
            $item->update(['cabinet_id' => $firstCabinetId]);
        });
        $result = (object) [
            'mode' => 'first',
            'count' => $this->events->count()
        ];
        return $result;
    }

    public function getEventReminderAttribute()
    {
        return $this->options['EventReminder'] ?? null;
    }

    public function getEventReminderTemplateIdAttribute()
    {
        return $this->options['EventReminderTemplateId'] ?? null;
    }

    public function setOption($key, $val)
    {
        $options = $this->options;
        $options[$key] = $val;
        return $this->update(['options' => $options]);
    }

    public function eventsAfter(int $minutes)
    {
        $target = now()->addMinutes($minutes);
        $start = $target->setSecond(00)->toDateTimeString();
        $finish = $target->setSecond(59)->toDateTimeString();
        return $this->events->where('status_id', 1)->filter(function ($item) use ($start, $finish) {
            return $item->date >= $start && $item->date <= $finish;
        });
    }

    public function eventsToday()
    {
        $start = today()->setTime(00, 00)->toDateTimeString();
        $finish = today()->setTime(23, 59)->toDateTimeString();
        return $this->events->where('status_id', 1)->filter(function ($item) use ($start, $finish) {
            return $item->date >= $start && $item->date <= $finish;
        });
    }

    public function remindNow()
    {
        if (!$this->event_reminder || $this->event_reminder === 'morning') {
            return [];
        }
        return $this->eventsAfter($this->event_reminder);
    }

    public function sendMorningReminders()
    {
        $now = now()->toTimeString();
        if ($this->morningNotifyTime . ':00' <= $now && $now <= $this->morningNotifyTime . ':59') {
            $template = NotifyTemplate::find($this->day_start_notify_template_id);
            $reminders = $this->eventsToday();
            if (!$template || !$reminders->count()) {
                return;
            }
            foreach ($reminders as $event) {
                sendSms([
                    'extension' => 951,
                    'user_id' => 0,
                    'island_id' => $this->id,
                    'phone' => '+7' . $event->client_phone,
                    'text' => substituteEventText($template->text, $event)
                ]);
            }
        }
    }

    public function sendReminders()
    {
        if ($this->day_start_notify_template_id) {
            $this->sendMorningReminders();
            return;
        }
        $reminders = $this->remindNow();
        if (!count($reminders)) {
            return;
        }
        $template = NotifyTemplate::find($this->event_reminder_template_id);
        foreach ($reminders as $event) {
            sendSms([
                'extension' => 951,
                'user_id' => 0,
                'island_id' => $this->id,
                'phone' => '+7' . $event->client_phone,
                'text' => substituteEventText($template->text, $event)
            ]);
        }
    }

    public function getCreateNotifyTemplateIdAttribute()
    {
        return $this->options['CreateNotifyTemplateId'] ?? null;
    }

    public function getDayStartNotifyTemplateId()
    {
        return $this->options['DayStartNotifyTemplateId'] ?? null;
    }

    public function getIsCallCenterAttribute()
    {
        return $this->options['callCenter'] ?? false;
    }
}
