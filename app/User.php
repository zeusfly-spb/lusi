<?php

namespace App;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\HasApiTokens;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    protected $guarded = [];
    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $appends = [
        'full_name',
        'is_admin'
    ];

    protected $casts = [
        'is_superadmin' => 'boolean',
        'rates' => 'array'
    ];

    public function getFullNameAttribute()
    {
        return $this->last_name . ' ' . $this->first_name . ' ' . $this->patronymic;
    }

    public static function getUserByNameAndPassword($name, $password)
    {
        $users = self::where('name', $name)->get();
        foreach ($users as $user) {
            if (Hash::check($password, $user->password)) {
                return $user;
            }
        }
        return null;
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function islands()
    {
        return $this->belongsToMany(Island::class);
    }

    public function workdays()
    {
        return $this->hasMany(WorkDay::class);
    }

    public function startDay($island_id)
    {
        $now = now();
        $workday = $this->workdays()->create([
            'date' => $now->toDateString(),
            'time_start' => $now->toTimeString(),
            'island_id' => $island_id
        ]);
        $workday->load('user');
        return $workday;
    }

    public function finishDay(Array $data)
    {
        $currentWorkDay = $this->workdays()->whereDate('date', now()->toDateString())->first();
        $currentWorkDay->update([
            'time_finish' => now()->toTimeString(),
            'working_hours' => $data['working_hours'] ?? null,
            'dinner_start' => $data['dinner_start'] ?? null,
            'dinner_finish' => $data['dinner_finish'] ?? null
        ]);
        $currentWorkDay->load('user');
        return $currentWorkDay;
    }

    public function resumeDay()
    {
        $currentWorkDay = $this->workdays()->whereDate('date', now()->toDateString())->first();
        $currentWorkDay->update(['time_finish' => null]);
        $currentWorkDay->load('user');
        return $currentWorkDay;
    }

    public function startDinner()
    {
        $currentWorkDay = $this->workdays()->whereDate('date', now()->toDateString())->first();
        $currentWorkDay->update(['dinner_start' => now()->toTimeString()]);
        $currentWorkDay->load('user');
        return $currentWorkDay;
    }

    public function finishDinner()
    {
        $currentWorkDay = $this->workdays()->whereDate('date', now()->toDateString())->first();
        $currentWorkDay->update(['dinner_finish' => now()->toTimeString()]);
        $currentWorkDay->load('user');
        return $currentWorkDay;
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

    public function prizes()
    {
        return $this->hasMany(Prize::class);
    }

    public function forfeits()
    {
        return $this->hasMany(Forfeit::class);
    }

    public function sicks()
    {
        return $this->hasMany(Sick::class);
    }

    public function prepays()
    {
        return $this->hasMany(Prepay::class);
    }

    public function vacations()
    {
        return $this->hasMany(Vacation::class);
    }

    public function addPrize(int $amount, int $islandId, string $date, string $comment = '')
    {
        return $this->prizes()->create([
            'amount' => $amount,
            'comment' => $comment,
            'created_at' => $date,
            'island_id' => $islandId
        ]);
    }

    public function addForfeit(int $amount, int $islandId, string $date, string $comment = '')
    {
        return $this->forfeits()->create([
            'amount' => $amount,
            'comment' => $comment,
            'created_at' => $date,
            'island_id' => $islandId
        ]);
    }

    public function addSick(int $amount, int $islandId, string $date, string $comment = '')
    {
        return $this->sicks()->create([
                'amount' => $amount,
                'comment' => $comment,
                'created_at' => $date,
                'island_id' => $islandId
        ]);
    }

    public function addPrepay(int $amount, int $islandId, string $date, $comment = '')
    {
        return $this->prepays()->create([
            'amount' => $amount,
            'comment' => $comment,
            'created_at' => $date,
            'island_id' => $islandId
        ]);
    }

    public function addVacation(int $amount, int $islandId, string $date, $comment = '')
    {
        return $this->vacations()->create([
            'amount' => $amount,
            'comment' => $comment,
            'created_at' => $date,
            'island_id' => $islandId
        ]);
    }

    public function documentPack()
    {
        return $this->hasOne(DocumentPack::class)->with('customDocs');
    }

    public function createDocumentPack()
    {
        $this->documentPack()->create();
    }

    public function controlledIslands()
    {
        return $this->hasMany(Island::class, 'chief_id', 'id')->with('users');
    }

    public function rate(string  $type, int $island_id, string $month)
    {
        $islandTypeRates = array_filter($this->rates, function ($val) use ($type, $island_id) {
            return $val['type'] == $type && Arr::has($val, ['island_id']) && $val['island_id'] == $island_id;
        });
        if (!count($islandTypeRates)) {
            return 0;
        }
        $accurate = Arr::first($islandTypeRates, function ($val) use ($month) {
            return $val['month'] == $month;
        });
        if ($accurate) {
            return $accurate['value'];
        }
        uasort($islandTypeRates, function ($a, $b) {
            return ($a['month'] < $b['month']) ? -1 : 1;
        });
        $last = Arr::last($islandTypeRates, function ($val) use ($month) {
            return $val['month'] < $month;
        });
        return $last['value'] ?? 0;
    }

    public function getIsAdminAttribute()
    {
        return $this->group && $this->group->purpose === 'admin' ?? false;
    }

    public function getVpbxExtensionAttribute()
    {
        return $this->attributes['vpbx_extension'] ?? '';
    }

}
