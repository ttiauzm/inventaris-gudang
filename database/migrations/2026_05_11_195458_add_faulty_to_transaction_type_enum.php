<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
        {
            // Pakai DB::statement biar MySQL langsung nurut
            DB::statement("ALTER TABLE transactions MODIFY COLUMN transaction_type ENUM('IN', 'OUT', 'CUT', 'FAULTY') NOT NULL");
        }

        public function down()
        {
            // Kalau di-rollback, kembalikan seperti semula
            DB::statement("ALTER TABLE transactions MODIFY COLUMN transaction_type ENUM('IN', 'OUT', 'CUT') NOT NULL");
        }
};
