<?php

namespace App\Jobs;

use App\Appointment;
use App\Island;
use App\NotifyTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class EventCreatedNotify implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $event;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Appointment $event)
    {
        $this->event = $event;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $island = Island::find($this->event->island_id);
        if (!$island->create_notify_template_id) {
            return;
        }
        $template = NotifyTemplate::find($island->create_notify_template_id);
        if (!$template) {
            return;
        }
        sendSms([
            'extension' => 951,
            'island_id' => $this->event->island_id,
            'user_id' => 0,
            'phone' => '+7' . $this->event->client_phone,
            'text' => substituteEventText($template->text, $this->event)
        ]);
    }
}
