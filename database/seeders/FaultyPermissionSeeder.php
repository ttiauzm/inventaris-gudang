<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FaultyPermissionSeeder extends Seeder
{
    public function run()
    {
        $superadminRole = DB::table('roles')->where('role_name', 'superadmin')->first();
        $adminRole = DB::table('roles')->where('role_name', 'admin')->first();

        $rolesToInsert = [];
        if ($superadminRole) $rolesToInsert[] = $superadminRole;
        if ($adminRole) $rolesToInsert[] = $adminRole;

        if (empty($rolesToInsert)) {
            echo "Gagal: Role Superadmin maupun Admin tidak ditemukan di database. Cek kembali kolom 'role_name'.\n";
            return;
        }

        foreach ($rolesToInsert as $role) {
            DB::table('permissions')->insert([
                [
                    'permission_id'   => Str::uuid(),
                    'role_id'         => $role->role_id,
                    'permission_name' => 'report_faulty',
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ],
                [
                    'permission_id'   => Str::uuid(),
                    'role_id'         => $role->role_id,
                    'permission_name' => 'view_faulty',
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]
            ]);
            
            echo "Permission sukses ditambahkan untuk role: " . $role->role_name . "\n";
        }
    }
}