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
        // Add payment_source to sales_transactions
        Schema::table('sales_transactions', function (Blueprint $table) {
            $table->enum('payment_source', ['shop_cash', 'online'])->default('shop_cash')->after('payment_method');
        });

        // Add payment_source to expenses
        Schema::table('expenses', function (Blueprint $table) {
            $table->enum('payment_source', ['shop_cash', 'online'])->default('shop_cash')->after('amount');
        });

        // Add payment_source to owner_transactions
        Schema::table('owner_transactions', function (Blueprint $table) {
            $table->enum('payment_source', ['shop_cash', 'online'])->default('shop_cash')->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_transactions', function (Blueprint $table) {
            $table->dropColumn('payment_source');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('payment_source');
        });

        Schema::table('owner_transactions', function (Blueprint $table) {
            $table->dropColumn('payment_source');
        });
    }
};
