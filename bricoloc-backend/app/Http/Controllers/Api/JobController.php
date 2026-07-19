<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    /**
     * List jobs - for clients shows their own jobs, for bricoleurs shows open jobs
     */
   public function index(Request $request)
{
    $user = $request->user();

    // ALWAYS filter by client_id for clients
    // Bricoleurs see all open jobs
    if ($user->role === 'bricoleur') {
        $jobs = Job::with('category')
            ->withCount('bids')
            ->where('status', 'open')
            ->latest()
            ->get();
    } else {
        // CLIENT: Only return this client's jobs
        $jobs = Job::with(['category', 'chat'])
            ->withCount('bids')
            ->where('client_id', $user->id)
            ->latest()
            ->get();
    }

    return response()->json(['success' => true, 'data' => $jobs]);
}
    /**
     * Create a new job
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:5|max:100',
            'description' => 'required|string|min:20',
            'category_id' => 'required|exists:job_categories,id',
            'city' => 'required|string',
            'budget_min' => 'nullable|integer|min:0',
            'budget_max' => 'nullable|integer|min:0',
            'photo' => 'nullable|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = 'job_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/jobs'), $filename);
            $photoUrl = 'storage/jobs/' . $filename;
        }

        $job = Job::create([
            'client_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'photo_url' => $photoUrl,
            'budget_min' => $request->budget_min,
            'budget_max' => $request->budget_max,
            'budget_type' => 'fixed',
            'city' => $request->city,
            'status' => 'open',
        ]);

        return response()->json(['success' => true, 'message' => 'Job created', 'data' => $job], 201);
    }

    /**
     * Show a single job with bids
     */
    public function show($id)
    {
        $job = Job::with(['category', 'client', 'bids.bricoleur', 'chat'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $job,
        ]);
    }

    /**
     * Update a job
     */
    public function update(Request $request, $id)
    {
        $job = Job::where('client_id', $request->user()->id)->findOrFail($id);
        $job->update($request->only(['title', 'description', 'budget_min', 'budget_max', 'city']));
        return response()->json(['success' => true, 'data' => $job]);
    }

    /**
     * Delete a job
     */
    public function destroy(Request $request, $id)
    {
        $job = Job::where('client_id', $request->user()->id)->findOrFail($id);
        $job->delete();
        return response()->json(['success' => true, 'message' => 'Job deleted']);
    }

    /**
     * Mark a job as completed (by client)
     */
    public function complete(Request $request, $id)
    {
        $job = Job::where('client_id', $request->user()->id)->findOrFail($id);

        // Only allow completing assigned or in_progress jobs
        if (!in_array($job->status, ['assigned', 'in_progress'])) {
            return response()->json([
                'success' => false,
                'message' => 'This job cannot be completed. Current status: ' . $job->status
            ], 400);
        }

        $job->status = 'completed';
        $job->completed_at = now();
        $job->save();

        // Update bricoleur stats
        if ($job->hired_bricoleur_id) {
            $profile = \App\Models\BricoleurProfile::where('user_id', $job->hired_bricoleur_id)->first();
            if ($profile) {
                $profile->total_jobs_completed = ($profile->total_jobs_completed ?? 0) + 1;
                $profile->save();
            }

            // Notify the bricoleur
            \App\Models\Notification::create([
                'user_id' => $job->hired_bricoleur_id,
                'title' => 'Job Completed',
                'body' => 'The client has marked the job "' . $job->title . '" as completed.',
                'type' => 'job_completed',
                'data' => json_encode(['job_id' => $job->id]),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Job marked as completed',
            'data' => $job,
        ]);
    }

    /**
     * Cancel a job (by client)
     */
    public function cancel(Request $request, $id)
    {
        $job = Job::where('client_id', $request->user()->id)->findOrFail($id);

        if (!in_array($job->status, ['open', 'assigned'])) {
            return response()->json([
                'success' => false,
                'message' => 'This job cannot be cancelled. Current status: ' . $job->status
            ], 400);
        }

        $job->status = 'cancelled';
        $job->save();

        if ($job->hired_bricoleur_id) {
            Notification::create([
                'user_id' => $job->hired_bricoleur_id,
                'title' => 'Job Cancelled',
                'body' => 'The client has cancelled the job "' . $job->title . '".',
                'type' => 'job_cancelled',
                'data' => json_encode(['job_id' => $job->id]),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Job cancelled',
            'data' => $job,
        ]);
    }
}