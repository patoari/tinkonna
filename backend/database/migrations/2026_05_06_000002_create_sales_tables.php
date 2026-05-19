<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // cashier
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('net_amount', 10, 2);
            $table->enum('payment_method', ['cash', 'mobile_banking', 'card', 'other'])->default('cash');
            $table->string('payment_reference')->nullable();
            $table->enum('status', ['completed', 'refunded', 'cancelled'])->default('completed');
            $table->text('notes')->nullable();
            $table->timestamp('transaction_date');
            $table->timestamps();
            $table->softDeletes();

            $table->index('transaction_date');
            $table->index('transaction_number');
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->constrained()->onDelete('restrict');
            $table->string('product_name');
            $table->string('product_name_bn')->nullable();
            $table->string('size');
            $table->integer('quantity');
            $table->decimal('buying_price', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales_transactions');
    }
};
