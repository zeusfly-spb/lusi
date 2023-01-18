<?php

namespace App\Listeners;

use App\Deal;
use App\Events\DealPerformed;
use App\Island;
use App\User;
use Carbon\Carbon;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Cache;

class DealPerformedListener implements ShouldQueue
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  DealPerformed  $event
     * @return void
     */
    public function handle(DealPerformed $event)
    {
        $deal = $event->deal;
        $created = $deal->created_at;
        $date = explode(' ', $created)[0];
        $dateArray = explode('-', $date);
        array_pop($dateArray);
        $monthStr = implode('-', $dateArray);
        $cache_name = 'salary_' . $deal->island_id . '_' . $monthStr;
        Cache::forget($cache_name);
        Cache::put($cache_name, $this->retrieveMonthData($date, $deal->island_id));
        $cache_name = 'salary_0_' . $monthStr;
        Cache::forget($cache_name);
        Cache::put($cache_name, $this->retrieveMonthData($date, 0));
    }

    static function retrieveMonthData(string $date, int $island_id)
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
        $queryBuilder = User::with('deals', 'workdays', 'controlledIslands', 'prizes', 'forfeits', 'sicks', 'prepays', 'vacations')
            ->where('is_superadmin', false)
            ->whereNull('fired_at');
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
        return ['users' => $users->toArray(), 'dates' => $monthDates, 'allDeals' => $allDeals->toArray()];
    }
}
