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
        Schema::create('item_supplier', function (Blueprint $table) {
            $table->uuid('item_id');
            $table->uuid('supplier_id');

            $table->foreign('item_id')
                ->references('item_id')
                ->on('items')
                ->onDelete('cascade');

            $table->foreign('supplier_id')
                ->references('supplier_id')
                ->on('suppliers')
                ->onDelete('cascade');

            $table->primary(['item_id', 'supplier_id']);
            });

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_supplier');
        
    }
};
