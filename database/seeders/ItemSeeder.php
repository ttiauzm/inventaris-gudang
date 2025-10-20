<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ItemSeeder extends Seeder
{
    public function run()
    {
        // Ambil satu data dari setiap tabel sebagai FK
        $kainCat = DB::table('categories')->where('category_name', 'Kain')->value('category_id');
        $benangCat = DB::table('categories')->where('category_name', 'Benang')->value('category_id');
        $aksesoriCat = DB::table('categories')->where('category_name', 'Aksesoris')->value('category_id');

        $katunMat = DB::table('materials')->where('material_name', 'Katun')->value('material_id');
        $polyMat = DB::table('materials')->where('material_name', 'Polyester')->value('material_id');
        $linenMat = DB::table('materials')->where('material_name', 'Linen')->value('material_id');
        $denimMat = DB::table('materials')->where('material_name', 'Denim')->value('material_id');

        DB::table('items')->insert([
            [
                'item_id' => Str::uuid(),
                'item_name' => 'Kain Katun Motif Bunga',
                'category_id' => $kainCat,
                'material_id' => $katunMat,
                'quantity' => 120,
                'unit' => 'meter',
                'price' => 35000.00,
                'parent_item_id' => null,
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_id' => Str::uuid(),
                'item_name' => 'Kain Linen Premium',
                'category_id' => $kainCat,
                'material_id' => $linenMat,
                'quantity' => 80,
                'unit' => 'meter',
                'price' => 42000.00,
                'parent_item_id' => null,
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_id' => Str::uuid(),
                'item_name' => 'Benang Polyester Warna Putih',
                'category_id' => $benangCat,
                'material_id' => $polyMat,
                'quantity' => 300,
                'unit' => 'gulung',
                'price' => 15000.00,
                'parent_item_id' => null,
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_id' => Str::uuid(),
                'item_name' => 'Resleting Metal 20cm',
                'category_id' => $aksesoriCat,
                'material_id' => $denimMat,
                'quantity' => 200,
                'unit' => 'buah',
                'price' => 5000.00,
                'parent_item_id' => null,
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_id' => Str::uuid(),
                'item_name' => 'Kancing Plastik Bulat',
                'category_id' => $aksesoriCat,
                'material_id' => $polyMat,
                'quantity' => 1000,
                'unit' => 'buah',
                'price' => 300.00,
                'parent_item_id' => null,
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
