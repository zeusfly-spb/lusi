<?php

namespace App\Http\Controllers;

use App\Appointment;
use App\Deal;
use App\Forfeit;
use App\Island;
use App\Prepay;
use App\Prize;
use App\Sick;
use App\User;
use App\Vacation;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class SalaryController extends Controller
{
    public function monthData(Request $request)
    {
        $dateArray = explode('-', $request->date);
        array_pop($dateArray);
        $monthStr = implode('-', $dateArray);
        $cache_name = 'salary_' . $request->island_id . '_' . $monthStr;
        $salary_data = Cache::rememberForever($cache_name, function () use ($request) {
            return $this->retrieveMonthData($request->date, $request->island_id);
        });
        return response()->json($salary_data);
    }

    static function retrieveMonthData(string $date, $island_id)
    {
        $date = new Carbon($date);
        $year = $date->year;
        $month = $date->month;
        $startDate = $date->startOfMonth()->toDateString();
        $endDate = $date->endOfMonth()->toDateString();

        $monthDates = [];
        $currentDate = strtotime($startDate);
        while ($currentDate <= strtotime($endDate)) {
            $monthDates[] = date("Y-m-d", $currentDate);
            $currentDate = strtotime("+1 day", $currentDate);
        }

        $dealsBuilder = Deal::with('user')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);
        if ($island_id) {
            $dealsBuilder = $dealsBuilder->where('island_id', $island_id);
        }
        $allDeals = $dealsBuilder->get();

        $queryBuilder = User::with('deals', 'workdays', 'prizes', 'forfeits', 'sicks', 'prepays', 'vacations', 'group', 'islands')
            ->where('is_superadmin', false)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereNull('fired_at')
                    ->orWhereBetween('fired_at', [$startDate, $endDate]);
            });

        if ($island_id) {
            $island = Island::with('users')->find($island_id);
            $salaryDisplay = $island->options['salary_display'] ?? 'attach';
            switch ($salaryDisplay) {
                case 'attach':
                    $queryBuilder = $queryBuilder->whereIn('id', $island->users->pluck('id')->all());
                    break;
                case 'time':
                    $periodUserIds = $island->WorkDays->whereBetween('created_at', [$startDate, $endDate])->pluck('user_id')->all();
                    $queryBuilder = $queryBuilder->whereIn('id', $periodUserIds);
                    break;
                case 'attach_time':
                    $attached = $island->users->pluck('id')->all();
                    $byTime = $island->WorkDays->whereBetween('created_at', [$startDate, $endDate])->pluck('user_id')->all();
                    $merged = array_merge($attached, $byTime);
                    $queryBuilder = $queryBuilder->whereIn('id', $merged);
                    break;
                case 'selected':
                    $selected = $island->options['selected_user_ids'] ?? [];
                    $queryBuilder = $queryBuilder->whereIn('id', $selected);
                    break;
            }

        } else {
            $queryBuilder = $queryBuilder->whereHas('islands');
        }
        $users = $queryBuilder->get();

        $appBuilder = Appointment::where('status_id', 4)->whereMonth('date', $month);
        if ($island_id) {
            $appBuilder = $appBuilder->where('island_id', $island_id);
        }
        $allAppointments = $appBuilder->get();

        return [
            'users' => $users->toArray(),
            'dates' => $monthDates,
            'allDeals' => $allDeals->toArray(),
            'allAppointments' => $allAppointments->toArray()
        ];
    }

    public function updateUserRate(Request $request)
    {
        $user = User::find($request->user_id);
        $user->update([$request->field_name => $request->value]);
        return response()->json(['user' => $user->toArray(), 'field_name' => $request->field_name]);
    }

    public function addUserPrize(Request $request)
    {
        $user = User::find($request->user_id);
        return response()->json($user->addPrize($request->amount, $request->island_id, $request->date, $request->comment ?? '')->toArray());
    }

    public function addUserForfeit(Request $request)
    {
        $user = User::find($request->user_id);
        return response()->json($user->addForfeit($request->amount, $request->island_id, $request->date, $request->comment ?? '')->toArray());
    }

    public function addUserSick(Request $request)
    {
        $user = User::find($request->user_id);
        return response()->json($user->addSick($request->amount, $request->island_id, $request->date, $request->comment ?? '')->toArray());
    }

    public function addUserPrepay(Request $request)
    {
        $user = User::find($request->user_id);
        return response()->json($user->addPrepay($request->amount, $request->island_id, $request->date, $request->comment)->toArray());
    }

    public function deleteUserForfeit(Request $request)
    {
        $forfeit = Forfeit::find($request->id);
        $user_id = $forfeit->user_id;
        $result = $forfeit->delete();
        return response()->json(['user_id' => $user_id, 'forfeit_id' => $request->id, 'result' => $result]);
    }

    public function deleteUserPrize(Request $request)
    {
        $prize = Prize::find($request->id);
        $user_id = $prize->user_id;
        $result = $prize->delete();
        return response()->json(['user_id' => $user_id, 'prize_id' => $request->id, 'result' => $result]);
    }

    public function deleteUserSick(Request $request)
    {
        $sick = Sick::find($request->id);
        $user_id = $sick->user_id;
        $result = $sick->delete();
        return response()->json(['user_id' => $user_id, 'sick_id' => $request->id, 'result' => $result]);
    }

    public function addUserVacation(Request $request)
    {
        $user = User::find($request->user_id);
        return response()->json($user->addVacation($request->amount, $request->island_id, $request->date, $request->comment ?? '')->toArray());
    }

    public function deleteUserVacation(Request $request)
    {
        $vacation = Vacation::find($request->id);
        $user_id = $vacation->user_id;
        $result = $vacation->delete();
        return response()->json(['user_id' => $user_id, 'vacation_id' => $request->id, 'result' => $result]);
    }

    public function deleteUserPrepay(Request $request)
    {
        $prepay = Prepay::find($request->id);
        $user_id = $prepay->user_id;
        $result = $prepay->delete();
        return response()->json(['user_id' => $user_id, 'prepay_id' => $request->id, 'result' => $result]);
    }
}
