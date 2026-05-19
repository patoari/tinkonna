<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            // Make path and image_path nullable to support videos with URLs
            $table->string('path')->nullable()->change();
            $table->string('image_path')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            // Restore NOT NULL constraint (be careful with existing data)
            $table->string('path')->nullable(false)->change();
            $table->string('image_path')->nullable(false)->change();
        });
    }
};
