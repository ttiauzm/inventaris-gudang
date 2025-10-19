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

        $users = User::where('is_deleted', false)->select('user_id', 'username')
            ->orderByRaw("CASE WHEN user_id = ? THEN 0 ELSE 1 END", [$authUser->user_id])
            ->get();

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::where('user_id', $id)
            ->where('is_deleted', false)
            ->with('role:role_id,role_name')
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        return response()->json([
            'username' => $user->username,
            'email' => $user->email,
            'password' => '********',
            'role_name' => $user->role->role_name ?? 'N/A'
        ]);
    }

    public function createAdmin(Request $req)
    {
        $authUser = $req->user();

        if ($authUser->role->role_name !== 'superadmin') {
            return response()->json(['message' => 'Unauthorized - hanya superadmin'], 403);
        }

        $req->validate([
            'username' => 'required|string|unique:users,username',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $adminRoleId = \DB::table('roles')->where('role_name', 'admin')->value('role_id');
        if (!$adminRoleId) {
            return response()->json(['message' => 'Role admin tidak ditemukan'], 404);
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
            'timestamp'  => now(),
        ]);

        return response()->json([
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
            return response()->json(['message' => 'Unauthorized - tidak punya izin update_profile_self'], 403);
        }

        $req->validate([
            'username' => 'nullable|string',
            'email'    => 'nullable|email|unique:users,email,' . $authUser->user_id . ',user_id',
            'password' => 'nullable|string|min:6',
        ]);

        if (!$req->filled('username') && !$req->filled('email') && !$req->filled('password')) {
            return response()->json(['message' => 'Minimal satu field harus diisi untuk update'], 422);
        }

        $data = [];
        if ($req->filled('username')) $data['username'] = $req->username;
        if ($req->filled('email')) $data['email'] = $req->email;
        if ($req->filled('password')) $data['password'] = Hash::make($req->password);

        $authUser->update($data);

        Logs::create([
            'user_id' => $authUser->user_id,
            'action' => 'UPDATE',
            'table_name' => 'users',
            'row_id' => $authUser->user_id,
            'timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Profil kamu berhasil diperbarui',
            'updated_data' => $data,
        ]);
    }

    public function updateProfile(Request $req, $user_id)
    {
        $authUser = $req->user();

        if (!$authUser->hasPermission('update_profile_admin')) {
            return response()->json(['message' => 'Unauthorized - tidak punya izin update_profile_admin'], 403);
        }

        $user = User::where('user_id', $user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $req->validate([
            'username' => 'nullable|string',
            'email'    => 'nullable|email|unique:users,email,' . $user_id . ',user_id',
            'password' => 'nullable|string|min:6',
        ]);

        if (!$req->filled('username') && !$req->filled('email') && !$req->filled('password')) {
            return response()->json(['message' => 'Minimal satu field harus diisi untuk update'], 422);
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
            'timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Profil user berhasil diperbarui oleh superadmin',
            'updated_data' => $data,
        ]);
    }

    public function softDelete(Request $req, $id)
    {
        $authUser = $req->user();

        if (!$authUser->hasPermission('delete_user')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::where('user_id', $id)
            ->where('is_deleted', false)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan atau sudah dihapus'], 404);
        }

        if ($user->user_id === $authUser->user_id) {
            return response()->json(['message' => 'Tidak bisa menghapus akun sendiri'], 400);
        }

        $user->update(['is_deleted' => true]);

        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $authUser->user_id,
            'action' => 'DELETE',
            'table_name' => 'users',
            'row_id' => $user->user_id,
            'timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Akun user berhasil dihapus (soft delete)',
            'deleted_user' => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
            ],
        ]);
    }


}
