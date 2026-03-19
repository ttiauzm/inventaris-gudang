<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Logs;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $req)
    {
        $authUser = $req->user();

        // ✅ Pakai hasPermission ('manage_users' ini cuma ada di $superOnly di Seeder)
        if (!$authUser->hasPermission('manage_users')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Anda tidak memiliki izin melihat daftar user',
                'data'    => null
            ], 403);
        }

        $users = User::where('is_deleted', false)
            ->select('user_id', 'username', 'email', 'email_verified_at', 'email_pending', 'role_id', 'is_deleted', 'created_at')
            ->with('role:role_id,role_name')
            ->orderByRaw("CASE WHEN user_id = ? THEN 0 ELSE 1 END", [$authUser->user_id])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar user berhasil diambil',
            'data'    => $users
        ], 200);
    }

    public function show(Request $req, $id)
    {
        $authUser = $req->user();

        // ✅ Boleh lihat kalau dia Superadmin (manage_users) ATAU kalau dia lagi ngecek profilnya sendiri
        if (!$authUser->hasPermission('manage_users') && $authUser->user_id !== $id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Anda tidak memiliki izin melihat detail user ini',
                'data'    => null
            ], 403);
        }

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

        // ✅ Ganti hardcode jadi hasPermission
        if (!$authUser->hasPermission('create_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - hanya Superadmin yang dapat membuat admin',
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

        $admin->sendEmailVerificationNotification();

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
                'user_id'  => $admin->user_id,
                'username' => $admin->username,
                'email'    => $admin->email,
            ],
        ], 201);
    }

    // ✅ FUNGSI GABUNGAN YANG PINTAR
    public function updateProfile(Request $req, $user_id)
    {
        $authUser = $req->user();

        // 1. CEK IDENTITAS
        $isEditingSelf = ($authUser->user_id === $user_id);

        // 2. CEK IZIN
        if ($isEditingSelf) {
            if (!$authUser->hasPermission('update_profile_self')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - tidak punya izin update_profile_self',
                    'data'    => null
                ], 403);
            }
        } else {
            if (!$authUser->hasPermission('update_profile_admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - tidak punya izin update_profile_admin',
                    'data'    => null
                ], 403);
            }
        }

        $user = User::where('user_id', $user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan', 'data' => null], 404);
        }

        // 3. VALIDASI (Beda aturan kalau ngedit diri sendiri vs ngeditin orang)
        $rules = [
            'username' => 'nullable|string',
            'email'    => 'nullable|email|unique:users,email,' . $user_id . ',user_id',
            'password' => 'nullable|string|min:6',
        ];

        // Kalau ngedit diri sendiri dan mau ganti password, wajib masukin password lama
        if ($isEditingSelf && $req->filled('password')) {
            $rules['old_password'] = 'required|string';
        }

        $req->validate($rules);

        $data = [];
        $isEmailChanging = false;
        $newEmail = $req->filled('email') ? trim((string) $req->email) : null;

        if ($req->filled('username')) $data['username'] = $req->username;

        if ($req->filled('password')) {
            if ($isEditingSelf) {
                if (!Hash::check($req->old_password, $user->password)) {
                    return response()->json(['success' => false, 'message' => 'Password lama salah!'], 422);
                }
            }
            $data['password'] = Hash::make($req->password);
        }

        // 4. LOGIKA EMAIL PENDING
        if ($newEmail && $newEmail !== $user->email && $newEmail !== $user->email_pending) {
            $emailAlreadyUsed = User::where('user_id', '!=', $user_id)
                ->where('is_deleted', false)
                ->where(function ($query) use ($newEmail) {
                    $query->where('email', $newEmail)
                        ->orWhere('email_pending', $newEmail);
                })
                ->exists();

            if ($emailAlreadyUsed) {
                throw ValidationException::withMessages([
                    'email' => 'Email sudah digunakan atau sedang menunggu verifikasi pada akun lain.',
                ]);
            }

            $data['email_pending'] = $newEmail;
            $isEmailChanging = true;
        }

        if (empty($data)) {
            return response()->json(['success' => false, 'message' => 'Tidak ada perubahan data', 'data' => null], 422);
        }

        $user->update($data);
        $user->refresh();

        if ($isEmailChanging) {
            $user->sendEmailVerificationNotification(); 
        }

        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $authUser->user_id,
            'action' => 'UPDATE',
            'table_name' => 'users',
            'row_id' => $user->user_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => $isEmailChanging 
                ? 'Profil diperbarui. Email baru masih pending dan link verifikasi telah dikirim ke alamat email baru.' 
                : 'Profil berhasil diperbarui.',
            'data'    => $user->only(['user_id', 'username', 'email', 'email_pending', 'email_verified_at']),
        ], 200);
    }

    public function softDelete(Request $req, $id)
    {
        $authUser = $req->user();

        // ✅ Ganti can() jadi hasPermission()
        if (!$authUser->hasPermission('delete_user')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Anda tidak memiliki izin menghapus user',
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

    public function verifyEmail(Request $req, $id, $hash)
    {
        if (!$req->hasValidSignature()) {
            return response()->json(['success' => false, 'message' => 'Link tidak valid.'], 403);
        }

        $user = User::find($id);

        if (!$user) return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);

        $emailForVerification = $user->email_pending ?: $user->email;

        if (!hash_equals((string) $hash, sha1($emailForVerification))) {
            return response()->json(['success' => false, 'message' => 'Hash verifikasi email tidak valid.'], 403);
        }

        if ($user->email_pending) {
            $pendingEmailConflict = User::where('user_id', '!=', $user->user_id)
                ->where('is_deleted', false)
                ->where(function ($query) use ($user) {
                    $query->where('email', $user->email_pending)
                        ->orWhere('email_pending', $user->email_pending);
                })
                ->exists();

            if ($pendingEmailConflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email baru tidak dapat diverifikasi karena sudah digunakan akun lain.',
                ], 422);
            }

            $user->email = $user->email_pending;
            $user->email_pending = null;
            $user->email_verified_at = now();
            $user->save();

            return response()->json(['success' => true, 'message' => 'Email baru Anda berhasil diverifikasi!'], 200);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return response()->json(['success' => true, 'message' => 'Email berhasil diverifikasi!'], 200);
    }
}