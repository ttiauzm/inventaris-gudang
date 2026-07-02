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

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('permissions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $now = Carbon::now();

        // 1. HAK ISTIMEWA KHUSUS SUPERADMIN (Owner/Master Data)
        $superOnly = [
            'manage_users', 'create_admin', 'delete_user', 'view_logs',
            'add_permission', 'update_permission', 'delete_permission',
            'add_role', 'update_role', 'delete_role', 'update_profile_admin',
            // Master Data Item & Details
            'add_item', 'delete_item', 'update_item_detail',
            'add_category', 'update_category', 'delete_category',
            'add_supplier', 'update_supplier', 'delete_supplier',
            'add_material', 'update_material', 'delete_material',
            'update_transaction', 'delete_transaction',
        ];

        // 2. HAK OPERASIONAL BERSAMA (Admin & Superadmin)
        $shared = [
            'login', 
            'view_item', 
            'update_item', //Ini untuk fungsi "Potong Kain" / Cut Stock
            'view_category',
            'view_supplier',
            'view_material',
            'view_transaction', 'add_transaction',
            'update_profile_self',
            
            // TAMBAHAN BARU UNTUK FITUR BARANG RUSAK:
            'report_faulty', 
            'view_faulty'    
        ];

        // Masukkan semua untuk Superadmin
        foreach (array_merge($superOnly, $shared) as $perm) {
            $this->insertPermission($perm, $superadminId, $now);
        }

        // Masukkan yang shared saja untuk Admin
        foreach ($shared as $perm) {
            $this->insertPermission($perm, $adminId, $now);
        }

        $this->command->info('Seeder Berhasil! Admin sekarang cuma bisa potong stok, Superadmin pegang Master Data.');
    }

    private function insertPermission($name, $roleId, $now) 
    {
        DB::table('permissions')->insert([
            'permission_id'   => Str::uuid(),
            'role_id'         => $roleId,
            'permission_name' => $name,
            'is_deleted'      => false,
            'created_at'      => $now,
            'updated_at'      => $now,
        ]);
    }
}