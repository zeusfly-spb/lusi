<?php

namespace App\Jobs;

use App\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;


class RefreshLeadsList implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $model;
    protected $operation;
    protected $lead_id;
    protected $class;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {

    }

    protected function commonUpdate ($data) {
        $leadId = $this->lead_id;
        $newItem = Lead::with('comments', 'user', 'postpones')->find($leadId)->toArray();
        $data = $data->map(function ($item) use ($leadId, $newItem) {
            return $item->id == $leadId ? $newItem : $item;
        });
        return $data;
    }

    protected function performCreate ($data) {
        $targetLead = $data->where('id', $this->lead_id)->first();
        switch ($this->class) {
            case 'App\Lead':
                $newItem = $this->model->load('user')->toArray();
                $data = $data->push($newItem);
                break;
            case 'App\LeadComment':
                $targetLead->comments = $targetLead->comments->push($this->model->toArray());
                $data = $data->map(function ($item) use ($targetLead) {
                    return $item->id == $targetLead->id ? $targetLead : $item;
                });
                break;
            case 'App\Postpone':
                $targetLead->postpones = $targetLead->postpones->push($this->model->toArray());
                $data = $data->map(function ($item) use ($targetLead) {
                    return $item->id == $targetLead->id ? $targetLead : $item;
                });
                break;
        }
        return $data;
    }

    protected function updateLeadInfo () {
        $leadId = $this->lead_id;
        $cacheData = collect(Cache::get('leads_list'));
        switch ($this->operation) {
            case 'update':
                $cacheData = $this->commonUpdate($cacheData);
                break;
            case 'create':
                $this->performCreate($cacheData);
                break;
            case 'delete':
                if (get_class($this->model) == 'App\Lead') {
                    $cacheData = $cacheData->filter(function ($item) use ($leadId) {
                        return $item->id !== $leadId;
                    });
                } else {
                    $cacheData = $this->commonUpdate($cacheData);
                }
                break;
        }
        Cache::put('leads_list', $cacheData->all());
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $leads = Lead::with('comments', 'user', 'postpones')
            ->where('status', '<>', 'done')
            ->get()->reverse()->values()->toArray();
        Cache::put('leads_list', $leads);
//        $this->updateLeadInfo();
    }
}
