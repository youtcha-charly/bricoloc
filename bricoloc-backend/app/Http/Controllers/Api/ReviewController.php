<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Job;
use App\Models\Bid;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Check if a review exists for a job
     */
    public function check(Request $request, $jobId)
    {
        $review = Review::where('job_id', $jobId)
            ->where('reviewer_id', $request->user()->id)
            ->first();

        return response()->json([
            'success' => true,
            'reviewed' => (bool) $review,
            'review' => $review,
        ]);
    }

    /**
     * Store a new review
     */
    public function store(Request $request, $jobId)
    {
        $user = $request->user();

        $job = Job::with(['bids.bricoleur'])->findOrFail($jobId);

        // Only the client who owns the job can review
        if ((int) $job->client_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the job owner can leave a review'
            ], 403);
        }

        // Job must be completed
        if ($job->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'You can only review after the job is completed'
            ], 400);
        }

        // Check if already reviewed
        $existing = Review::where('job_id', $jobId)
            ->where('reviewer_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this job'
            ], 400);
        }

        // Find the bricoleur (hired or accepted bid)
        $bricoleurId = $job->hired_bricoleur_id;
        if (!$bricoleurId) {
            $acceptedBid = Bid::where('job_id', $jobId)
                ->where('status', 'accepted')
                ->first();
            if ($acceptedBid) {
                $bricoleurId = $acceptedBid->bricoleur_id;
            }
        }

        if (!$bricoleurId) {
            return response()->json([
                'success' => false,
                'message' => 'No bricoleur found for this job'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $review = Review::create([
            'job_id' => $jobId,
            'reviewer_id' => $user->id,
            'reviewed_id' => $bricoleurId,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_public' => true,
        ]);

        // Update bricoleur profile average rating
        $avgRating = Review::where('reviewed_id', $bricoleurId)->avg('rating');
        $totalReviews = Review::where('reviewed_id', $bricoleurId)->count();
        $profile = \App\Models\BricoleurProfile::where('user_id', $bricoleurId)->first();
        if ($profile) {
            $profile->average_rating = round($avgRating, 1);
            $profile->total_reviews = $totalReviews;
            $profile->save();
        }

        // Notify the bricoleur
        \App\Models\Notification::create([
            'user_id' => $bricoleurId,
            'title' => 'New Review',
            'body' => $user->name . ' rated you ' . $request->rating . '/5 stars on "' . $job->title . '"',
            'type' => 'new_review',
            'data' => json_encode([
                'job_id' => $job->id,
                'review_id' => $review->id,
                'rating' => $request->rating,
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully',
            'review' => $review,
        ], 201);
    }
}
