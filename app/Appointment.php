<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use phpDocumentor\Reflection\Types\Boolean;

class Appointment extends Model
{
    protected $guarded = [];
    protected $appends = ['status', 'last_comment'];
    protected $casts = [
        'comments' => 'array'
    ];

    protected $statusList = [
        0 => 'cancelled',
        1 => 'active',
        2 => 'postponed',
        3 => 'moderate',
        4 => 'completed'
    ];

    public function setStatus(string $status)
    {
        $id = array_search($status, $this->statusList);
        return $this->update(['status_id' => $id]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function performer()
    {
        return $this->belongsTo(User::class, 'performer_id', 'id');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function island()
    {
        return $this->belongsTo(Island::class);
    }

    public function getStatusAttribute()
    {
        $key = $this->status_id ?? 1;
        return $this->statusList[$key];
    }

    public function addComment(string $text, int $user_id = null)
    {
        $newComment = (object) [
            'id' => Str::random(25),
            'user_id' => $user_id ?? 0,
            'text' => $text,
            'created_at' => now()->toDateTimeString()
        ];
        $comments = $this->comments ?? [];
        array_push($comments, $newComment);
        return $this->update(['comments' => $comments]);
    }

    public function deleteComment($commentId)
    {
        $comments = $this->comments;
        $result = [];
        foreach ($comments as $comment) {
            if ($comment['id'] !== $commentId) {
                $result[] = $comment;
            }
        }
        $this->update(['comments' => $result]);
    }

    public function getLastCommentAttribute()
    {
        if (!$this->comments) {
            return null;
        }
        return $this->comments[count($this->comments) - 1]['text'] ?? null;
    }

    public function setDealId($id)
    {
        $this->update(['deal_id' => $id]);
    }

}
