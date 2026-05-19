<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            // true = show on desktop, false = desktop only
            $table->boolean('show_on_desktop')->default(true)->after('is_active');
            // true = show on mobile screens
            $table->boolean('show_on_mobile')->default(true)->after('show_on_desktop');
        });
    }

    public function down(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            $table->dropColumn(['show_on_desktop', 'show_on_mobile']);
        });
    }
};
