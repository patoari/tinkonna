<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            $table->string('path')->after('id');
            $table->integer('sort_order')->default(0)->after('path');
            $table->boolean('is_active')->default(true)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('hero_background_images', function (Blueprint $table) {
            $table->dropColumn(['path', 'sort_order', 'is_active']);
        });
    }
};
