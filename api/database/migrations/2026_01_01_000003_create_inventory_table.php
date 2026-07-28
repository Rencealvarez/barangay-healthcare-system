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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->string('sku')->unique()->nullable();
            $table->string('category');
            $table->integer('quantity')->default(0);
            $table->string('unit');
            $table->integer('min_stock_level')->default(10);
            $table->date('expiration_date')->nullable();
            $table->enum('status', ['in_stock', 'low_stock', 'out_of_stock', 'expired'])->default('in_stock');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
