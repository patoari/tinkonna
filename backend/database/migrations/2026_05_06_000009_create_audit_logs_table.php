<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action'); // created, updated, deleted, login, etc.
            $table->string('model_type')->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['model_type', 'model_id']);
            $table->index('action');
        });

        Schema::create('mobile_banking_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('provider'); // bkash, nagad, rocket, other
            $table->string('account_name');
            $table->string('account_number');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mobile_banking_accounts');
        Schema::dropIfExists('audit_logs');
    }
};
