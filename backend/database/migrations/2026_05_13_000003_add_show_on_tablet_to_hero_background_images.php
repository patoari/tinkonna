<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            $table->boolean('show_on_tablet')->default(true)->after('show_on_mobile');
        });
    }

    public function down(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            $table->dropColumn('show_on_tablet');
        });
    }
};
