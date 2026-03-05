<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Logs;
use App\Models\Permissions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $req)
    {
        $authUser = $req->user();

        $users = User::where('is_deleted', false)
            ->select('user_id', 'username', 'email', 'role_id', 'is_deleted', 'created_at')
            ->with('role:role_id,role_name')
            ->orderByRaw("CASE WHEN user_id = ? THEN 0 ELSE 1 END", [$authUser->user_id])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar user berhasil diambil',
            'data'    => $users
        ], 200);
    }

    public function show($id)
    {
        $user = User::where('user_id', $id)
            ->where('is_deleted', false)
            ->with('role:role_id,role_name')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
                'data'    => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail user ditemukan',
            'data'    => [
                'username' => $user->username,
                'email' => $user->email,
                'password' => '********',
                'role_name' => $user->role->role_name ?? 'N/A'
            ]
        ], 200);
    }

    public function createAdmin(Request $req)
    {
        $authUser = $req->user();

        if ($authUser->role->role_name !== 'superadmin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - hanya superadmin',
                'data'    => null
            ], 403);
        }

        $req->validate([
            'username' => 'required|string|unique:users,username',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $adminRoleId = DB::table('roles')->where('role_name', 'admin')->value('role_id');
        if (!$adminRoleId) {
            return response()->json([
                'success' => false,
                'message' => 'Role admin tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $admin = User::create([
            'user_id'  => Str::uuid(),
            'username' => $req->username,
            'email'    => $req->email,
            'password' => Hash::make($req->password),
            'role_id'  => $adminRoleId,
        ]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'users',
            'row_id'     => $admin->user_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil dibuat',
            'data'    => [
                'username' => $admin->username,
                'email'    => $admin->email,
            ],
        ], 201);
    }

    public function updateSelf(Request $req)
    {
        $authUser = $req->user();

        if (!$authUser->hasPermission('update_profile_self')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - tidak punya izin update_profile_self',
                'data'    => null
            ], 403);
        }

        $req->validate([
            'username' => 'nullable|string',
            'email'    => 'nullable|email|unique:users,email,' . $authUser->user_id . ',user_id',
            'password' => 'nullable|string|min:6',
        ]);

        if (!$req->filled('username') && !$req->filled('email') && !$req->filled('password')) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal satu field harus diisi untuk update',
                'data'    => null
            ], 422);
        }

        $data = [];
        if ($req->filled('username')) $data['username'] = $req->username;
        if ($req->filled('email')) $data['email'] = $req->email;
        if ($req->filled('password')) $data['password'] = Hash::make($req->password);

        $authUser->update($data);

        Logs::create([
            'log_id'     => Str::uuid(), // ✅ Tambahkan UUID agar tidak error
            'user_id'    => $authUser->user_id,
            'action'     => 'UPDATE',
            'table_name' => 'users',
            'row_id'     => $authUser->user_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil kamu berhasil diperbarui',
            'data'    => $data,
        ], 200);
    }

    public function updateProfile(Request $req, $user_id)
    {
        $authUser = $req->user();

        if (!$authUser->can('update_profile_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - tidak punya izin update_profile_admin',
                'data'    => null
            ], 403);
        }

        $user = User::where('user_id', $user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $req->validate([
            'username' => 'nullable|string',
            'email'    => 'nullable|email|unique:users,email,' . $user_id . ',user_id',
            'password' => 'nullable|string|min:6',
        ]);

        if (!$req->filled('username') && !$req->filled('email') && !$req->filled('password')) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal satu field harus diisi untuk update',
                'data'    => null
            ], 422);
        }

        $data = [];
        if ($req->filled('username')) $data['username'] = $req->username;
        if ($req->filled('email')) $data['email'] = $req->email;
        if ($req->filled('password')) $data['password'] = Hash::make($req->password);

        $user->update($data);

        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $authUser->user_id,
            'action' => 'UPDATE',
            'table_name' => 'users',
            'row_id' => $user->user_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil user berhasil diperbarui oleh superadmin',
            'data'    => $data,
        ], 200);
    }

    public function softDelete(Request $req, $id)
    {
        $authUser = $req->user();

        if (!$authUser->can('delete_user')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'data'    => null
            ], 403);
        }

        $user = User::where('user_id', $id)
            ->where('is_deleted', false)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan atau sudah dihapus',
                'data'    => null
            ], 404);
        }

        if ($user->user_id === $authUser->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus akun sendiri',
                'data'    => null
            ], 400);
        }

        $user->update(['is_deleted' => true]);

        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $authUser->user_id,
            'action' => 'DELETE',
            'table_name' => 'users',
            'row_id' => $user->user_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun user berhasil dihapus (soft delete)',
            'data'    => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
            ],
        ], 200);
    }
}