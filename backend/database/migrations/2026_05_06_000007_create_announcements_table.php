<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['joy_occasion', 'sorrow_occasion', 'achievement', 'promotional', 'general_message']);
            $table->string('banner_image')->nullable();
            $table->date('display_start_date');
            $table->date('display_end_date')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->integer('view_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['display_start_date', 'display_end_date']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
