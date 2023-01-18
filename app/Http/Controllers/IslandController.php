<?php

namespace App\Http\Controllers;

use App\Island;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class IslandController extends Controller
{
    public function setOption(Request $request)
    {
        $island = Island::with('users')->find($request->island_id);
        $island->setOption($request->key, $request->value);
        return response()->json($island->toArray());
    }

    public function updateChiefs(Request $request)
    {
        $island = Island::with('users')->find($request->island_id);
        $island->update(['chiefs' => $request->chiefs]);
        return response()->json($island->toArray());
    }

    public function create(Request $request)
    {
        $island = Island::create([
            'name' => $request->name,
            'description' => $request->description
        ]);
        $island->load('users');
        return response()->json($island->toArray());
    }

    public function update(Request $request)
    {
        function mode (int $old, int $new) {
            if ($old == 0 && $new == 1) {
                return 'first';
            }
            if ($old > $new) {
                return 'reduced';
            }
            return null;
        }
        $island = Island::find($request->id);
        $oldCabinetsCount = $island->cabinets->count();
        $inputs = Arr::except($request->all(), ['users', 'chief', 'services', 'cabinets', 'is_call_center']);
        $island->update($inputs);
        $newCabinetsCount = $island->cabinets->count();
        $mode = mode($oldCabinetsCount, $newCabinetsCount);
        switch ($mode) {
            case 'first':
                $post = $island->firstCabinetCreated();
                break;
            case 'reduced':
                $post = $island->cabinetsReduced();
                break;
            default:
                $post = null;
                break;
        }
        $island->load('users');
        if ($post) {
            $island->post = $post;
        }
        return response()->json($island->toArray());
    }

    public function getAll()
    {
        return response()->json(Island::with('users')->get()->toArray());
    }

    public function delete(Request $request)
    {
        return response()->json(['result' => Island::destroy($request->island_id)]);
    }

    public function getStartBalance(Request $request)
    {
        $date = $request->date;
        $island_id = $request->island_id;
        if ($island_id) {
            $island = Island::find($island_id);
            return response()->json(['amount' => $island->startBalance($date)]);
        } else {
            $islands = Island::all();
            $amount =  $islands->reduce(function ($carry, $island) use($date) {
                return $carry + $island->startBalance($date);
            }, 0);
            return response()->json(['amount' => $amount]);
        }
    }

    public function updateChiefId(Request $request)
    {
        $island = Island::with('users')->find($request->island_id);
        if ($island->chiefs) {
            $chiefs = collect($island->chiefs);
            $exists = $chiefs->where('date', $request->date)->first();
            if ($exists) {
                $chiefs = $chiefs->reject(function ($value) use ($request) {
                    return $value['date'] == $request->date;
                });
            }
            $chiefs->push((object) ['date' => $request->date, 'user_id' => $request->chief_id]) ;
        } else {
            $chiefs = collect([(object) ['date' => $request->date, 'user_id' => $request->chief_id]]);
        }
        $island->update(['chiefs' => $chiefs->all()]);
        return response()->json($island->toArray());
    }

    public function updateVpbxExtension(Request $request)
    {
        $island = Island::find($request->island_id);
        $island->update(['vpbx_extension' => $request->vpbx_extension]);
        $island->load('users');
        return response()->json($island->toArray());
    }

    public function updateUserIslands(Request $request)
    {
        $user = User::find($request->user_id);
        $user->islands()->sync($request->island_ids);
        $user->load('documentPack', 'islands');
        $islands = Island::with('users')->find($request->island_ids);
        return response()->json(['user' => $user->toArray(), 'islands' => $islands->toArray()]);
    }

    public function updateIslandUsers(Request $request)
    {
        $island = Island::find($request->island_id);
        $island->users()->sync($request->user_ids);
        $island->load('users');
        $users = User::with('documentPack', 'islands')->find($request->user_ids);
        return response()->json(['island' => $island->toArray(), 'users' => $users->toArray()]);
    }

    public function firstCabinet(Request $request)
    {
        $island = Island::find($request->island_id);
        $result = $island->firstCabinetCreated();
        return response()->json($result);
    }

    public function cabinetsReduced(Request $request)
    {
        $island = Island::find($request->island_id);
        $result = $island->cabinetsReduced();
        return response()->json($result);
    }
}
