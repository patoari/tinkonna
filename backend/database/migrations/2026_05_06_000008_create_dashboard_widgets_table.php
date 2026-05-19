<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_widgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('component_name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('role_dashboard_widgets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id'); // FK added after roles table exists
            $table->foreignId('dashboard_widget_id')->constrained()->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->json('widget_settings')->nullable();
            $table->timestamps();

            $table->unique(['role_id', 'dashboard_widget_id']);
        });

        Schema::create('user_widget_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('dashboard_widget_id')->constrained()->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_collapsed')->default(false);
            $table->json('custom_settings')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'dashboard_widget_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_widget_preferences');
        Schema::dropIfExists('role_dashboard_widgets');
        Schema::dropIfExists('dashboard_widgets');
    }
};
