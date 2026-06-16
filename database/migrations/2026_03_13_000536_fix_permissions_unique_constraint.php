<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Kita komentari yang ini karena gembok lamanya emang gak ada di database baru
            // $table->dropUnique('permissions_permission_name_unique');
            
            // Yang ini TETAP JALANAN agar role & permission kalian punya batasan unik yang benar
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
            //$table->unique('permission_name', 'permissions_permission_name_unique');
        });
    }
};
