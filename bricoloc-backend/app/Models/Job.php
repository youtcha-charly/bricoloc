<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Job extends Model
{
    use HasFactory;


    protected $table = 'job_postings';

    protected $fillable = [
        'client_id',
        'category_id',
        'title',
        'description',
        'photo_url',
        'budget_min',
        'budget_max',
        'budget_type',
        'city',
        'neighborhood',
        'latitude',
        'longitude',
        'status',
        'hired_bricoleur_id',
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

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function chat()
    {
        return $this->hasOne(Chat::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}