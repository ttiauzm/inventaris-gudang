<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superadminRole = Role::where('role_name', 'superadmin')->first();

        // Akun superadmin tambahan
        $existing = User::where('email', 'superadmin2@example.com')->first();
        if ($existing) {
            // Update tanpa mengubah user_id (hindari FK violation pada logs)
            $existing->update([
                'username' => 'superadmin2',
                'password' => Hash::make('password456'),
                'role_id'  => $superadminRole->role_id,
                'is_deleted' => false,
                'email_verified_at' => now(),
            ]);
        } else {
            User::create([
                'user_id' => Str::uuid(),
                'email'   => 'superadmin2@example.com',
                'username' => 'superadmin2',
                'password' => Hash::make('password456'),
                'role_id'  => $superadminRole->role_id,
                'is_deleted' => false,
                'email_verified_at' => now(),
            ]);
        }
    }
}
