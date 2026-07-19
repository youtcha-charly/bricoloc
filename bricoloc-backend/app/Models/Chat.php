<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = [
        'job_id',
        'client_id',
        'bricoleur_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function bricoleur()
    {
        return $this->belongsTo(User::class, 'bricoleur_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}