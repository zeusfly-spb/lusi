<?php

namespace App\Http\Controllers;

use App\DealAction;
use App\Stock\Product;
use App\Stock\Size;
use App\Stock\StockAction;
use App\Stock\Type;
use Illuminate\Http\Request;

class StockActionController extends Controller
{
    public function index(Request $request)
    {
        $queryBuilder = StockAction::with('product', 'size', 'user')->whereDate('created_at', $request->date);
        if ($request->island_id) {
            $queryBuilder = $queryBuilder->where('island_id', $request->island_id);
        }
        return response()->json($queryBuilder->get()->toArray());
    }

    public function create(Request $request)
    {
        $stockAction = StockAction::create($request->all());
        $stockAction->load('product', 'size', 'user');
        return response()->json($stockAction->toArray());
    }

    public function getStockOptions()
    {
        return response()->json([
            'products' => Product::all()->toArray(),
            'types' => Type::all()->toArray(),
            'sizes' => Size::all()->toArray(),
            'deal_actions' => DealAction::all()->toArray()
        ]);
    }
}
