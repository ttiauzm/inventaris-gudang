<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $req) {
        
        $req->validate([
            'login'    => 'required|string', 
            'password' => 'required|string'
        ]);

        $user = User::where('username', $req->login)
                    ->orWhere('email', $req->login)
                    ->first();

        
        if (!$user || !Hash::check($req->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah',
                'data'    => null
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data'    => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user->only(['username', 'email', 'role'])
            ]
        ], 200);
    }

    public function logout(Request $req) {
        
        $req->user()->currentAccessToken()->delete();

        
        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
            'data'    => null
        ], 200);
    }
}