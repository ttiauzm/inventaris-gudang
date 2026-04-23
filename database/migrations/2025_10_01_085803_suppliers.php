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
        Schema::create('suppliers', function (Blueprint $table) {
                $table->uuid('supplier_id')->primary();
                $table->string('supplier_name', 100);
                $table->string('contact_info', 50)->nullable();
                $table->string('street', 100)->nullable();
                $table->string('city', 50)->nullable();
                $table->string('province', 50)->nullable();
                $table->string('postal_code', 10)->nullable();
                $table->string('country', 50)->nullable();
                $table->boolean('is_deleted')->default(false);
                $table->timestamps(); 

            
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExist('suppliers');
    }
};
