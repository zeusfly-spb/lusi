<?php

namespace App\Http\Controllers;

use App\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function updateSetting(Request $request)
    {
        $setting = Setting::find(1);
        if ($setting) {
            $setting->update(['data' => $request->data]);
        } else {
            $setting = Setting::create(['data' => $request->data]);
        }
        return response()->json($setting->toArray());
    }
}
