<?php

namespace Database\Seeders;

use App\Models\DashboardWidget;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view_dashboard', 'view_products', 'create_products', 'edit_products', 'delete_products',
            'view_sales', 'create_sales', 'view_reports', 'view_expenses', 'create_expenses',
            'edit_expenses', 'delete_expenses', 'view_bookings', 'manage_bookings', 'verify_payments',
            'view_customers', 'view_users', 'manage_users', 'view_roles', 'manage_roles',
            'view_announcements', 'manage_announcements', 'manage_themes', 'manage_settings',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions($permissions);

        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view_dashboard', 'view_products', 'view_sales', 'create_sales',
            'view_expenses', 'create_expenses', 'view_bookings', 'verify_payments',
            'view_customers',
        ]);

        $clerkRole = Role::firstOrCreate(['name' => 'clerk', 'guard_name' => 'web']);
        $clerkRole->syncPermissions([
            'view_dashboard', 'view_products', 'view_sales', 'create_sales',
        ]);

        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@gentsshop.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'user_type' => 'admin',
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin');

        // Create staff user
        $staff = User::firstOrCreate(
            ['email' => 'staff@gentsshop.com'],
            [
                'name' => 'Staff Member',
                'password' => Hash::make('staff123'),
                'user_type' => 'staff',
                'is_active' => true,
            ]
        );
        $staff->assignRole('staff');

        // Create sample customer
        $customer = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Sample Customer',
                'password' => Hash::make('customer123'),
                'user_type' => 'customer',
                'is_active' => true,
            ]
        );
        $customer->assignRole('customer');
        $customer->customerProfile()->firstOrCreate([]);

        // Create themes
        $themes = [
            [
                'name' => 'Default Theme',
                'slug' => 'default',
                'occasion' => 'default',
                'is_default' => true,
                'flying_symbols_enabled' => false,
                'css_variables' => ['primary' => '#3b82f6', 'secondary' => '#1e40af'],
            ],
            [
                'name' => 'Eid-ul-Fitr',
                'slug' => 'eid-ul-fitr',
                'occasion' => 'eid_ul_fitr',
                'flying_symbols_enabled' => true,
                'max_flying_symbols' => 15,
                'css_variables' => ['primary' => '#10b981', 'secondary' => '#065f46', 'accent' => '#fbbf24'],
            ],
            [
                'name' => 'Eid-ul-Adha',
                'slug' => 'eid-ul-adha',
                'occasion' => 'eid_ul_adha',
                'flying_symbols_enabled' => true,
                'max_flying_symbols' => 12,
                'css_variables' => ['primary' => '#059669', 'secondary' => '#064e3b', 'accent' => '#d97706'],
            ],
            [
                'name' => 'Pohela Boishakh',
                'slug' => 'pohela-boishakh',
                'occasion' => 'pohela_boishakh',
                'flying_symbols_enabled' => true,
                'max_flying_symbols' => 15,
                'css_variables' => ['primary' => '#dc2626', 'secondary' => '#7f1d1d', 'accent' => '#fbbf24'],
            ],
            [
                'name' => 'Independence Day',
                'slug' => 'independence-day',
                'occasion' => 'independence_day',
                'flying_symbols_enabled' => true,
                'max_flying_symbols' => 10,
                'css_variables' => ['primary' => '#16a34a', 'secondary' => '#14532d', 'accent' => '#dc2626'],
            ],
            [
                'name' => 'Victory Day',
                'slug' => 'victory-day',
                'occasion' => 'victory_day',
                'flying_symbols_enabled' => true,
                'max_flying_symbols' => 10,
                'css_variables' => ['primary' => '#16a34a', 'secondary' => '#14532d', 'accent' => '#dc2626'],
            ],
            [
                'name' => 'Mother Language Day',
                'slug' => 'mother-language-day',
                'occasion' => 'mother_language_day',
                'flying_symbols_enabled' => true,
                'max_flying_symbols' => 12,
                'css_variables' => ['primary' => '#7c3aed', 'secondary' => '#4c1d95', 'accent' => '#f59e0b'],
            ],
        ];

        foreach ($themes as $themeData) {
            Theme::firstOrCreate(['slug' => $themeData['slug']], $themeData);
        }

        // Create dashboard widgets
        $widgets = [
            ['name' => 'Daily Sales Summary', 'slug' => 'daily-sales', 'component_name' => 'DailySalesWidget'],
            ['name' => 'Inventory Alerts', 'slug' => 'inventory-alerts', 'component_name' => 'InventoryAlertsWidget'],
            ['name' => 'Recent Transactions', 'slug' => 'recent-transactions', 'component_name' => 'RecentTransactionsWidget'],
            ['name' => 'Pending Bookings', 'slug' => 'pending-bookings', 'component_name' => 'PendingBookingsWidget'],
            ['name' => 'Payment Verification Queue', 'slug' => 'payment-queue', 'component_name' => 'PaymentQueueWidget'],
            ['name' => 'Expense Summary', 'slug' => 'expense-summary', 'component_name' => 'ExpenseSummaryWidget'],
            ['name' => 'Low Stock Alerts', 'slug' => 'low-stock', 'component_name' => 'LowStockWidget'],
            ['name' => 'Revenue Chart', 'slug' => 'revenue-chart', 'component_name' => 'RevenueChartWidget'],
            ['name' => 'Top Selling Products', 'slug' => 'top-products', 'component_name' => 'TopProductsWidget'],
        ];

        foreach ($widgets as $widget) {
            DashboardWidget::firstOrCreate(['slug' => $widget['slug']], $widget);
        }

        $this->call(SiteSettingSeeder::class);

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('Admin: admin@gentsshop.com / admin123');
        $this->command->info('Staff: staff@gentsshop.com / staff123');
    }
}
