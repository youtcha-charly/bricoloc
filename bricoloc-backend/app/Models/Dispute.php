<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'raised_by',
        'reason',
        'status',
        'resolution',
        'resolved_by',
        'resolved_at',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function raisedBy()
    {
        return $this->belongsTo(User::class, 'raised_by');
    }

    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}