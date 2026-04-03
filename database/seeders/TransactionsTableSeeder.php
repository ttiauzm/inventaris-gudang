<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TransactionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Kumpulan Supplier ID asli dari databasemu
        $supplierIds = [
            '0e3e70ec-e122-42f5-8310-2b4ccd9b15e9',
            '2ab677c3-7574-43b3-a03b-01d15667264e',
            'be89e411-8084-476a-b852-1f182a9f5e74',
        ];

        // 2. Kumpulan Item ID beserta satuannya (berdasarkan tabel items)
        $items = [
            ['id' => '019cda77-f150-711f-ae22-3022e41bb3d5', 'unit' => 'gulung'], // kain baru banget
            ['id' => '019d5224-153a-7084-8422-0514ca53f050', 'unit' => 'gulung'], // Kain Batik Khas Jogja
            ['id' => '113ec7eb-8560-40cc-a0bd-cf6059dd0820', 'unit' => 'meter'],  // Kain Linen Premium
            ['id' => '3bdccdce-3c95-45ba-911b-ddb2c9887c7c', 'unit' => 'buah'],   // Resleting Metal 20cm
            ['id' => '883b8449-c4b3-477b-918b-7ee46c595dab', 'unit' => 'buah'],   // Kancing Plastik Bulat
            ['id' => '88a39f44-efd1-49fc-9166-cce59107daa7', 'unit' => 'meter'],  // Kain Katun Motif Bunga
            ['id' => 'fa045019-07fe-457e-88fe-bf951c0388f9', 'unit' => 'gulung'], // Benang Polyester Warna Putih
        ];

        // 3. Ambil satu user ID yang sudah ada di database sebagai admin
        // Sesuaikan nama kolom primary key user kamu, asumsinya 'user_id' atau 'id'
        $user = DB::table('users')->first();
        $userId = $user ? ($user->user_id ?? $user->id) : Str::uuid()->toString();

        $transactions = [];

        // 4. Looping untuk membuat 30 data transaksi dummy
        for ($i = 0; $i < 30; $i++) {
            $item = $items[array_rand($items)];
            $types = ['IN', 'OUT', 'CUT'];
            $type = $types[array_rand($types)]; // Random tipe IN atau OUT
            
            // Bikin tanggal transaksi acak dalam 2 bulan terakhir (biar chart dashboard kelihatan bagus)
            $randomDate = Carbon::now()->subDays(rand(0, 60));

            $transactions[] = [
                'transaction_id'   => Str::uuid()->toString(),
                'item_id'          => $item['id'],
                'user_id'          => $userId,
                'supplier_id'      => $supplierIds[array_rand($supplierIds)],
                'transaction_type' => $type,
                'quantity'         => rand(5, 50),
                'unit'             => $item['unit'],
                'description'      => $type === 'IN' ? 'Barang masuk dari supplier' : 'Pengambilan barang untuk produksi',
                'transaction_date' => $randomDate->format('Y-m-d'),
                'created_at'       => $randomDate,
                'updated_at'       => $randomDate,
            ];
        }

        // 5. Insert data ke tabel transactions
        DB::table('transactions')->insert($transactions);
        
        $this->command->info('30 data transaksi berhasil dibuat!');
    }
}