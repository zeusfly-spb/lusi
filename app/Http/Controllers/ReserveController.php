<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Stock\Reserve;

class ReserveController extends Controller
{
    public function index(Request $request)
    {
        $queryBuilder = Reserve::with('product', 'type', 'size')->whereDate('created_at', $request->date);
        if ($request->island_id) {
            $queryBuilder = $queryBuilder->where('island_id', $request->island_id);
        }
        return response()->json($queryBuilder->get()->toArray());
    }
}
