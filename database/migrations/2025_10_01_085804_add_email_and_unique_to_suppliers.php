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
        Schema::table('suppliers', function (Blueprint $table) {
            // Add email column if not exists
            if (!Schema::hasColumn('suppliers', 'email')) {
                $table->string('email', 100)->nullable()->unique()->after('contact_info');
            }
            
            // Add unique constraint to supplier_name if not exists
            if (!Schema::hasColumn('suppliers', 'supplier_name') || 
                !Schema::hasIndex('suppliers', 'suppliers_supplier_name_unique')) {
                $table->unique('supplier_name', 'suppliers_supplier_name_unique');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropUniqueIfExists('suppliers_supplier_name_unique');
            $table->dropColumnIfExists('email');
        });
    }
};
