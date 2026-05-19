<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert default hero carousel settings
        DB::table('site_settings')->insert([
            [
                'key' => 'hero_carousel_interval',
                'value' => '5000',
                'type' => 'number',
                'group' => 'homepage',
                'label' => 'Hero Carousel Interval (ms)',
                'description' => 'Time in milliseconds before changing to next slide (1000ms = 1 second)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'hero_carousel_transition',
                'value' => 'slide',
                'type' => 'select',
                'group' => 'homepage',
                'label' => 'Hero Carousel Transition Style',
                'description' => 'Animation style when changing slides',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('site_settings')
            ->whereIn('key', ['hero_carousel_interval', 'hero_carousel_transition'])
            ->delete();
    }
};
