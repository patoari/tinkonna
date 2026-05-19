<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('occasion', ['eid_ul_fitr', 'eid_ul_adha', 'pohela_boishakh', 'independence_day', 'victory_day', 'mother_language_day', 'default', 'custom']);
            $table->json('css_variables')->nullable(); // colors, borders, etc.
            $table->string('banner_image')->nullable();
            $table->boolean('flying_symbols_enabled')->default(true);
            $table->integer('max_flying_symbols')->default(15);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('theme_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('theme_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
        });

        Schema::create('theme_icons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('theme_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('original_name');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_icons');
        Schema::dropIfExists('theme_configurations');
        Schema::dropIfExists('themes');
    }
};
