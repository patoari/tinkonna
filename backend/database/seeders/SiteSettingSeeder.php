<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'site_name',        'value' => 'Gents Shop',                    'type' => 'text',     'group' => 'general',  'label' => 'Site Name',           'description' => 'The name of your shop displayed across the site'],
            ['key' => 'site_tagline',     'value' => 'Premium Men\'s Fashion',         'type' => 'text',     'group' => 'general',  'label' => 'Tagline',             'description' => 'Short tagline shown below the site name'],
            ['key' => 'site_logo',        'value' => null,                             'type' => 'image',    'group' => 'general',  'label' => 'Site Logo',           'description' => 'Logo image (PNG/SVG recommended, max 2MB)'],
            ['key' => 'favicon',          'value' => null,                             'type' => 'image',    'group' => 'general',  'label' => 'Favicon',             'description' => 'Browser tab icon (PNG/ICO, 32×32px recommended)'],
            ['key' => 'site_currency',    'value' => '৳',                              'type' => 'text',     'group' => 'general',  'label' => 'Currency Symbol',     'description' => 'Currency symbol used throughout the site'],
            ['key' => 'site_language',    'value' => 'en',                             'type' => 'text',     'group' => 'general',  'label' => 'Default Language',    'description' => 'Default language (en or bn)'],

            // Homepage
            ['key' => 'hero_title',           'value' => 'Dress to Impress Every Day',    'type' => 'text',     'group' => 'homepage', 'label' => 'Hero Title',          'description' => 'Main heading on the homepage hero section'],
            ['key' => 'hero_subtitle',        'value' => 'Discover our curated collection of premium men\'s clothing — shirts, pants, panjabi, and more.', 'type' => 'textarea', 'group' => 'homepage', 'label' => 'Hero Subtitle',       'description' => 'Subtext below the hero title'],
            ['key' => 'hero_button_text',     'value' => 'Shop Now',                      'type' => 'text',     'group' => 'homepage', 'label' => 'Hero Button Text',    'description' => 'Call-to-action button label in the hero'],
            ['key' => 'hero_background_image','value' => null,                             'type' => 'image',    'group' => 'homepage', 'label' => 'Hero Background Image','description' => 'Background image for the hero section (optional)'],
            ['key' => 'hero_bg_color',        'value' => '#2563eb',                        'type' => 'color',    'group' => 'homepage', 'label' => 'Hero Background Color','description' => 'Gradient start color for the hero section'],
            ['key' => 'featured_products_title', 'value' => 'Featured Products',           'type' => 'text',     'group' => 'homepage', 'label' => 'Featured Section Title','description' => 'Heading for the featured products section'],
            ['key' => 'show_announcements',   'value' => '1',                              'type' => 'boolean',  'group' => 'homepage', 'label' => 'Show Announcements',  'description' => 'Display announcements on the homepage'],
            ['key' => 'products_per_page',    'value' => '8',                              'type' => 'text',     'group' => 'homepage', 'label' => 'Products Per Page',   'description' => 'Number of products shown on homepage'],

            // Contact
            ['key' => 'contact_address',  'value' => 'Dhaka, Bangladesh',              'type' => 'text',     'group' => 'contact',  'label' => 'Address',             'description' => 'Shop physical address'],
            ['key' => 'contact_phone',    'value' => '+880 1XXX-XXXXXX',               'type' => 'text',     'group' => 'contact',  'label' => 'Phone Number',        'description' => 'Primary contact phone number'],
            ['key' => 'contact_email',    'value' => 'info@gentsshop.com',             'type' => 'text',     'group' => 'contact',  'label' => 'Email Address',       'description' => 'Primary contact email address'],
            ['key' => 'contact_whatsapp', 'value' => '',                               'type' => 'text',     'group' => 'contact',  'label' => 'WhatsApp Number',     'description' => 'WhatsApp number for customer support'],
            ['key' => 'business_hours',   'value' => 'Sat–Thu: 10am – 9pm',           'type' => 'text',     'group' => 'contact',  'label' => 'Business Hours',      'description' => 'Shop opening hours'],

            // Social Media
            ['key' => 'social_facebook',  'value' => '',                               'type' => 'text',     'group' => 'social',   'label' => 'Facebook URL',        'description' => 'Full Facebook page URL'],
            ['key' => 'social_instagram', 'value' => '',                               'type' => 'text',     'group' => 'social',   'label' => 'Instagram URL',       'description' => 'Full Instagram profile URL'],
            ['key' => 'social_youtube',   'value' => '',                               'type' => 'text',     'group' => 'social',   'label' => 'YouTube URL',         'description' => 'Full YouTube channel URL'],
            ['key' => 'social_tiktok',    'value' => '',                               'type' => 'text',     'group' => 'social',   'label' => 'TikTok URL',          'description' => 'Full TikTok profile URL'],

            // SEO
            ['key' => 'meta_title',       'value' => 'Gents Shop – Premium Men\'s Fashion in Bangladesh', 'type' => 'text',     'group' => 'seo',      'label' => 'Meta Title',          'description' => 'Browser tab title and search engine title (max 60 chars)'],
            ['key' => 'meta_description', 'value' => 'Shop premium men\'s clothing and accessories at Gents Shop. Shirts, pants, panjabi, t-shirts and more.',  'type' => 'textarea', 'group' => 'seo',      'label' => 'Meta Description',    'description' => 'Search engine description (max 160 chars)'],
            ['key' => 'meta_keywords',    'value' => 'gents shop, men clothing, shirts, pants, panjabi, bangladesh',  'type' => 'text',     'group' => 'seo',      'label' => 'Meta Keywords',       'description' => 'Comma-separated keywords for search engines'],

            // Footer
            ['key' => 'footer_about',     'value' => 'Your one-stop destination for premium men\'s clothing and accessories in Bangladesh.', 'type' => 'textarea', 'group' => 'footer', 'label' => 'About Text',          'description' => 'Short description shown in the footer'],
            ['key' => 'footer_copyright', 'value' => '© 2026 Gents Shop. All rights reserved.', 'type' => 'text', 'group' => 'footer', 'label' => 'Copyright Text',      'description' => 'Copyright notice at the bottom of the footer'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::firstOrCreate(['key' => $setting['key']], $setting);
        }

        $this->command->info('✅ Site settings seeded!');
    }
}
