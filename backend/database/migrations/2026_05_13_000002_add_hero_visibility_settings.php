<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\SiteSetting;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            [
                'key'         => 'hero_show_title',
                'value'       => '1',
                'type'        => 'boolean',
                'group'       => 'homepage',
                'label'       => 'Show Hero Title & Subtitle',
                'description' => 'Display the title and subtitle text on the hero section',
            ],
            [
                'key'         => 'hero_show_search',
                'value'       => '1',
                'type'        => 'boolean',
                'group'       => 'homepage',
                'label'       => 'Show Hero Search Bar',
                'description' => 'Display the search bar on the hero section',
            ],
            [
                'key'         => 'hero_show_buttons',
                'value'       => '1',
                'type'        => 'boolean',
                'group'       => 'homepage',
                'label'       => 'Show Hero Buttons',
                'description' => 'Display the Shop Now and action buttons on the hero section',
            ],
        ];

        foreach ($settings as $s) {
            SiteSetting::firstOrCreate(['key' => $s['key']], $s);
        }
    }

    public function down(): void
    {
        SiteSetting::whereIn('key', [
            'hero_show_title',
            'hero_show_search',
            'hero_show_buttons',
        ])->delete();

        \Illuminate\Support\Facades\Cache::forget('site_settings');
    }
};
