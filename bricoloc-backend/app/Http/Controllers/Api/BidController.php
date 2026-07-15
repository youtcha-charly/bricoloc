<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bid;
use App\Models\Job;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BidController extends Controller
{
    /**
     * Submit a bid on a job
     */
    public function store(Request $request, $jobId)
    {
        $job = Job::findOrFail($jobId);

        // Check if job is still open
        if ($job->status !== 'open') {
            return response()->json([
                'success' => false,
                'message' => 'This job is no longer accepting bids'
            ], 400);
        }

        // Validate
        $validator = Validator::make($request->all(), [
            'amount' => 'required|integer|min:1000',
            'message' => 'required|string|min:10|max:500',
            'estimated_days' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if bricoleur already bid on this job
        $existingBid = Bid::where('job_id', $jobId)
            ->where('bricoleur_id', $request->user()->id)
            ->first();

        if ($existingBid) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a bid on this job'
            ], 400);
        }

        // Create the bid
        $bid = Bid::create([
            'job_id' => $jobId,
            'bricoleur_id' => $request->user()->id,
            'amount' => $request->amount,
            'message' => $request->message,
            'estimated_days' => $request->estimated_days ?? 1,
            'status' => 'pending',
        ]);

        // Notify the client
        Notification::create([
            'user_id' => $job->client_id,
            'title' => 'New Bid Received',
            'body' => $request->user()->name . ' submitted a bid of ' . number_format($request->amount) . ' FCFA on: ' . $job->title,
            'type' => 'new_bid',
            'data' => json_encode([
                'job_id' => $job->id,
                'bid_id' => $bid->id,
                'bricoleur_name' => $request->user()->name,
                'amount' => $request->amount,
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bid submitted successfully. The client has been notified.',
            'data' => $bid,
        ], 201);
    }

    /**
     * Get current bricoleur's bids
     */
    public function myBids(Request $request)
    {
        $bids = Bid::with('job')
            ->where('bricoleur_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bids,
        ]);
    }

    /**
     * Accept a bid
     */
    public function accept(Request $request, $bidId)
    {
        $bid = Bid::findOrFail($bidId);
        $job = Job::findOrFail($bid->job_id);

        // Check if the authenticated user is the job owner
        if ($job->client_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Accept the bid
        $bid->status = 'accepted';
        $bid->accepted_at = now();
        $bid->save();

        // Reject all other bids on this job
        Bid::where('job_id', $job->id)
            ->where('id', '!=', $bidId)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);

        // Update job status
        $job->status = 'assigned';
        $job->hired_bricoleur_id = $bid->bricoleur_id;
        $job->save();

        // Notify the accepted bricoleur
        Notification::create([
            'user_id' => $bid->bricoleur_id,
            'title' => 'Bid Accepted!',
            'body' => 'Your bid of ' . number_format($bid->amount) . ' FCFA on "' . $job->title . '" has been accepted!',
            'type' => 'bid_accepted',
            'data' => json_encode(['job_id' => $job->id, 'bid_id' => $bid->id]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bid accepted. The bricoleur has been notified.',
        ]);
    }

    /**
     * Reject a bid
     */
    public function reject(Request $request, $bidId)
    {
        $bid = Bid::findOrFail($bidId);
        $job = Job::findOrFail($bid->job_id);

        if ($job->client_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $bid->status = 'rejected';
        $bid->save();

        return response()->json(['success' => true, 'message' => 'Bid rejected']);
    }
}