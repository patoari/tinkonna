<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_avatar_url')->nullable()->after('is_active');
            $table->string('cover_image_url')->nullable()->after('profile_avatar_url');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('profile_avatar_url');
            $table->dropColumn('cover_image_url');
        });
    }
};
