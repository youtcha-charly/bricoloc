<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'raised_by_id',
        'reason',
        'status',
        'resolution',
        'resolved_at',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function raisedBy()
    {
        return $this->belongsTo(User::class, 'raised_by_id');
    }
}