<?php

namespace App\Http\Controllers;

use App\Deal;
use App\DealAction;
use App\Expense;
use App\HandOver;
use App\Service;
use App\Stock\Product;
use App\Stock\Reserve;
use App\Stock\Size;
use App\Stock\StockAction;
use App\Stock\Type;
use App\Subscription;
use App\WorkDay;
use App\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use App\Island;
use Illuminate\Support\Facades\Cache;

class LoaderController extends Controller
{
    public function loadStockPage(Request $request)
    {
        $reserveBuilder = Reserve::with('product', 'type', 'size')->whereDate('created_at', $request->date);
        if ($request->island_id) {
            $reserveBuilder = $reserveBuilder->where('island_id', $request->island_id);
        }
        $reserves = $reserveBuilder->get()->toArray();
        $stockActionsBuilder = StockAction::with('product', 'size', 'user')->whereDate('created_at', $request->date);
        if ($request->island_id) {
            $stockActionsBuilder = $stockActionsBuilder->where('island_id', $request->island_id);
        }
        $stock_actions = $stockActionsBuilder->get()->toArray();
        $stock_options = [
            'products' => Product::all()->toArray(),
            'types' => Type::all()->toArray(),
            'sizes' => Size::all()->toArray(),
            'deal_actions' => DealAction::all()->toArray()
        ];
        return response()->json(['reserves' => $reserves, 'stock_actions' => $stock_actions, 'stock_options' => $stock_options]);
    }

    public function priorPrepare()
    {
        $result = ['date' => now()->toDateString()];
        $setting = Setting::find(1);
        if ($setting) {
            $result = Arr::add($result, 'setting', $setting->toArray());
        }
        $islands = Island::with('users')->get();
        $result = Arr::add($result, 'islands', $islands->toArray());
        return response()->json($result);
    }

    public function loadDailyPage(Request $request)
    {
        $date = $request->date;
        $island_id = $request->island_id;

        $workdaysBuilder = WorkDay::with('user', 'timeBreaks')->whereDate('date', $request->date);
        if ($island_id > 0) {
            $workdaysBuilder = $workdaysBuilder->where('island_id', $island_id);
        }
//        $workdays = $workdaysBuilder->get()->toArray();

        $dealsBuilder = Deal::with('user', 'customer', 'action')->whereDate('created_at', $date);
        if ($island_id) {
            $dealsBuilder = $dealsBuilder->where('island_id', $island_id);
        }
//        $deals = $dealsBuilder->get()->toArray();

        $expensesBuilder = Expense::with('user', 'island')->whereDate('created_at', $date);
        if ($island_id) {
            $expensesBuilder = $expensesBuilder->where('island_id', $island_id);
        }
        $expenses = $expensesBuilder->get()->toArray();

        $handoversBuilder = HandOver::whereDate('created_at', $request->date);
        if ($request->island_id) {
            $handover = $handoversBuilder->where('island_id', $request->island_id)->first();
            $amount = $handover->amount ?? null;
        } else {
            $handovers = $handoversBuilder->get();
            $amount = $handovers->reduce(function ($carry, $item) {
                return $carry + $item->amount;
            });
        }
        $handoverAmount = $amount;

        return response()->json([
//            'workdays' => $workdays,
//            'deals' => $deals,
            'expenses' => $expenses,
            'handover' => $handoverAmount
        ]);
    }

    public function loadSetting()
    {
        $setting = Setting::find(1);
        if ($setting) {
            return response()->json($setting->toArray());
        }
        return response()->json([]);
    }
}
