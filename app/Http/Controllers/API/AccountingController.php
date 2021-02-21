<?php

namespace App\Http\Controllers\API;

use App\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AccountingController extends Controller
{
    public function getAccountingDate()
    {
        $setting = Setting::find(1);
        if ($setting) {
            return response()->json(['date' => now()->toDateString(), 'setting' => $setting->toArray()]);
        }
        return response()->json(['date' => now()->toDateString()]);
    }

}
