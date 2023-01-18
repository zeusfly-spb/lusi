<?php

namespace App\Http\Controllers;

use App\Access;
use App\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;


class AccessController extends Controller
{
    public function create(Request $request)
    {
        $device_id = (string) Str::uuid();
        $access = Access::create([
            'user_id' => $request->user_id,
            'device_id' => $device_id,
            'status' => 'requested',
            'comment' => $request->comment,
            'user_info' => $request->header('User-Agent')
        ]);
        return response()->json($access->toArray());
    }

    public function getAccessStatus(Request $request)
    {
        $access = Access::with('island')->where('device_id', $request->device_id)->first();
        if (!$access) {
            return response()->json(['access' => (object)['status' => 'none']]);
        }
        $setting = Setting::find(1);
        if ($setting) {
            return response()->json(['access' => $access->toArray(), 'setting' => $setting->toArray()]);
        }
        return response()->json(['access' => $access->toArray()]);
    }

    public function getAllAccesses()
    {
        return response()->json(Access::with('island')->get()->toArray());
    }

    public function setStatus(Request $request)
    {
        $access = Access::with('island')->find($request->access_id);
        $access->update(['status' => $request->status, 'island_id' => $request->island_id]);
        return response()->json(['access' => $access->toArray()]);
    }

    public function delete(Request $request)
    {
        return response()->json(['result' => Access::destroy($request->access_id)]);
    }

    public function updateAccessIsland(Request $request)
    {
        $access = Access::find($request->access_id);
        $access->update(['island_id' => $request->island_id]);
        $access->load('island');
        return response()->json($access->toArray());
    }
}
