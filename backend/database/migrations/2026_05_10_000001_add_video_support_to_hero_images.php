<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            // Add media type column
            $table->enum('media_type', ['image', 'video'])->default('image')->after('id');

            // Add video-specific fields
            $table->string('thumbnail_path')->nullable()->after('image_path');
            $table->string('video_url')->nullable()->after('thumbnail_path');
            $table->integer('duration')->nullable()->comment('Video duration in seconds')->after('video_url');

            // Rename image_path to media_path for clarity (optional)
            // Or keep both and use media_path for videos
            $table->string('media_path')->nullable()->after('duration');
        });
    }

    public function down(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            $table->dropColumn(['media_type', 'thumbnail_path', 'video_url', 'duration', 'media_path']);
        });
    }
};
