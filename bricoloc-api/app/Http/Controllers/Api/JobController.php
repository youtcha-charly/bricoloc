<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Bid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with(['category', 'client'])
            ->when($request->city, fn($q) => $q->where('city', $request->city))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest();

        $jobs = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:5|max:100',
            'description' => 'required|string|min:20',
            'category_id' => 'required|exists:job_categories,id',
            'city' => 'required|string',
            'budget_min' => 'nullable|integer|min:1000',
            'budget_max' => 'nullable|integer|min:1000',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $job = Job::create([
            'client_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'budget_min' => $request->budget_min,
            'budget_max' => $request->budget_max,
            'budget_type' => $request->budget_type ?? 'fixed',
            'city' => $request->city,
            'neighborhood' => $request->neighborhood,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Travail publie avec succes',
            'data' => $job
        ], 201);
    }

    public function show($id)
    {
        $job = Job::with(['category', 'client', 'photos', 'bids.bricoleur'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $job
        ]);
    }
}