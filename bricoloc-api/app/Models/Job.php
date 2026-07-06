<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Job extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'jobs_table';

    protected $fillable = [
        'client_id',
        'category_id',
        'title',
        'description',
        'budget_min',
        'budget_max',
        'budget_type',
        'city',
        'neighborhood',
        'latitude',
        'longitude',
        'status',
        'hired_bricoleur_id',
        'scheduled_date',
        'scheduled_time',
        'completed_at',
        'cancellation_reason',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function category()
    {
        return $this->belongsTo(JobCategory::class);
    }

    public function hiredBricoleur()
    {
        return $this->belongsTo(User::class, 'hired_bricoleur_id');
    }

    public function photos()
    {
        return $this->hasMany(JobPhoto::class);
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}



















