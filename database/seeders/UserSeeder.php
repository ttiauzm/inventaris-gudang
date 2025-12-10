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
        User::updateOrCreate(
            ['email' => 'superadmin2@example.com'],
            [
                'user_id' => Str::uuid(),
                'username' => 'superadmin2',
                'password' => Hash::make('password456'),
                'role_id'  => $superadminRole->role_id,
                'is_deleted' => false,
            ]
        );
    }
}
