<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superadminRole = Role::where('role_name', 'superadmin')->first();

        User::updateOrCreate(
            ['email' => env('SUPERADMIN_EMAIL', 'superadmin@example.com')],
            [
                'username' => env('SUPERADMIN_USERNAME', 'superadmin'),
                'password' => Hash::make(env('SUPERADMIN_PASSWORD', 'default123')),
                'role_id'  => $superadminRole->role_id,
                'is_deleted' => false,
            ]
        );
    }
}
