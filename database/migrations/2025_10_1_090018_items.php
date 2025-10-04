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
        Schema::create('items', function (Blueprint $table) {
            $table->uuid('item_id')->primary();
            $table->string('item_name', 100);
            $table->foreignUuid('category_id')->constrained('categories', 'category_id')->onDelete('restrict');
            $table->foreignUuid('material_id')->constrained('materials', 'material_id')->onDelete('restrict');
            $table->integer('quantity')->default(0);
            $table->string('unit', 50);
            $table->decimal('price', 10, 2)->default(0);
            $table->foreignUuid('parent_item_id')->nullable()->constrained('items', 'item_id')->onDelete('set null');
            $table->boolean('is_deleted')->default(false);
            $table->timestamps(); 

            
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
        
    }
};
