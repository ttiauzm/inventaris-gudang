<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('suppliers')->insert([
            [
                'supplier_id' => Str::uuid(),
                'supplier_name' => 'PT Sumber Makmur',
                'contact_info' => '081234567890',
                'street' => 'Jl. Merdeka No. 45',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '10110',
                'country' => 'Indonesia',
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'supplier_id' => Str::uuid(),
                'supplier_name' => 'CV Sejahtera Abadi',
                'contact_info' => 'cs@sejahteraabadi.com',
                'street' => 'Jl. Soekarno-Hatta No. 22',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'postal_code' => '40235',
                'country' => 'Indonesia',
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'supplier_id' => Str::uuid(),
                'supplier_name' => 'UD Cahaya Baru',
                'contact_info' => 'sales@cahayabaru.id',
                'street' => 'Jl. Diponegoro No. 9',
                'city' => 'Surabaya',
                'province' => 'Jawa Timur',
                'postal_code' => '60241',
                'country' => 'Indonesia',
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
