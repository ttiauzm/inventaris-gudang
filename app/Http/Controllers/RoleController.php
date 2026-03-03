<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permissions;
use App\Models\Logs;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function index()
    {
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
        $permissionList = [
            'update_profile_admin',
            'update_profile_self',
            'delete_user',
            'create_admin',
            'view_logs',
        ];

        $permissions = Permissions::where('role_id', $roleId)->get();

        $mapped = collect($permissionList)->map(function ($name) use ($permissions) {
            $found = $permissions->firstWhere('permission_name', $name);
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
            'user_id' => $req->user()->user_id,
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
            'user_id' => $req->user()->user_id,
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

    public function addPermissionToRole(Request $req, $role_id)
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
            'permission_name' => 'required|string|exists:permissions,permission_name',
        ]);

        $role = Role::where('role_id', $role_id)->first();

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $permission = Permissions::where('permission_name', $req->permission_name)->first();

        if ($role->permissions()->where('permissions.permission_id', $permission->permission_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Role sudah memiliki permission ini',
                'data'    => null
            ], 409);
        }

        $role->permissions()->attach($permission->permission_id);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'role_permissions',
            'row_id'     => $role->role_id,
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