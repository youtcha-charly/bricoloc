<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bid extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'bricoleur_id',
        'amount',
        'message',
        'estimated_days',
        'status',
        'accepted_at',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function bricoleur()
    {
        return $this->belongsTo(User::class, 'bricoleur_id');
    }
}






























































































































































































































