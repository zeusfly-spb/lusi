<?php

namespace App\Http\Controllers;

use App\Customer;
use App\Deal;
use App\Phone;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class CustomerController extends Controller
{

    public function extend(Request $request)
    {
        $customer = Customer::with('deals', 'phones')
            ->find($request->customer_id);
        return response()->json($customer);
    }

    public function index(Request $request)
    {
        $customers = Customer::with('phones', 'deals')
            ->whereDate('created_at', $request->date)
            ->get();
        return response()->json($customers->toArray());
    }

    public function create(Request $request)
    {
        $input = $request->all();
        $input = Arr::except($input, ['phone', 'phones']);
        $phone = $request->phone;

        $exists = Customer::whereHas('phones', function($query) use($phone) {
                $query->where('number', $phone);
            })
            ->first();
        if ($exists) {
            return response()->json(['exists' => true]);
        }
        $customer = Customer::create($input);
        if ($request->phone) {
            $customer->phones()->create(['number' => $request->phone]);
        }
        $customer->load('phones', 'deals');
        return response()->json($customer->toArray());
    }

    public function update(Request $request)
    {
        $customer = Customer::find($request->id);
        $customer->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'patronymic' => $request->patronymic,
            'address' => $request->address,
            'birth_date' => $request->birth_date,
            'email' => $request->email
        ]);
        $customer->load('phones', 'deals');
        return response()->json($customer->toArray());
    }

    public function deletePhone(Request $request)
    {
        Phone::destroy($request->phone_id);
        return response()->json(Customer::with('phones', 'deals')->find($request->customer_id)->toArray());
    }

    public function addPhone(Request $request)
    {
        $customer = Customer::find($request->customer_id);
        $customer->phones()->create(['number' => $request->number]);
        $customer->load('phones', 'deals');
        return response()->json($customer->toArray());
    }

    public function searchByText(Request $request)
    {
        $text = $request->text;
        $queryBuilder = Customer::query();
        $queryBuilder = $queryBuilder
            ->where('last_name', 'LIKE',$text . '%')
//            ->orWhere('last_name', 'LIKE', '%' . $text . '%')
//            ->orWhere('patronymic', 'LIKE', '%' . $text . '%')
            ->orWhereHas('phones', function($query) use($text) {
                $query->where('number', 'LIKE', '%' . $text . '%');
            });
        return response()->json($queryBuilder->with('phones', 'deals')->get()->toArray());
    }

    public function delete(Request $request)
    {
        Customer::destroy($request->customer_id);
    }
}
