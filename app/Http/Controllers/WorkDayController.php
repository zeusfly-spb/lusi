<?php

namespace App\Http\Controllers;

use App\WorkDay;
use Illuminate\Http\Request;

class WorkDayController extends Controller
{
    public function index(Request $request)
    {
        $island_id = $request->island_id;
        $queryBuilder = WorkDay::with('user', 'timeBreaks')->whereDate('date', $request->date);
        if ($island_id > 0) {
//            $queryBuilder = $queryBuilder->whereHas('user', function($query) use ($island_id) {
//                $query->where('island_id', $island_id);
//            });
            $queryBuilder = $queryBuilder->where('island_id', $island_id);
        }
        $workdays = $queryBuilder->get();
        return response()->json($workdays->toArray());
    }

    public function startTimeBreak(Request $request)
    {
        $workday = WorkDay::find($request->work_day_id);
        $workday->startTimeBreak();
        $workday->load('user', 'timeBreaks');
        return $workday->toArray();
    }

    public function finishTimeBreak(Request $request)
    {
        $workday = WorkDay::find($request->work_day_id);
        $workday->finishTimeBreak();
        $workday->load('user', 'timeBreaks');
        return $workday->toArray();
    }

    public function update(Request $request)
    {
        $workday = WorkDay::find($request->id);
        $workday->update($request->all());
        $workday->load('user', 'timeBreaks');
        return response()->json($workday->toArray());
    }

    public function addWorkDay(Request $request)
    {
        $toDelete = WorkDay::where('user_id', $request->user_id)
            ->where('date', $request->date)
            ->get();
        WorkDay::destroy($toDelete->pluck('id')->all());

        $workday = WorkDay::create([
            'user_id' => $request->user_id,
            'time_start' => '10:10:10',
            'date' => $request->date,
            'working_hours' => $request->working_hours,
            'island_id' => $request->island_id
        ]);
        $workday->load('user', 'timeBreaks');
        return response()->json($workday->toArray());
    }
}
