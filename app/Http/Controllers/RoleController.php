<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Logs;
use App\Models\Permissions;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function togglePermission(Request $request, $role_id) {
        $authUser = auth()->user();

        if (!$authUser || $authUser->role->role_name != 'superadmin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $role = Role::find($role_id);
        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan'], 404);
        }

        $request->validate([
            'permission' => 'required|string',
        ]);

        $permission = $request->permission;

        $existing = \App\Models\Permissions::where('role_id', $role_id)
            ->where('permission_name', $permission)
            ->first();

        if ($existing && !$existing->is_deleted) {
            $existing->update(['is_deleted' => true]);
            $action = 'REMOVE_PERMISSION';
        } else {
            \App\Models\Permissions::updateOrCreate(
                ['role_id' => $role_id, 'permission_name' => $permission],
                ['is_deleted' => false]
            );
            $action = 'GRANT_PERMISSION';
        }

        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $authUser->user_id,
            'action' => 'UPDATE',
            'table_name' => 'roles',
            'row_id' => $role->role_id,
            'timestamp' => now(),
        ]);

        $updatedPermissions = \App\Models\Permissions::where('role_id', $role_id)
            ->where('is_deleted', false)
            ->pluck('permission_name')
            ->toArray();

        return response()->json([
            'message' => $action === 'GRANT_PERMISSION'
                ? 'Permission berhasil ditambahkan'
                : 'Permission berhasil dihapus',
            'permissions' => $updatedPermissions
        ]);
    }

}
