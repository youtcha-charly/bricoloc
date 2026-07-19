<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DisputeController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_id' => 'required|exists:job_postings,id',
            'reason' => 'required|string|min:10|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $job = Job::findOrFail($request->job_id);

        // Verify user is involved in this job
        if ((int) $job->client_id !== (int) $user->id && (int) ($job->hired_bricoleur_id ?? 0) !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not involved in this job'
            ], 403);
        }

        // Check for existing open dispute
        $existing = Dispute::where('job_id', $request->job_id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'An open dispute already exists for this job'
            ], 400);
        }

        $dispute = Dispute::create([
            'job_id' => $request->job_id,
            'raised_by_id' => $user->id,
            'reason' => $request->reason,
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispute submitted successfully',
            'data' => $dispute,
        ], 201);
    }
}
