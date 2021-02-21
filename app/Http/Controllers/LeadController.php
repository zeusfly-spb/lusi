<?php

namespace App\Http\Controllers;

use App\Island;
use App\Lead;
use App\LeadComment;
use App\Postpone;
use App\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class LeadController extends Controller
{
    public function leadComments(Request $request)
    {
        return response()->json(LeadComment::whereIn('id', $request->ids)->get()->toArray());
    }

    public function save(Request $request)
    {
        $options = $request->all();
        $modified = preg_replace("~\D~", "", $options['phone']);
        $options['phone'] = substr($modified, -10);
        $lead = Lead::create($options);
        if ($request->comment) {
            $lead->addComment($request->comment, null);
        }
        $lead->load('comments', 'user', 'postpones');
        return response()->json($lead->toArray());
    }

    public function index(Request $request)
    {
        $builder = Lead::with('event');
        if (count($request->accepted_sites)) {
            $builder = $builder->whereIn('site', $request->accepted_sites);
        }

        if ($request->name) {
            $builder = $builder->where('name', 'LIKE', $request->name . '%')
            ->orWhere('phone', 'LIKE', '%' . $request->name);
            $leads = array_reverse($builder->get()->toArray());
        } else if ($request->per_page > 0) {
            $paginator = $builder
                ->orderByDesc('id')
                ->whereIn('status', [$request->status, 'wait'])
                ->paginate($request->per_page);

            $leads = array_reverse($paginator->items());

            $paginatorData = [
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'currentPage' => $paginator->currentPage()
            ];
        } else {
            $builder = $builder->orderByDesc('id')->whereIn('status', [$request->status, 'wait']);
            $leads = array_reverse($builder->get()->toArray());
        }

        if (count($request->accepted_sites)) {
            $counts = [
                'all' => Lead::whereIn('site', $request->accepted_sites)->where('status', '<>', 'done')->count(),
                'wait' => Lead::whereIn('site', $request->accepted_sites)->where('status', 'wait')->count(),
                'process' => Lead::whereIn('site', $request->accepted_sites)->where('status', 'process')->count(),
                'done' => Lead::whereIn('site', $request->accepted_sites)->where('status', 'done')->count(),
                'moderate' => Lead::whereIn('site', $request->accepted_sites)->where('status', 'moderate')->count()
            ];
        } else {
            $counts = [
                'all' => Lead::where('status', '<>', 'done')->count(),
                'wait' => Lead::where('status', 'wait')->count(),
                'process' => Lead::where('status', 'process')->count(),
                'done' => Lead::where('status', 'done')->count(),
                'moderate' => Lead::where('status', 'moderate')->count()
            ];
        }



        $callToday = Cache::rememberForever('call_today_' . today()->toDateString(), function () {
           $call_leads = Lead::with('event')->where('status', 'process')->get();
           $call_leads = $call_leads->filter(function ($item) {
                return $item->last_postpone && explode(' ', $item->last_postpone->date)[0] === today()->toDateString();
            });
           return $call_leads->toArray();
        });

        return response()->json([
            'leads' => $leads,
            'paginator_data' => $paginatorData ?? null,
            'counts' => $counts,
            'call_today' => $callToday
        ]);
    }

    public function delete(Request $request)
    {
        $status = Lead::find($request->lead_id)->status;
        return response()->json([
            'result' => Lead::destroy($request->lead_id),
            'id' => $request->lead_id,
            'status' => $status
        ]);
    }

    public function updateStatus(Request $request)
    {
        $lead = Lead::find($request->lead_id);
        $lead->update(['status' => $request->status]);
        $lead->addComment($request->comment, $request->user_id);
        $lead->load('comments', 'user', 'postpones');
        return response()->json($lead->toArray());
    }

    public function addComment(Request $request)
    {
        $lead = Lead::find($request->lead_id);
        $lead->addComment($request->text, $request->user_id);
        $lead->load('comments', 'user', 'postpones', 'event');
        return response()->json($lead->toArray());
    }

    public function deleteComment(Request $request)
    {
        $comment = LeadComment::find($request->comment_id);
        $lead = Lead::find($comment->lead_id);
        $comment->delete();
        $lead->load('comments', 'user', 'postpones');
        return response()->json($lead->toArray());
    }

    public function missed(Request $request)
    {
        $lead = Lead::create(['phone' => substr($request->phone, -10), 'comment' => 'Пропущенный звонок']);
        $lead->addComment('Пропущенный звонок', 0);
        return response()->json($lead->toArray());
    }

    public function addLead(Request $request)
    {
        $lead = Lead::create([
            'phone' => $request->phone,
            'name' => $request->name,
            'status' => 'process',
            'user_id' => $request->user_id,
            'site' => $request->site
        ]);
        if ($request->comment) {
            $lead->addComment($request->comment, $request->user_id);
        }
        $lead->load('user');
        return response()->json($lead->toArray());
    }

    public function addPostpone(Request $request)
    {
        $lead = Lead::find($request->lead_id);
        $timestamp = $request->date . ' ' . $request->time;
        $lead->addPostpone( $timestamp, $request->user_id);
        $lead->load('comments', 'user', 'postpones');
        return response()->json($lead->toArray());
    }

    public function deletePostpone(Request $request)
    {
        $postpone = Postpone::find($request->postpone_id);
        $lead = Lead::find($postpone->lead_id);
        $postpone->delete();
        $lead->load('postpones');
        return response()->json($lead->toArray());
    }

    public function addCall(Request $request)
    {
        $lead = Lead::find($request->lead_id);
        $lead->addCall((object)['timestamp' =>  now()->toDateTimeString(), 'user_id' => $request->user_id]);
        $lead->load('postpones');
        return response()->json($lead->toArray());
    }
}
