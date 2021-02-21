<?php

namespace App\Http\Controllers;

use App\SmsReport;
use Illuminate\Http\Request;
use App\Jobs\CreateSmsReport;

class SmsReportController extends Controller
{
    public function index(Request $request)
    {
        $queryBuilder = SmsReport::whereDate('created_at', $request->date);
        if ($request->island_id) {
            $queryBuilder = $queryBuilder->where('island_id', $request->island_id);
        }
        return response()->json($queryBuilder->get()->toArray());
    }

    public function create(Request $request)
    {
        CreateSmsReport::dispatch($request->all());
    }
}
