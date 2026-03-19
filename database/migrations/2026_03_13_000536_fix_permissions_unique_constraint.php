<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Hapus unique index lama pada satu kolom saja
            $table->dropUnique('permissions_permission_name_unique');
            // Ganti dengan unique gabungan (role_id + permission_name)
            $table->unique(['role_id', 'permission_name'], 'permissions_role_permission_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropUnique('permissions_role_permission_unique');
            $table->unique('permission_name', 'permissions_permission_name_unique');
        });
    }
};
