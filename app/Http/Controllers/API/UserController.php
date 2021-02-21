<?php

namespace App\Http\Controllers\API;

use http\Env\Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Arr;
use Webpatser\Uuid\Uuid;


class UserController extends Controller
{
    public $successStatus = 200;


    /**
     * login api
     *
     * @return \Illuminate\Http\Response
     */
    public function login(){
        $testUser = User::getUserByNameAndPassword(request('name'), request('password'));
        /**
        if(Auth::attempt(['name' => request('name'), 'password' => request('password')])){
            $user = Auth::user();
            $success['token'] =  $user->createToken('MyApp')-> accessToken;
            return response()->json(['success' => $success], $this-> successStatus);
        }
        **/
        if ($testUser) {
            $user = $testUser;
            $success['token'] =  $user->createToken('MyApp')-> accessToken;
            return response()->json(['success' => $success], $this-> successStatus);
        }
        else{
            return response()->json(['error'=>'Unauthorised'], 401);
        }
    }

    /**
     * Register api
     *
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'password' => 'required',
            'c_password' => 'required|same:password',
        ]);
        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);
        }

        $users = User::where('name', $request->name)->get();
        foreach ($users as $user) {
            if (Hash::check($request->password, $user->password)) {
                return response()->json(['error' => 'Пользователь с такими данными уже зарегистрирован  ']);
            }
        }

        $input = Arr::except($request->all(), ['c_password']);

        if ($request->hasFile('avatar')) {
            $fileName = (string) Uuid::generate(4);
            $request->file('avatar')->storeAs(
                'public/avatars', $fileName
            );
            $input['avatar'] = '/storage/avatars/' . $fileName;
        }

        $input['password'] = bcrypt($input['password']);
        $user = User::create($input);
        $user->load('documentPack', 'islands');
        $success['token'] =  $user->createToken('MyApp')-> accessToken;
        $success['name'] =  $user->name;
        $success['user'] = $user;
        return response()->json(['success'=>$success], $this-> successStatus);
    }

    /**
     * details api
     *
     * @return \Illuminate\Http\Response
     */
    public function details()
    {
        $user = Auth::user();
        $user->load('islands', 'group');
        if ($user->group && $user->group->purpose === 'logistics') {
            $user->logist = true;
        }
        return response()->json(['success' => $user], $this-> successStatus);
    }

    public function getUsers()
    {
        return response()->json(User::with('documentPack', 'islands')->get()->toArray());
    }

    public function saveUser(Request $request)
    {
        $user = User::find($request->id);
        $input = Arr::except($request->all(), ['group', 'id','password', 'c_password', 'full_name', 'document_pack', 'islands', 'rates', 'controlled_islands', 'is_admin']);

        if ($request->password && $request->c_password && $request->password === $request->c_password) {
            $users = User::where('name', $request->name)->get();
            foreach ($users as $check_user) {
                if (Hash::check($request->password, $check_user->password)) {
                    return response()->json(['error' => 'Пользователь с такими данными уже зарегистрирован  ']);
                }
            }
            $user->update(['password' => bcrypt($request->password)]);
        }

        if ($request->hasFile('avatar')) {
            $fileName = (string) Uuid::generate(4);
            $request->file('avatar')->storeAs(
                'public/avatars', $fileName
            );
            $input['avatar'] = '/storage/avatars/' . $fileName;
        }

        $user->update($input);
        $user->load('documentPack', 'islands');
        return $user->toArray();
    }

    public function deleteUser(Request $request)
    {
        return response()->json(['result' => User::destroy($request->id)]);
    }

    public function startDay(Request $request)
    {
        $user = User::find($request->user_id);
        $currentWorkDay = $user->workdays()->whereDate('date', now()->toDateString())->first();

        if ($currentWorkDay) {
            $currentWorkDay->load('user');
            return response()->json($currentWorkDay->toArray());
        }

        $workday = $user->startDay($request->island_id);
        return response()->json($workday->toArray());
    }

    public function finishDay(Request $request)
    {
        $user = User::find($request->user_id);
        $currentWorkDay = $user->workdays()->whereDate('date', now()->toDateString())->first();
//        $currentWorkDay = $user->finishDay($request->all());
//        return response()->json($currentWorkDay->toArray());
        $currentWorkDay->update([
            'time_finish' => now()->toTimeString(),
            'working_hours' => $request->working_hours
        ]);

//        return response()->json($currentWorkDay->closeDay()->toArray());
        $currentWorkDay->load('user', 'timeBreaks');
        return response()->json($currentWorkDay->toArray());
    }

    public function resumeDay(Request $request)
    {
        $user = User::find($request->user_id);
        $currentWorkDay = $user->resumeDay();
        return response()->json($currentWorkDay->toArray());
    }

    public function startDinner(Request $request)
    {
        $user = User::find($request->user_id);
        $currentWorkDay = $user->startDinner();
        return response()->json($currentWorkDay->toArray());
    }

    public function finishDinner(Request $request)
    {
        $user = User::find($request->user_id);
        $currentWorkDay = $user->finishDinner();
        return response()->json($currentWorkDay->toArray());
    }

    public function fireUser(Request $request)
    {
        $user = User::find($request->user_id);
        $user->update(['fired_at' => $request->date]);
        $user->load('documentPack', 'islands');
        return response()->json($user->toArray());
    }

    public function restoreUser(Request $request)
    {
        $user = User::find($request->user_id);
        $user->update(['fired_at' => null]);
        $user->load('documentPack', 'islands');
        return response()->json($user->toArray());
    }

    public function updateDate(Request $request)
    {
        $user = User::find($request->user_id);
        $user->update([$request->field => $request->date]);
        $user->load('documentPack', 'islands');
        return response()->json($user->toArray());
    }

    public function updateRates(Request $request)
    {
        $user = User::with('deals', 'workdays', 'controlledIslands', 'prizes', 'forfeits', 'sicks', 'prepays', 'vacations')->find($request->user_id);
        $user->update(['rates' => $request->rates]);
        return response()->json($user->toArray());
    }
}
