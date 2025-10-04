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
        Schema::create('images', function (Blueprint $table) {
            $table->uuid('image_id')->primary();
            $table->string('file_path');
            $table->string('file_type');
            $table->foreignUuid('item_id')->constrained('items', 'item_id')->onDelete('cascade');
            $table->integer('file_size');
            $table->timestamps(); 
            $table->boolean('is_deleted')->default(false);
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
        
    }
};
