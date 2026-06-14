<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Nambahin kolom image_proof setelah kolom description (boleh kosong/nullable)
            $table->string('image_proof')->nullable()->after('description');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Kalau migration di-rollback, kolom ini dihapus
            $table->dropColumn('image_proof');
        });
    }
};