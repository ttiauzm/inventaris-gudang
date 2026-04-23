<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MaterialSeeder extends Seeder
{
    public function run()
    {
        DB::table('materials')->insert([
            [
                'material_id' => Str::uuid(),
                'material_name' => 'Katun',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'material_id' => Str::uuid(),
                'material_name' => 'Polyester',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'material_id' => Str::uuid(),
                'material_name' => 'Linen',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'material_id' => Str::uuid(),
                'material_name' => 'Denim',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
