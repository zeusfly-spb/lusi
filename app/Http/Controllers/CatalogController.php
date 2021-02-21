<?php

namespace App\Http\Controllers;

use App\NotifyTemplate;
use App\Service;
use App\Site;
use App\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class CatalogController extends Controller
{
    public function deleteSite(Request $request)
    {
        return response()->json(['result' => Site::destroy($request->id)]);
    }

    public function updateSite(Request $request)
    {
        $site = Site::find($request->id);
        $site->update($request->all());
        return response()->json($site->toArray());
    }

    public function addSite(Request $request)
    {
        $site = Site::create($request->all());
        return response($site->toArray());
    }

    public function setServiceHighlight(Request $request)
    {
        $service = Service::find($request->service_id);
        $service->setHiglight($request->color);
        return response($service->toArray());
    }

    public function deleteNotifyTemplate(Request $request)
    {
        $template = NotifyTemplate::find($request->id);
        return response()->json(['result ' => $template->delete()]);
    }

    public function updateNotifyTemplate(Request $request)
    {
        $template = NotifyTemplate::find($request->id);
        $template->update(Arr::except($request->all(), ['id']));
        return response()->json($template->toArray());
    }

    public function createNotifyTemplate(Request $request)
    {
        $template = NotifyTemplate::create($request->all());
        return response()->json($template->toArray());
    }

    public function getCatalogs()
    {
        $services = Service::all();
        $subscriptions = Subscription::with('service')->get();
        $notifyTemplates = NotifyTemplate::all();
        $sites = Site::all();
        return response()->json([
            'services' => $services->toArray(),
            'subscriptions' => $subscriptions->toArray(),
            'notify_templates' => $notifyTemplates->toArray(),
            'sites' => $sites->toArray()
        ]);
    }

    public function createService(Request $request)
    {
        $service = Service::create($request->all());
        Cache::forget('services');
        return response()->json($service->toArray());
    }

    public function updateService(Request $request)
    {
        $service = Service::find($request->id);
        $inputs = Arr::except($request->all(), ['id']);
        $service->update($inputs);
        return response()->json($service->toArray());
    }

    public function deleteService(Request $request)
    {
        return response()->json(['result' => Service::destroy($request->id)]);
    }

    public function createSubscription(Request $request)
    {
        $subscription = Subscription::create($request->all());
        $subscription->load('service');
        return response()->json($subscription->toArray());
    }

    public function deleteSubscription(Request $request)
    {
        $subscription = Subscription::find($request->subscription_id);
        return response()->json(['result' => $subscription->delete()]);
    }

    public function updateSubscription(Request $request)
    {
        $subscription = Subscription::find($request->id);
        $inputs = Arr::except($request->all(), ['id', 'service']);
        $subscription->update($inputs);
        $subscription->load('service');
        return response()->json($subscription->toArray());
    }
}
