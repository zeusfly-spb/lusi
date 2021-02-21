<?php

namespace App;

use App\Stock\Product;
use App\Stock\Size;
use App\Stock\StockAction;
use App\Stock\Type;
use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    protected $guarded = [];
    protected $casts = [
        'is_cache' => 'boolean',
    ];
    protected $appends = [
        'insole',
        'action_type',
        'has_appointment',
        'is_service'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class)->withDefault([
            'first_name' => 'Аноним'
        ]);
    }

    public function action()
    {
        return $this->belongsTo(DealAction::class, 'deal_action_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function type()
    {
        return $this->belongsTo(Type::class);
    }

    public function size()
    {
        return $this->belongsTo(Size::class);
    }

    public function stockAction()
    {
        return $this->hasOne(StockAction::class);
    }

    public function appointment()
    {
        return $this->hasOne(Appointment::class);
    }

    public function getInsoleAttribute()
    {
        $product = $this->product->name ?? '';
        $type = $this->type->name ?? '';
        $size = $this->size->name ?? '';
        $isGood = $this->product && $this->product->description === 'good';

        if ($isGood) {
            return (object) [
                'name' => $product
            ];
        } else {
            return (object) [
                'name' => $product . ' ' . $type . ' ' . $size
            ];
        }

    }

    public function getActionTypeAttribute()
    {
        return $this->action->type ?? null;
    }

    public function getHasAppointmentAttribute()
    {
        return !!$this->appointment;
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function getIsServiceAttribute()
    {
        return !!$this->service;
    }
}
