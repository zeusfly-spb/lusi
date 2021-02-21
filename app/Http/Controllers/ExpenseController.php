<?php

namespace App\Http\Controllers;

use App\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->date;
        $island_id = $request->island_id;
        $user_id = $request->user_id;

        $queryBuilder = Expense::with('user', 'island')->whereDate('created_at', $date);
        if ($island_id) {
            $queryBuilder = $queryBuilder->where('island_id', $island_id);
        }
        if ($user_id) {
            $queryBuilder = $queryBuilder->where('user_id', $user_id);
        }
        $expenses = $queryBuilder->get();

        return response()->json($expenses->toArray());
    }

    public function create(Request $request)
    {
        $expense = Expense::create([
            'user_id' => $request->user_id,
            'island_id' => $request->island_id,
            'amount' => $request->amount,
            'comment' => $request->comment
        ])->load('user', 'island');
        return response()->json($expense->toArray());
    }

    public function delete(Request $request)
    {
        return response()->json(['result' => Expense::destroy($request->expense_id)]);
    }
}
