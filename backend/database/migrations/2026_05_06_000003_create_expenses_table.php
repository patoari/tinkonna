<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->enum('category', ['staff_salary', 'breakfast', 'lunch', 'dinner', 'utility_bills', 'shipping_cost', 'other']);
            $table->string('category_other')->nullable(); // when category = other
            $table->decimal('amount', 10, 2);
            $table->text('description')->nullable();
            $table->date('expense_date');
            $table->timestamps();
            $table->softDeletes();

            $table->index('expense_date');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
