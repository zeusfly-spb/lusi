<?php

namespace App\Http\Controllers;

use App\HandOver;
use Illuminate\Http\Request;

class HandOverController extends Controller
{
    public function index(Request $request)
    {
        $queryBuilder = HandOver::whereDate('created_at', $request->date);
        if ($request->island_id) {
            $handover = $queryBuilder->where('island_id', $request->island_id)->first();
            $amount = $handover->amount ?? null;
        } else {
            $handovers = $queryBuilder->get();
            $amount = $handovers->reduce(function ($carry, $item) {
                return $carry + $item->amount;
            });
        }
        return response()->json(['amount' => $amount]);
    }

    public function create(Request $request)
    {
        $handOver = HandOver::create([
            'user_id' => $request->user_id,
            'island_id' => $request->island_id,
            'amount' => $request->amount
        ]);
        return response()->json($handOver->toArray());
    }

    public function update(Request $request)
    {
        $handover = HandOver::whereDate('created_at', $request->date)
            ->where('island_id', $request->island_id)->first();
        if (!$request->amount) {
            $handover->delete();
            return response()->json(['amount' => null]);
        }
        $handover->update(['amount' => $request->amount]);
        return response()->json(['amount' => $handover->amount]);
    }
}
