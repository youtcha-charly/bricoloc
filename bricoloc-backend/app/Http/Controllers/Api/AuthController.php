<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|min:2',
            'last_name' => 'required|string|min:2',
            'email' => 'required|email|unique:users',
            'phone_number' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:client,bricoleur',
            'city' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'city' => $request->city,
        ]);

        $token = $user->createToken('bricoloc-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Compte cree avec succes',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Email ou mot de passe incorrect'], 401);
        }

        if ($user->status === 'suspended') {
            return response()->json(['success' => false, 'message' => 'Your account has been suspended.'], 403);
        }

        $token = $user->createToken('bricoloc-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion reussie',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user profile
     */
    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'gender' => $user->gender,
                'date_of_birth' => $user->date_of_birth,
                'city' => $user->city,
                'neighborhood' => $user->neighborhood,
                'country' => $user->country,
                'account_type' => $user->account_type,
                'status' => $user->status,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|min:2|max:50',
            'last_name' => 'sometimes|string|min:2|max:50',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|string|min:9|max:20',
            'city' => 'sometimes|string|max:100',
            'gender' => 'nullable|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user fields
        $user->update($request->only([
            'first_name',
            'last_name',
            'email',
            'phone_number',
            'city',
            'gender',
            'date_of_birth',
        ]));

        // Update the full name
        $user->name = trim($user->first_name . ' ' . $user->last_name);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}