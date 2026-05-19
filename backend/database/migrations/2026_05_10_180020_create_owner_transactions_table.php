<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('owner_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who recorded it
            $table->enum('type', ['withdrawal', 'loan', 'deposit', 'loan_repayment']); // Transaction type
            $table->decimal('amount', 12, 2); // Amount
            $table->string('recipient_name')->nullable(); // For loans - who received the money
            $table->string('recipient_phone')->nullable(); // Contact info
            $table->text('purpose')->nullable(); // Why the money was taken/given
            $table->text('notes')->nullable(); // Additional notes
            $table->date('transaction_date'); // When it happened
            $table->date('expected_return_date')->nullable(); // For loans - when expected back
            $table->date('actual_return_date')->nullable(); // For loans - when actually returned
            $table->enum('status', ['pending', 'completed', 'partial', 'overdue'])->default('pending'); // For loans
            $table->foreignId('related_transaction_id')->nullable()->constrained('owner_transactions')->onDelete('set null'); // Link repayment to original loan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owner_transactions');
    }
};
