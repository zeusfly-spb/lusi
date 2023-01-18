<?php

namespace App\Http\Controllers;

use App\Customer;
use App\Deal;
use App\DealAction;
use App\Stock\Product;
use App\Stock\Size;
use App\Stock\StockAction;
use App\Stock\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use App\Jobs\PerformSubscribe;

class DealController extends Controller
{
    private $products;
    private $types;
    private $sizes;
    private $actions;

    public function __construct()
    {
        $this->types = Type::all();
        $this->sizes = Size::all();
        $this->products = Product::all();
        $this->actions = DealAction::all();
    }

    public function index(Request $request)
    {
        $user_id = $request->user_id;
        $island_id = $request->island_id;
        $date = $request->date;
        $queryBuilder = Deal::with('user', 'customer', 'action')->whereDate('created_at', $date);
        if ($island_id) {
            $queryBuilder = $queryBuilder->where('island_id', $island_id);
        }
        if ($user_id) {
            $queryBuilder = $queryBuilder->where('user_id', $user_id);
        }
        return response()->json($queryBuilder->get()->toArray());
    }

    public function updatePrice(Request $request)
    {
        $deal = Deal::find($request->deal_id);
        $deal->update([$request->field => $request->amount]);
        $deal->load('user', 'customer', 'action');
        return response()->json($deal->toArray());
    }

    public function updateCustomerId(Request $request)
    {
        $deal = Deal::find($request->deal_id);
        $deal->update(['customer_id' => $request->customer_id]);
        $deal->load('user', 'customer', 'action');
        return response()->json($deal->toArray());
    }

    public function create(Request $request)
    {
        $newDealAction = $this->actions->where('id', $request->deal_action_id)->first()->type;
        $inputs = $request->all();

        if ($newDealAction === 'correction' || $newDealAction === 'prodDefect' || $newDealAction === 'islandDefect' || $newDealAction === 'alteration') {
            $inputs['income'] = 0;
            $inputs['expense'] = 0;
        }

        if ($newDealAction === 'return') {
            $inputs['expense'] = $inputs['income'];
            $inputs['income'] = 0;
        }

        $inputs = Arr::except($inputs, ['start_date', 'cert_start_date', 'cert_duration']);
        $deal = Deal::create($inputs);
        $deal->load('user', 'customer', 'action');

        if ($deal->action_type === 'certificate') {
            $deal->cert_start_date = $request->cert_start_date;
            $deal->cert_duration = $request->cert_duration;
        }

        if ($deal->action_type === 'subscribe') {
            $data = [
                'island_id' => $request->island_id,
                'user_id' => $request->user_id,
                'customer_id' => $request->customer_id,
                'subscription_id' => $request->subscription_id,
                'start_date' => $request->start_date
            ];
            PerformSubscribe::dispatch($data);
        }

        if ($deal->action_type !== 'correction' && $deal->action_type !== 'subscribe' && $deal->action_type !== 'service' && $deal->action_type !== 'return') {
            $product = Product::find($request->product_id);
            if ($product->description === 'good') {
                $comment = $deal->action->text . ' ' . $this->products->where('id', $request->product_id)->first()->name;
            } else {
                $comment = $deal->action->text . ' ' . $this->products->where('id', $request->product_id)->first()->name
                    . ' ' . $this->types->where('id', $request->type_id)->first()->name . ' ' . $this->sizes->where('id', $request->size_id)->first()->name;
            }
            $deal->stockAction()->create([
                'user_id' => $request->user_id,
                'type' => 'expense',
                'island_id' => $request->island_id,
                'product_id' => $request->product_id,
                'type_id' => $request->type_id,
                'size_id' => $request->size_id,
                'count' => 1,
                'comment' => $comment
            ]);
        }

        return response()->json($deal->toArray());
    }

    public function update(Request $request)
    {
        $deal = Deal::find($request->id);
        $deal->update([
            'income' => (int) $request->income,
            'expense' => (int) $request->expense,
            'is_cache' => (bool) $request->is_cache,
            'customer_id' => (int) $request->customer_id,
            'user_id' => (int) $request->user_id,
            'deal_action_id' => (int) $request->deal_action_id,
            'product_id' => (int) $request->product_id,
            'type_id' => (int) $request->type_id,
            'size_id' => (int) $request->size
        ]);
        $deal->load('user', 'customer', 'action');

        return response()->json($deal->toArray());
    }

    public function updateWithStock(Request $request)
    {
        $deal = Deal::find($request->id);
        $actionName = DealAction::find($request->deal_action_id)->text ?? '';
        $productName = Product::find($request->product_id)->name ?? '';
        $typeName = Type::find($request->type_id)->name ?? '';
        $sizeName = Size::find($request->size_id)->name ?? '';
        $deal->stockAction->update([
            'product_id' => $request->product_id,
            'type_id' => $request->type_id,
            'size_id' => $request->size_id,
            'comment' => $actionName . ' ' . $productName . ' ' . $typeName . ' ' . $sizeName
        ]);
        $deal->update([
            'product_id' => $request->product_id,
            'type_id' => $request->type_id,
            'size_id' => $request->size_id
        ]);
        $deal->load('user', 'customer', 'action', 'stockAction');
        return response()->json($deal->toArray());
    }

    public function delete(Request $request)
    {
        $deal = Deal::find($request->id);
        if ($deal->stockAction) {
            $deal->stockAction->delete();
        }
        return response()->json(['result' => Deal::destroy($request->id)]);
    }

    public function updateDealServiceId(Request $request)
    {
        $deal = Deal::find($request->deal_id);
        $deal->update(['service_id' => $request->service_id]);
        $deal->load('user', 'customer', 'action');
        return response()->json($deal->toArray());
    }
}
