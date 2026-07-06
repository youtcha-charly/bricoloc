<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BricoleurProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'skills',
        'years_of_experience',
        'id_card_photo_path',
        'selfie_with_id_path',
        'verification_status',
        'available_for_hire',
        'average_rating',
        'total_jobs_completed',
        'total_reviews',
    ];

    protected $casts = [
        'skills' => 'array',
        'available_for_hire' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}






















































































































































