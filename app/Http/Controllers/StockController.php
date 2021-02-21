<?php

namespace App\Http\Controllers;

use App\DealAction;
use App\Island;
use App\Stock\Product;
use App\Stock\Reserve;
use App\Stock\Size;
use App\Stock\Type;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function updateProduct(Request $request)
    {
        $product = Product::find($request->id);
        $product->update($request->all());
        return response()->json($product->toArray());
    }

    public function addProduct(Request $request)
    {
        Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'description' => 'good'
        ]);
        $todayReserves = Reserve::whereDate('created_at', now()->toDateString())->get();
        Reserve::destroy($todayReserves->pluck('id')->all());
        $islands = Island::all();
        foreach ($islands as $island) {
            $island->makeReserves();
        }
        return response()->json([
            'products' => Product::all()->toArray(),
            'types' => Type::all()->toArray(),
            'sizes' => Size::all()->toArray(),
            'deal_actions' => DealAction::all()->toArray()
        ]);
    }

    public function deleteProduct(Request $request)
    {
        Product::destroy($request->id);
        $todayReserves = Reserve::whereDate('created_at', now()->toDateString())->get();
        Reserve::destroy($todayReserves->pluck('id')->all());
        $islands = Island::all();
        foreach ($islands as $island) {
            $island->makeReserves();
        }
        return response()->json([
            'products' => Product::all()->toArray(),
            'types' => Type::all()->toArray(),
            'sizes' => Size::all()->toArray(),
            'deal_actions' => DealAction::all()->toArray()
        ]);
    }
}
