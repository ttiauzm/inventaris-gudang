<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permissions;
use App\Models\Logs;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        // ✅ Hanya yang punya izin manage_users/add_role (Superadmin)
        if (!$authUser->hasPermission('add_role')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Anda tidak memiliki izin mengakses daftar role',
                'data'    => null
            ], 403);
        }

        $roles = Role::where('is_deleted', false)
            ->select('role_id', 'role_name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar role berhasil diambil',
            'data'    => $roles
        ], 200);
    }

    public function getPermissions($roleId)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('update_permission')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'data'    => null
            ], 403);
        }

        // Ambil semua nama permission unik yang ada di sistem
        $allPermissions = Permissions::distinct()->pluck('permission_name');

        // Ambil permission yang nempel di role ini
        $rolePermissions = Permissions::where('role_id', $roleId)->get();

        $mapped = $allPermissions->map(function ($name) use ($rolePermissions) {
            $found = $rolePermissions->firstWhere('permission_name', $name);
            return [
                'permission_name' => $name,
                'is_active' => $found ? !$found->is_deleted : false,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission untuk role berhasil diambil',
            'data'    => $mapped
        ], 200);
    }

    public function togglePermission(Request $req)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('update_permission')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $req->validate([
            'role_id' => 'required|uuid',
            'permission_name' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $roleId = $req->role_id;
        $permissionName = $req->permission_name;
        $isActive = $req->is_active;

        $existing = Permissions::where('role_id', $roleId)
            ->where('permission_name', $permissionName)
            ->first();

        if ($existing) {
            $existing->is_deleted = !$isActive;
            $existing->save();
        } else {
            $existing = Permissions::create([
                'permission_id' => Str::uuid(),
                'role_id' => $roleId,
                'permission_name' => $permissionName,
                'is_deleted' => !$isActive,
            ]);
        }

        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $authUser->user_id,
            'action' => 'UPDATE',
            'table_name' => 'permissions',
            'row_id' => $existing->permission_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => $isActive ? 'Permission diaktifkan' : 'Permission dinonaktifkan',
            'data'    => $existing
        ], 200);
    }

    public function createRole(Request $req)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('add_role')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $req->validate([
            'role_name' => 'required|string|unique:roles,role_name',
        ]);

        $role = Role::create([
            'role_id' => Str::uuid(),
            'role_name' => $req->role_name,
            'is_deleted' => false,
        ]);

        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $authUser->user_id,
            'action' => 'CREATE',
            'table_name' => 'roles',
            'row_id' => $role->role_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role baru berhasil dibuat',
            'data'    => $role
        ], 201);
    }

    // Fungsi ini biasanya dipakai kalau kamu pakai tabel pivot role_permissions
    public function addPermissionToRole(Request $req, $role_id)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('update_permission')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $req->validate([
            'permission_name' => 'required|string',
        ]);

        $role = Role::where('role_id', $role_id)->first();

        if (!$role) {
            return response()->json(['success' => false, 'message' => 'Role tidak ditemukan'], 404);
        }

        // Karena struktur kamu permission nempel ke role_id di tabel permissions, 
        // kita insert/update saja di sana
        $permission = Permissions::updateOrCreate(
            ['role_id' => $role_id, 'permission_name' => $req->permission_name],
            ['permission_id' => Str::uuid(), 'is_deleted' => false]
        );

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'permissions',
            'row_id'     => $permission->permission_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil ditambahkan ke role',
            'data' => [
                'role_name' => $role->role_name,
                'permission' => $permission->permission_name,
            ],
        ], 201);
    }
}