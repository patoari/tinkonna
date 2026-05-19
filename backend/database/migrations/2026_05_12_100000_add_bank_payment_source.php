<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify payment_source enum to include 'bank'
        DB::statement("ALTER TABLE sales_transactions MODIFY COLUMN payment_source ENUM('shop_cash', 'online', 'bank') NOT NULL DEFAULT 'shop_cash'");
        DB::statement("ALTER TABLE expenses MODIFY COLUMN payment_source ENUM('shop_cash', 'online', 'bank') NOT NULL DEFAULT 'shop_cash'");
        DB::statement("ALTER TABLE owner_transactions MODIFY COLUMN payment_source ENUM('shop_cash', 'online', 'bank') NOT NULL DEFAULT 'shop_cash'");

        // Create bank_accounts table
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->string('branch')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
        
        DB::statement("ALTER TABLE sales_transactions MODIFY COLUMN payment_source ENUM('shop_cash', 'online') NOT NULL DEFAULT 'shop_cash'");
        DB::statement("ALTER TABLE expenses MODIFY COLUMN payment_source ENUM('shop_cash', 'online') NOT NULL DEFAULT 'shop_cash'");
        DB::statement("ALTER TABLE owner_transactions MODIFY COLUMN payment_source ENUM('shop_cash', 'online') NOT NULL DEFAULT 'shop_cash'");
    }
};
