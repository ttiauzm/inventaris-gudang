<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    public function login (Request $req) {
        $req->validate(['username'=>'required|string', 'password'=>'required|string']);

        $user = User::where('username', $req->username)->first();

        if (! $user || ! Hash::check($req->password, $user->password)) {
            return response()->json(['message' => 'Username atau password salah'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'access_token'=>$token,
            'token_type'=>'Bearer',
            'user'=>$user
            
        ]);
    }

    public function logout(Request $req) {
        $req->user()->currentAccessToken()->delete();

        return response()->json(['message'=>'Logout berhasil']);
    }
}
