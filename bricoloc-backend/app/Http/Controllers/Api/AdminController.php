<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BricoleurProfile;
use App\Models\Job;
use App\Models\Bid;
use App\Models\Dispute;
use App\Models\Notification;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'totalClients' => User::where('role', 'client')->count(),
            'totalBricoleurs' => User::where('role', 'bricoleur')->count(),
            'totalAdmins' => User::where('role', 'admin')->count(),
            'activeJobs' => Job::where('status', 'open')->count(),
            'assignedJobs' => Job::where('status', 'assigned')->count(),
            'completedJobs' => Job::where('status', 'completed')->count(),
            'pendingVerifications' => BricoleurProfile::where('verification_status', 'pending')->count(),
            'verifiedBricoleurs' => BricoleurProfile::where('verification_status', 'verified')->count(),
            'openDisputes' => Dispute::where('status', 'open')->count(),
            'totalJobs' => Job::count(),
            'totalBids' => Bid::count(),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    public function clients(Request $request)
    {
        $clients = User::where('role', 'client')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $clients]);
    }

    public function bricoleurs(Request $request)
    {
        $bricoleurs = User::where('role', 'bricoleur')
            ->orderBy('created_at', 'desc')
            ->get();

        // Manually attach profile data
        $bricoleurs->each(function ($user) {
            $profile = BricoleurProfile::where('user_id', $user->id)->first();
            $user->bricoleur_profile = $profile;
        });

        return response()->json(['success' => true, 'data' => $bricoleurs]);
    }

    public function userDetails($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'bricoleur') {
            $user->bricoleur_profile = BricoleurProfile::where('user_id', $user->id)->first();
        }

        return response()->json(['success' => true, 'data' => $user]);
    }

    public function verifyBricoleur($id)
    {
        $profile = BricoleurProfile::where('user_id', $id)->first();
        if ($profile) {
            $profile->verification_status = 'verified';
            $profile->verified_at = now();
            $profile->save();
        }

        return response()->json(['success' => true, 'message' => 'Bricoleur verified']);
    }

    public function rejectBricoleur(Request $request, $id)
    {
        $profile = BricoleurProfile::where('user_id', $id)->first();
        if ($profile) {
            $profile->verification_status = 'rejected';
            $profile->save();
        }

        return response()->json(['success' => true, 'message' => 'Bricoleur rejected']);
    }

    public function toggleSuspend($id)
    {
        $user = User::findOrFail($id);
        $user->status = $user->status === 'suspended' ? 'active' : 'suspended';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => $user->status === 'suspended' ? 'User suspended' : 'User reactivated',
            'status' => $user->status,
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from deleting themselves or other admins
        if ($user->role === 'admin') {
            return response()->json(['success' => false, 'message' => 'Cannot delete admin users'], 400);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User deleted']);
    }

    public function disputes(Request $request)
    {
        $disputes = Dispute::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $disputes]);
    }

    public function resolveDispute(Request $request, $id)
    {
        $dispute = Dispute::findOrFail($id);
        $dispute->status = 'resolved';
        $dispute->resolution = $request->input('resolution', 'Resolved by admin');
        $dispute->resolved_at = now();
        $dispute->save();

        return response()->json(['success' => true, 'message' => 'Dispute resolved']);
    }

    public function jobs(Request $request)
    {
        $jobs = Job::with(['client', 'category'])
            ->withCount('bids')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $jobs]);
    }
}