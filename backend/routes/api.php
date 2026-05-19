<?php

use App\Http\Controllers\Api\HeroImageController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BookingPaymentController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MobileBankingController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\OwnerTransactionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('public')->group(function () {
    Route::get('products', [PublicController::class, 'products']);
    Route::get('products/{product}', [PublicController::class, 'product']);
    Route::get('announcements', [PublicController::class, 'announcements']);
    Route::get('active-theme', [PublicController::class, 'activeTheme']);
    Route::get('settings', [SiteSettingController::class, 'public']);
    Route::get('categories', [CategoryController::class, 'public']);
    Route::get('mobile-banking-accounts', [MobileBankingController::class, 'publicAccounts']);
    Route::get('bank-accounts', [BankAccountController::class, 'publicAccounts']);
    Route::get('hero-images', [HeroImageController::class, 'public']);
    // Allow guests to POST push subscriptions (stores without user if not authenticated)
    Route::post('push-subscriptions', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'store']);
    // Web Push VAPID public key
    Route::get('push/vapid-key', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'vapidPublicKey']);
});

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::post('profile/avatar', [AuthController::class, 'uploadProfileAvatar']);
        Route::post('profile/cover-image', [AuthController::class, 'uploadCoverImage']);
    });
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Products - availability check must come BEFORE apiResource to avoid route conflict
    Route::get('products/availability', [ProductController::class, 'checkAvailability']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::post('products', [ProductController::class, 'store'])->middleware('permission:create_products');
    Route::put('products/{product}', [ProductController::class, 'update'])->middleware('permission:edit_products');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->middleware('permission:delete_products');
    Route::post('products/{product}/variants', [ProductController::class, 'addVariant'])->middleware('permission:edit_products');
    Route::put('products/{product}/variants/{variant}', [ProductController::class, 'updateVariant'])->middleware('permission:edit_products');
    Route::get('products/{product}/variants/{variant}/label', [ProductController::class, 'printLabel']);

    // Sales
    Route::get('sales/daily-summary', [SalesController::class, 'dailySummary']);
    Route::get('sales', [SalesController::class, 'index'])->middleware('permission:view_sales');
    Route::post('sales', [SalesController::class, 'store'])->middleware('permission:create_sales');
    Route::get('sales/{sale}', [SalesController::class, 'show'])->middleware('permission:view_sales');

    // Reports
    Route::prefix('reports')->middleware('permission:view_reports')->group(function () {
        Route::get('daily', [ReportController::class, 'daily']);
        Route::get('weekly', [ReportController::class, 'weekly']);
        Route::get('monthly', [ReportController::class, 'monthly']);
        Route::get('yearly', [ReportController::class, 'yearly']);
        Route::get('cashflow', [ReportController::class, 'cashFlow']);
    });

    // Expenses
    Route::get('expenses', [ExpenseController::class, 'index'])->middleware('permission:view_expenses');
    Route::post('expenses', [ExpenseController::class, 'store'])->middleware('permission:create_expenses');
    Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->middleware('permission:edit_expenses');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->middleware('permission:delete_expenses');

    // Bookings
    Route::apiResource('bookings', BookingController::class)->only(['index', 'store']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::get('customer/bookings', [BookingController::class, 'customerBookings']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications', [NotificationController::class, 'store']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Push subscriptions (store/remove for web push)
    Route::post('push-subscriptions', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'store']);
    Route::delete('push-subscriptions', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'destroy']);

    // Booking Payments
    Route::apiResource('booking-payments', BookingPaymentController::class)->only(['index', 'store']);
    Route::post('booking-payments/{bookingPayment}/approve', [BookingPaymentController::class, 'approve'])->middleware('permission:verify_payments');
    Route::post('booking-payments/{bookingPayment}/reject', [BookingPaymentController::class, 'reject'])->middleware('permission:verify_payments');

    // Cart
    Route::apiResource('cart', CartController::class)->only(['index', 'store', 'update', 'destroy']);

    // Customer
    Route::get('customer/orders', function (\Illuminate\Http\Request $request) {
        $orders = \App\Models\SalesTransaction::with('items')
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json($orders);
    });
    Route::get('customer/addresses', function (\Illuminate\Http\Request $request) {
        return response()->json($request->user()->deliveryAddresses);
    });

    // Purchase Orders (cart checkout)
    Route::post('customer/orders', [PurchaseOrderController::class, 'store']);
    Route::post('customer/orders/from-booking', [PurchaseOrderController::class, 'storeFromBooking']);
    Route::get('customer/purchase-orders', [PurchaseOrderController::class, 'customerOrders']);

    // Admin: Purchase Orders management
    Route::get('purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::post('purchase-orders/{purchaseOrder}/verify-payment', [PurchaseOrderController::class, 'verifyPayment'])->middleware('permission:verify_payments');
    Route::post('purchase-orders/{purchaseOrder}/reject-payment', [PurchaseOrderController::class, 'rejectPayment'])->middleware('permission:verify_payments');
    Route::patch('purchase-orders/{purchaseOrder}/status', [PurchaseOrderController::class, 'updateStatus']);

    // Dashboard
    Route::get('admin/dashboard', [DashboardController::class, 'index'])->middleware('permission:view_dashboard');
    Route::get('admin/dashboard/monthly-revenue', [DashboardController::class, 'monthlyRevenue'])->middleware('permission:view_dashboard');
    Route::get('admin/dashboard/daily-revenue', [DashboardController::class, 'dailyRevenue'])->middleware('permission:view_dashboard');

    // Users
    Route::get('users', [UserController::class, 'index'])->middleware('permission:view_users');
    Route::post('users', [UserController::class, 'store'])->middleware('permission:manage_users');
    Route::get('users/{user}', [UserController::class, 'show'])->middleware('permission:view_users');
    Route::put('users/{user}', [UserController::class, 'update'])->middleware('permission:manage_users');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:manage_users');
    Route::get('customers', [UserController::class, 'customers'])->middleware('permission:view_customers');

    // Roles
    Route::get('roles', [RoleController::class, 'index'])->middleware('permission:view_roles');
    Route::post('roles', [RoleController::class, 'store'])->middleware('permission:manage_roles');
    Route::get('roles/{role}', [RoleController::class, 'show'])->middleware('permission:view_roles');
    Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('permission:manage_roles');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:manage_roles');

    // Announcements
    Route::get('announcements', [AnnouncementController::class, 'index'])->middleware('permission:view_announcements');
    Route::post('announcements', [AnnouncementController::class, 'store'])->middleware('permission:manage_announcements');
    Route::get('announcements/{announcement}', [AnnouncementController::class, 'show'])->middleware('permission:view_announcements');
    Route::put('announcements/{announcement}', [AnnouncementController::class, 'update'])->middleware('permission:manage_announcements');
    Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy'])->middleware('permission:manage_announcements');
    Route::post('announcements/{announcement}/toggle-hide', [AnnouncementController::class, 'toggleHide'])->middleware('permission:manage_announcements');

    // Themes
    Route::apiResource('themes', ThemeController::class)->only(['index', 'show', 'update']);
    Route::post('theme-configurations', [ThemeController::class, 'storeConfiguration'])->middleware('permission:manage_themes');
    Route::delete('theme-configurations/{config}', [ThemeController::class, 'destroyConfiguration'])->middleware('permission:manage_themes');
    Route::post('theme-icons', [ThemeController::class, 'uploadIcon'])->middleware('permission:manage_themes');
    Route::delete('theme-icons/{icon}', [ThemeController::class, 'deleteIcon'])->middleware('permission:manage_themes');

    // Mobile Banking
    Route::apiResource('mobile-banking-accounts', MobileBankingController::class)->only(['index', 'store', 'update', 'destroy']);

    // Bank Accounts
    Route::apiResource('bank-accounts', BankAccountController::class)->only(['index', 'store', 'update', 'destroy']);

    // Categories
    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store'])->middleware('permission:create_products');
    Route::get('categories/{category}', [CategoryController::class, 'show']);
    Route::put('categories/{category}', [CategoryController::class, 'update'])->middleware('permission:edit_products');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:delete_products');
    Route::post('categories/reorder', [CategoryController::class, 'reorder'])->middleware('permission:edit_products');

    // Site Settings
    Route::get('site-settings', [SiteSettingController::class, 'index'])->middleware('permission:manage_settings');
    Route::post('site-settings', [SiteSettingController::class, 'update'])->middleware('permission:manage_settings');
    Route::post('site-settings/upload-image', [SiteSettingController::class, 'uploadImage'])->middleware('permission:manage_settings');
    Route::post('site-settings/delete-image', [SiteSettingController::class, 'deleteImage'])->middleware('permission:manage_settings');

    // Hero background images (carousel)
    Route::get('hero-images', [HeroImageController::class, 'index'])->middleware('permission:manage_settings');
    Route::post('hero-images', [HeroImageController::class, 'store'])->middleware('permission:manage_settings');
    Route::delete('hero-images/{heroImage}', [HeroImageController::class, 'destroy'])->middleware('permission:manage_settings');
    Route::post('hero-images/reorder', [HeroImageController::class, 'reorder'])->middleware('permission:manage_settings');
    Route::post('hero-images/{heroImage}/toggle', [HeroImageController::class, 'toggle'])->middleware('permission:manage_settings');
    Route::post('hero-images/{heroImage}/toggle-mobile', [HeroImageController::class, 'toggleMobile'])->middleware('permission:manage_settings');
    Route::post('hero-images/{heroImage}/toggle-tablet', [HeroImageController::class, 'toggleTablet'])->middleware('permission:manage_settings');
    Route::post('hero-images/{heroImage}/toggle-desktop', [HeroImageController::class, 'toggleDesktop'])->middleware('permission:manage_settings');

    // Owner Transactions (withdrawals, loans, deposits)
    Route::get('owner-transactions/summary', [OwnerTransactionController::class, 'summary']);
    Route::get('owner-transactions/active-loans', [OwnerTransactionController::class, 'activeLoans']);
    Route::post('owner-transactions/{loan}/repayment', [OwnerTransactionController::class, 'recordRepayment']);
    Route::apiResource('owner-transactions', OwnerTransactionController::class);
});
