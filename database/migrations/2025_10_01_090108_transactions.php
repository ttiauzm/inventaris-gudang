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
        Schema::create('transactions', function (Blueprint $table) {
            $table->Uuid('transaction_id');
            $table->foreignUuid('item_id')->constrained('items', 'item_id')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignUuid('supplier_id')->constrained('suppliers', 'supplier_id')->onDelete('cascade');
            $table->enum('transaction_type', ['IN', 'OUT', 'CUT']);
            $table->integer('quantity');
            $table->string('unit');
            $table->text('description')->nullable();
            $table->timestamp('transaction_date')->useCurrent();
            
            
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
        
    }
};
