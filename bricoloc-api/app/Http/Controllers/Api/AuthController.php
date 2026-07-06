<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
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

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Email ou mot de passe incorrect'], 401);
        }

        $token = $user->createToken('bricoloc-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion reussie',
            'user' => $user,
            'token' => $token,
        ]);
    }
}