<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('base_product_id')->unique(); // e.g. PROD-001
            $table->string('name');
            $table->string('name_bn')->nullable(); // Bangla name
            $table->enum('category', ['shirts', 'pants', 't-shirts', 'panjabi', 'accessories']);
            $table->text('description')->nullable();
            $table->text('description_bn')->nullable();
            $table->string('image')->nullable();
            $table->boolean('has_fixed_price')->default(true);
            $table->decimal('buying_price', 10, 2);
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->enum('size_type', ['standard', 'measurement']); // standard=M/L/XL/XXL, measurement=inches
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('base_product_id');
            $table->index('category');
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('product_variant_id')->unique(); // e.g. PROD-001-L
            $table->string('barcode')->unique();
            $table->string('size'); // M, L, XL, XXL or inch value
            $table->integer('quantity')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('product_variant_id');
            $table->index('barcode');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};
