<?php

namespace App\Http\Controllers;

use App\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;

class GroupController extends Controller
{
    public function delete(Request $request)
    {
        return response()->json(['result' => Group::destroy($request->id)]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);
        }
        $group = Group::find($request->id);
        $group->update($request->all());
        return response()->json($group->toArray());
    }

    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);
        }
        $input = Arr::except($request->all(), ['users']);
        $group = Group::create($request->all());
        return response()->json($group->toArray());
    }

    public function all()
    {
        return response()->json(Group::with('users')->get()->toArray()) ;
    }
}
