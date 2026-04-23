<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $req) {
        
        $req->validate([
            'login'    => 'required|string', 
            'password' => 'required|string'
        ]);

        // 1. CEK USER & PASTIKAN BELUM DI-SOFT DELETE
        $user = User::where(function($query) use ($req) {
                        $query->where('username', $req->login)
                              ->orWhere('email', $req->login);
                    })
                    ->where('is_deleted', false)
                    ->first();

        if (!$user || !Hash::check($req->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah',
                'data'    => null
            ], 401);
        }

        // 2. CEK PERMISSION LOGIN DARI DATABASE RBAC
        if (!$user->hasPermission('login')) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda tidak memiliki izin untuk mengakses sistem.',
            ], 403);
        }

        // 3. CEK STATUS VERIFIKASI EMAIL
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Login gagal! Akun Anda belum aktif. Silakan cek kotak masuk email Anda untuk melakukan verifikasi terlebih dahulu.',
            ], 403);
        }

        // Generate Token
        $token = $user->createToken('auth-token')->plainTextToken;

        // 4. AMBIL SEMUA PERMISSION UNTUK FRONTEND
        $permissions = DB::table('permissions')
            ->where('role_id', $user->role_id)
            ->where('is_deleted', false)
            ->pluck('permission_name'); // Mengambil array namanya saja
        
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data'    => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user->only(['user_id', 'username', 'email']), // Biasanya user_id juga butuh dikirim
                'role'         => $user->role->role_name ?? 'N/A',
                'permissions'  => $permissions
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