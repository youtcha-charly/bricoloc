<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'reviewer_id',
        'reviewed_id',
        'rating',
        'comment',
        'is_public',
    ];
}