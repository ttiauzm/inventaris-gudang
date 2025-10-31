<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $superadminId = DB::table('roles')->where('role_name', 'superadmin')->value('role_id');
        $adminId = DB::table('roles')->where('role_name', 'admin')->value('role_id');

        if (!$superadminId || !$adminId) {
            $this->command->error('⚠️ Role superadmin atau admin belum ada di tabel roles!');
            return;
        }

        $now = Carbon::now();

        $permissions = [
            // Superadmin
            'login',
            'manage_users',
            'add_item',
            'view_item',
            'update_item',
            'delete_item',
            'add_category',
            'update_category',
            'delete_category',
            'add_supplier',
            'update_supplier',
            'delete_supplier',
            'add_material',
            'update_material',
            'delete_material',
            'add_transaction',
            'update_transaction',
            'delete_transaction',
            'view_logs',
            'add_permission',
            'update_permission',
            'delete_permission',
            'add_role',
            'update_role',
            'delete_role',
            'update_profile_self',
            'update_profile_admin',
            'delete_user',

            // Admin
            'login_admin',
            'view_item_admin',
            'add_item_admin',
            'update_item_admin',
            'view_transaction_admin',
            'view_logs_admin',
            'view_supplier_admin',
            'view_material_admin',
        ];

        foreach ($permissions as $perm) {
            $roleId = str_contains($perm, '_admin') ? $adminId : $superadminId;

            DB::table('permissions')->updateOrInsert(
                [
                    'permission_name' => $perm,
                    'role_id' => $roleId,
                ],
                [
                    'permission_id' => Str::uuid(),
                    'is_deleted' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $this->command->info('✅ Roles dan Permissions berhasil dibuat/diperbarui tanpa duplikat');
    }
}
