<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run()
    {
        DB::table('categories')->insert([
            [
                'category_id' => Str::uuid(),
                'category_name' => 'Kain',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => Str::uuid(),
                'category_name' => 'Benang',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => Str::uuid(),
                'category_name' => 'Aksesoris',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
