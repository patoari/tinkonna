<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // customer
            $table->foreignId('product_variant_id')->constrained()->onDelete('restrict');
            $table->integer('quantity')->default(1);
            $table->enum('booking_type', ['free', 'paid']);
            $table->decimal('booking_fee', 10, 2)->nullable(); // 20% for paid booking
            $table->decimal('product_price', 10, 2)->default(0);
            $table->enum('status', ['pending_payment', 'active', 'completed', 'cancelled', 'expired'])->default('pending_payment');
            $table->timestamp('booking_date');
            $table->timestamp('expiry_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('booking_number');
            $table->index('status');
            $table->index('expiry_date');
        });

        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->enum('payment_method', ['bkash', 'nagad', 'rocket', 'other']);
            $table->string('transaction_reference');
            $table->string('payment_screenshot')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_payments');
        Schema::dropIfExists('bookings');
    }
};
