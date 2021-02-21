<?php

use App\Appointment;
use App\Service;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use GuzzleHttp\Client;
use App\Jobs\CreateSmsReport;

function rusDate (string $dateString)
{
    $dateArr = explode('-', explode(' ', $dateString)[0]);
    return $dateArr[2] . '.' . $dateArr[1];
   // $date = Carbon::create($dateString);
   // $day = (int) $dateArr[2];
   // return "$day {$date->locale('ru')->shortMonthName}. $dateArr[0]г.";
}

function substituteEventText (string $text, Appointment $event)
{
    if (!$event) {
        return $text;
    }
    $timeArr = explode(':', explode(' ', $event->date)[1]);
    $time = "{$timeArr[0]}:{$timeArr[1]}";
    $date = explode(' ', $event->date)[0];
    $result = str_replace('||TIME||', $time, $text);
    $result = str_replace('||DATE||', rusDate($date), $result);
    return $result;
}

/**
 * @param array $data
 * ['extension', 'phone', 'text', 'user_id', 'island_id']
 * @return int
 * @throws \GuzzleHttp\Exception\GuzzleException
 */

function sendSms (array $data)
{
    $client = new Client();
    $res = $client->request('POST', 'https://crmkin.ru/tel/api/vpbx/sms/send', [
        'form_params' => [
            'base_type' => 'isi',
            'user_id' => $data['user_id'] ?? 0,
            'extension' => $data['extension'],
            'phone' => $data['phone'],
            'text' => $data['text']
        ]
    ]);
    $status = $res->getStatusCode();
    if ($status == 200) {
        CreateSmsReport::dispatch([
            'number' => $data['phone'],
            'text' => $data['text'],
            'user_id' => $data['user_id'] ?? 0,
            'island_id' => $data['island_id'] ?? 0
        ]);
    }
    return $status;
}

function clearPostponesCache ()
{
    Cache::forget('call_today_' . today()->toDateString());
}

function cacheModel (Model $model, string $prefix = '')
{
    foreach ($model->getAttributes() as $key => $value) {
        Redis::command('HSET', [$prefix ?? class_basename($model), $key, $value]);
    }
    return $model;
}

function cacheRelation (Model $model, string $relation)
{
    if (getRelType($model, $relation) == 'Collection') {
        foreach ($model->$relation as $item) {
            cacheModel($item, class_basename($model) . "$model->id:$relation:$item->id");
        }
    } else {
        cacheModel($model->$relation, class_basename($model) . "$model->id:$relation:{$model->$relation}->id");
    }
}

function pullOut (string $model, $id, array $options = [])
{
        $result = Redis::command('HGETALL', "$model:$id");
        return $result;
}

function getRelType (Model $model, string $relation)
{
    $item = $model->$relation;
    return class_basename($item);
}
