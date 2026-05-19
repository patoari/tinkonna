<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Delivery info
            $table->string('delivery_name');
            $table->string('delivery_phone');
            $table->string('delivery_address');
            $table->string('delivery_city');
            $table->string('delivery_district')->nullable();
            $table->text('delivery_notes')->nullable();

            // Financials
            $table->decimal('total_amount', 10, 2);

            // Payment
            $table->enum('payment_method', ['bkash', 'nagad', 'rocket', 'other'])->nullable();
            $table->string('transaction_reference')->nullable();
            $table->string('sender_number')->nullable();
            $table->string('payment_screenshot')->nullable();
            $table->enum('payment_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();

            // Order status
            $table->enum('status', ['pending_payment', 'payment_submitted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending_payment');

            $table->timestamps();
            $table->softDeletes();

            $table->index('order_number');
            $table->index('status');
            $table->index('payment_status');
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->constrained()->onDelete('restrict');
            $table->string('product_name');
            $table->string('size');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->string('product_image_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
