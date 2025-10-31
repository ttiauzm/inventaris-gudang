<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Roles;
use App\Models\Permissions;
use App\Models\Logs;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Roles::where('is_deleted', false)
            ->select('role_id', 'role_name')
            ->get();

        return response()->json($roles);
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

        return response()->json($mapped);
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
            Permissions::create([
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
            'row_id' => $existing ? $existing->permission_id : null,
        ]);

        return response()->json([
            'message' => $isActive
                ? 'Permission diaktifkan'
                : 'Permission dinonaktifkan',
        ]);
    }

    // (Opsional) Tambah role baru
    public function createRole(Request $req)
    {
        $req->validate([
            'role_name' => 'required|string|unique:roles,role_name',
        ]);

        $role = Roles::create([
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
            'message' => 'Role baru berhasil dibuat',
            'role' => $role,
        ], 201);
    }
}
