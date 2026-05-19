-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 14, 2026 at 04:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gents_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` enum('joy_occasion','sorrow_occasion','achievement','promotional','general_message') NOT NULL,
  `banner_image` varchar(255) DEFAULT NULL,
  `display_start_date` date NOT NULL,
  `display_end_date` date DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `created_by`, `title`, `content`, `type`, `banner_image`, `display_start_date`, `display_end_date`, `is_hidden`, `view_count`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'eidul adha', 'adf asdf asdf afd sd', 'joy_occasion', 'announcements/fygXh9OQNsVmcBLwg3spYL9C7oNXNG7pRFdXDtku.jpg', '2026-05-06', NULL, 0, 0, '2026-05-06 14:27:10', '2026-05-06 14:27:57', '2026-05-06 14:27:57'),
(2, 1, 'Eid-ul Adha', 'ত্যাগের এই মহিমাময় দিনে আপনার ও আপনার পরিবারের জীবনে বয়ে আসুক সুখ, শান্তি ও সমৃদ্ধি।\r\nআল্লাহ আপনার সকল ইবাদত ও কোরবানি কবুল করুন।', 'general_message', 'announcements/wfYtdZga2aYzdRQyaiNsBoFxAeMpI0QOqhQir2N7.svg', '2026-05-07', '2026-06-02', 0, 0, '2026-05-07 05:42:31', '2026-05-07 08:39:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `model_type` varchar(255) DEFAULT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `bank_name`, `account_name`, `account_number`, `branch`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'MUTUAL TRUST BANK', 'TITU PATOARI', '1234567890', NULL, 1, '2026-05-12 03:52:06', '2026-05-13 04:48:56');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_number` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `booking_type` enum('free','paid') NOT NULL,
  `booking_fee` decimal(10,2) DEFAULT NULL,
  `product_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending_payment','active','completed','cancelled','expired') NOT NULL DEFAULT 'pending_payment',
  `booking_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expiry_date` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_number`, `user_id`, `product_variant_id`, `quantity`, `booking_type`, `booking_fee`, `product_price`, `status`, `booking_date`, `expiry_date`, `completed_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'BKG-20260506-0001', 1, 11, 1, 'free', NULL, 0.00, 'cancelled', '2026-05-08 18:09:26', '2026-05-07 11:05:35', NULL, '2026-05-06 11:05:35', '2026-05-08 12:09:26', NULL),
(2, 'BKG-20260506-0002', 1, 6, 1, 'free', NULL, 0.00, 'cancelled', '2026-05-08 18:09:21', '2026-05-07 11:11:43', NULL, '2026-05-06 11:11:43', '2026-05-08 12:09:21', NULL),
(3, 'BKG-20260508-0001', 5, 64, 1, 'free', NULL, 0.00, 'cancelled', '2026-05-08 17:43:42', '2026-05-09 08:04:21', NULL, '2026-05-08 08:04:21', '2026-05-08 11:43:42', NULL),
(4, 'BKG-20260508-0002', 5, 61, 1, 'paid', 100.00, 500.00, 'cancelled', '2026-05-08 17:43:41', NULL, NULL, '2026-05-08 11:42:19', '2026-05-08 11:43:41', NULL),
(5, 'BKG-20260508-0003', 5, 56, 1, 'paid', 110.00, 550.00, 'cancelled', '2026-05-08 17:43:39', NULL, NULL, '2026-05-08 11:42:47', '2026-05-08 11:43:39', NULL),
(6, 'BKG-20260508-0004', 5, 33, 1, 'paid', 240.00, 1200.00, 'cancelled', '2026-05-08 17:45:29', NULL, NULL, '2026-05-08 11:44:02', '2026-05-08 11:45:29', NULL),
(7, 'BKG-20260508-0005', 5, 12, 1, 'paid', 110.00, 550.00, 'cancelled', '2026-05-08 18:07:24', NULL, NULL, '2026-05-08 11:45:48', '2026-05-08 12:07:24', NULL),
(8, 'BKG-20260508-0006', 5, 12, 1, 'paid', 110.00, 550.00, 'active', '2026-05-08 20:37:05', '2026-05-15 14:37:05', NULL, '2026-05-08 12:07:33', '2026-05-08 14:37:05', NULL),
(9, 'BKG-20260509-0001', 1, 75, 1, 'paid', 84.00, 419.99, 'pending_payment', '2026-05-08 22:13:52', NULL, NULL, '2026-05-08 22:13:52', '2026-05-08 22:13:52', NULL),
(10, 'BKG-20260509-0002', 5, 75, 1, 'paid', 84.00, 419.99, 'active', '2026-05-09 05:04:49', '2026-05-15 23:04:49', NULL, '2026-05-08 22:22:02', '2026-05-08 23:04:49', NULL),
(11, 'BKG-20260509-0003', 5, 56, 1, 'paid', 110.00, 550.00, 'active', '2026-05-09 05:27:56', '2026-05-15 23:27:56', NULL, '2026-05-08 23:22:07', '2026-05-08 23:27:56', NULL),
(12, 'BKG-20260510-0001', 6, 72, 1, 'paid', 90.00, 450.00, 'pending_payment', '2026-05-10 06:21:31', NULL, NULL, '2026-05-10 06:21:31', '2026-05-10 06:21:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_payments`
--

CREATE TABLE `booking_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `payment_method` enum('bkash','nagad','rocket','other') NOT NULL,
  `transaction_reference` varchar(255) NOT NULL,
  `sender_number` varchar(255) DEFAULT NULL,
  `payment_screenshot` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_payments`
--

INSERT INTO `booking_payments` (`id`, `booking_id`, `payment_method`, `transaction_reference`, `sender_number`, `payment_screenshot`, `amount`, `status`, `verified_by`, `verified_at`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 8, 'bkash', 'sdgsdfg', '01645512233', 'payment-screenshots/z4thZCkFtGLqARgVSPQhbdmx6quRlX2uB95lM6iv.jpeg', 110.00, 'verified', 1, '2026-05-08 14:37:05', NULL, '2026-05-08 12:08:10', '2026-05-08 14:37:05'),
(2, 10, 'bkash', 'ASD456R8YU96', '01645512233', 'payment-screenshots/ocHpGikiiGfooRb391XYmjKvwjB4m511yysNJimE.jpeg', 84.00, 'verified', 1, '2026-05-08 23:04:49', NULL, '2026-05-08 22:22:31', '2026-05-08 23:04:49'),
(3, 11, 'nagad', 'DFR456RT63Y98', '01645512233', 'payment-screenshots/ijPsewiXYRtRokJBpK42pFwIe9jQfLexCbTuGY5v.jpeg', 110.00, 'verified', 1, '2026-05-08 23:27:56', NULL, '2026-05-08 23:22:44', '2026-05-08 23:27:56');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('gents-shop-cache-site_settings_all', 'a:33:{s:9:\"site_name\";s:13:\"YOUNA FASHION\";s:12:\"site_tagline\";s:21:\"Premium Men\'s Fashion\";s:9:\"site_logo\";s:49:\"site/m79Qav8PrNEfiavCpp0wQslDSV4BVnWYqWoVmnhr.png\";s:7:\"favicon\";s:49:\"site/xbq906CLbdLLK8OKjG8nxWvsWQYszCgr18kaHnob.png\";s:13:\"site_currency\";s:3:\"৳\";s:13:\"site_language\";s:2:\"en\";s:10:\"hero_title\";s:38:\"Explore Our Newest Clothing Collection\";s:13:\"hero_subtitle\";s:24:\"Exclusive Offers For You\";s:16:\"hero_button_text\";s:8:\"Shop Now\";s:21:\"hero_background_image\";N;s:13:\"hero_bg_color\";s:7:\"#f10000\";s:23:\"featured_products_title\";s:17:\"Featured Products\";s:18:\"show_announcements\";s:1:\"1\";s:17:\"products_per_page\";s:1:\"8\";s:15:\"contact_address\";s:39:\"Polli Biddyut, Savar, Dhaka, Bangladesh\";s:13:\"contact_phone\";s:15:\"+880 1838104366\";s:13:\"contact_email\";s:18:\"info@gentsshop.com\";s:16:\"contact_whatsapp\";s:0:\"\";s:14:\"business_hours\";s:23:\"Sat–Thu: 10am – 9pm\";s:15:\"social_facebook\";s:0:\"\";s:16:\"social_instagram\";s:0:\"\";s:14:\"social_youtube\";s:0:\"\";s:13:\"social_tiktok\";s:0:\"\";s:10:\"meta_title\";s:53:\"Youna Fashion – Premium Men\'s Fashion in Bangladesh\";s:16:\"meta_description\";s:101:\"Shop premium men\'s clothing and accessories at Gents Shop. Shirts, pants, panjabi, t-shirts and more.\";s:13:\"meta_keywords\";s:60:\"gents shop, men clothing, shirts, pants, panjabi, bangladesh\";s:12:\"footer_about\";s:83:\"Your one-stop destination for premium men\'s clothing and accessories in Bangladesh.\";s:16:\"footer_copyright\";s:42:\"YOUNA FASHION HOUSE, Premium Men\'s Fashion\";s:22:\"hero_carousel_interval\";s:4:\"6999\";s:24:\"hero_carousel_transition\";s:5:\"slide\";s:15:\"hero_show_title\";s:1:\"0\";s:16:\"hero_show_search\";s:1:\"0\";s:17:\"hero_show_buttons\";s:1:\"0\";}', 1778771221);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `user_id`, `product_variant_id`, `quantity`, `created_at`, `updated_at`) VALUES
(4, 5, 64, 1, '2026-05-08 08:01:56', '2026-05-08 08:01:56'),
(5, 5, 61, 1, '2026-05-08 11:21:40', '2026-05-08 11:21:40');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_bn` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `name_bn`, `slug`, `icon`, `image`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Shirts', NULL, 'shirts', '👚', NULL, NULL, 0, 1, '2026-05-06 18:06:56', '2026-05-09 00:00:21', NULL),
(2, 'Pants', NULL, 'pants', '👖', NULL, NULL, 1, 1, '2026-05-06 18:06:56', '2026-05-09 00:00:21', NULL),
(3, 'T-Shirts', NULL, 't-shirts', '👕', NULL, NULL, 2, 1, '2026-05-06 18:06:56', '2026-05-09 00:00:21', NULL),
(4, 'Panjabi', NULL, 'panjabi', '👔', NULL, NULL, 3, 1, '2026-05-06 18:06:56', '2026-05-09 00:00:21', NULL),
(5, 'Accessories', NULL, 'accessories', '🎀', NULL, NULL, 4, 1, '2026-05-06 18:06:56', '2026-05-09 00:00:21', NULL),
(6, 'Three Quarter Mens Pant', NULL, 'three-quarter-mens-pant', '👖', 'categories/sHuqVPSxsfnJqE86PSEShpW5nFBqcVz5JbeLbRmw.jpg', NULL, 5, 1, '2026-05-08 14:48:38', '2026-05-09 00:00:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer_profiles`
--

CREATE TABLE `customer_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_profiles`
--

INSERT INTO `customer_profiles` (`id`, `user_id`, `avatar`, `bio`, `created_at`, `updated_at`) VALUES
(2, 5, NULL, NULL, '2026-05-07 08:57:53', '2026-05-07 08:57:53'),
(3, 6, NULL, NULL, '2026-05-09 03:10:39', '2026-05-09 03:10:39');

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_widgets`
--

CREATE TABLE `dashboard_widgets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `component_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dashboard_widgets`
--

INSERT INTO `dashboard_widgets` (`id`, `name`, `slug`, `component_name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Daily Sales Summary', 'daily-sales', 'DailySalesWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(2, 'Inventory Alerts', 'inventory-alerts', 'InventoryAlertsWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(3, 'Recent Transactions', 'recent-transactions', 'RecentTransactionsWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(4, 'Pending Bookings', 'pending-bookings', 'PendingBookingsWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(5, 'Payment Verification Queue', 'payment-queue', 'PaymentQueueWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(6, 'Expense Summary', 'expense-summary', 'ExpenseSummaryWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(7, 'Low Stock Alerts', 'low-stock', 'LowStockWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(8, 'Revenue Chart', 'revenue-chart', 'RevenueChartWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(9, 'Top Selling Products', 'top-products', 'TopProductsWidget', NULL, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_addresses`
--

CREATE TABLE `delivery_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(255) NOT NULL DEFAULT 'home',
  `street_address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `category` enum('staff_salary','breakfast','lunch','dinner','utility_bills','shipping_cost','other') NOT NULL,
  `category_other` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_source` enum('shop_cash','online','bank') NOT NULL DEFAULT 'shop_cash',
  `description` text DEFAULT NULL,
  `expense_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `user_id`, `category`, `category_other`, `amount`, `payment_source`, `description`, `expense_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'breakfast', NULL, 150.00, 'shop_cash', NULL, '2026-05-06', '2026-05-06 13:01:34', '2026-05-06 13:01:34', NULL),
(2, 8, 'other', 'withdrow for family', 30000.98, 'shop_cash', NULL, '2026-05-09', '2026-05-09 08:28:02', '2026-05-09 08:28:02', NULL),
(3, 8, 'lunch', NULL, 6909.00, 'shop_cash', NULL, '2026-05-11', '2026-05-11 14:04:35', '2026-05-11 14:04:35', NULL),
(4, 13, 'breakfast', NULL, 250.00, 'shop_cash', NULL, '2026-05-12', '2026-05-12 05:05:03', '2026-05-12 05:05:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hero_background_images`
--

CREATE TABLE `hero_background_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `media_type` enum('image','video') NOT NULL DEFAULT 'image',
  `path` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `thumbnail_path` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Video duration in seconds',
  `media_path` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `show_on_desktop` tinyint(1) NOT NULL DEFAULT 1,
  `show_on_mobile` tinyint(1) NOT NULL DEFAULT 1,
  `show_on_tablet` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hero_background_images`
--

INSERT INTO `hero_background_images` (`id`, `media_type`, `path`, `image_path`, `thumbnail_path`, `video_url`, `duration`, `media_path`, `sort_order`, `is_active`, `show_on_desktop`, `show_on_mobile`, `show_on_tablet`, `created_at`, `updated_at`) VALUES
(58, 'image', 'hero-backgrounds/KoMjEwAJZVKqRhhyribSUOgmC4X5LTO5iBweKL7g.gif', 'hero-backgrounds/KoMjEwAJZVKqRhhyribSUOgmC4X5LTO5iBweKL7g.gif', NULL, NULL, NULL, 'hero-backgrounds/KoMjEwAJZVKqRhhyribSUOgmC4X5LTO5iBweKL7g.gif', 6, 0, 1, 1, 1, '2026-05-13 06:04:40', '2026-05-13 08:31:41'),
(62, 'image', 'hero-backgrounds/OTjWMkeYoZa5FZixpb39g5QgDiqrLnqV9W1FQt0a.gif', 'hero-backgrounds/OTjWMkeYoZa5FZixpb39g5QgDiqrLnqV9W1FQt0a.gif', NULL, NULL, NULL, 'hero-backgrounds/OTjWMkeYoZa5FZixpb39g5QgDiqrLnqV9W1FQt0a.gif', 7, 0, 1, 0, 0, '2026-05-13 07:28:50', '2026-05-13 08:31:43'),
(68, 'image', 'hero-backgrounds/Odz0p3xyaQweWXRtyyNC0GaxYeztRMNVlLdUiauy.gif', 'hero-backgrounds/Odz0p3xyaQweWXRtyyNC0GaxYeztRMNVlLdUiauy.gif', NULL, NULL, NULL, 'hero-backgrounds/Odz0p3xyaQweWXRtyyNC0GaxYeztRMNVlLdUiauy.gif', 9, 0, 1, 1, 1, '2026-05-13 08:55:17', '2026-05-13 12:25:48'),
(70, 'image', 'hero-backgrounds/28JvOZzhaFtYZJkJVKjI5wqNBeljvybC7LtWAwa7.gif', 'hero-backgrounds/28JvOZzhaFtYZJkJVKjI5wqNBeljvybC7LtWAwa7.gif', NULL, NULL, NULL, 'hero-backgrounds/28JvOZzhaFtYZJkJVKjI5wqNBeljvybC7LtWAwa7.gif', 10, 0, 1, 1, 1, '2026-05-13 09:04:18', '2026-05-13 11:17:47'),
(71, 'image', 'hero-backgrounds/uOwHfT18HYURdpWsPIqGJGHMoCkMm8pz9LUz6Z8U.svg', 'hero-backgrounds/uOwHfT18HYURdpWsPIqGJGHMoCkMm8pz9LUz6Z8U.svg', NULL, NULL, NULL, 'hero-backgrounds/uOwHfT18HYURdpWsPIqGJGHMoCkMm8pz9LUz6Z8U.svg', 11, 1, 1, 1, 1, '2026-05-13 12:25:13', '2026-05-13 12:25:13'),
(73, 'image', 'hero-backgrounds/Jo24KIRY0dGu7GFWKKScRpNsIPjGYLBmADtg9ECu.gif', 'hero-backgrounds/Jo24KIRY0dGu7GFWKKScRpNsIPjGYLBmADtg9ECu.gif', NULL, NULL, NULL, 'hero-backgrounds/Jo24KIRY0dGu7GFWKKScRpNsIPjGYLBmADtg9ECu.gif', 12, 1, 1, 1, 1, '2026-05-13 12:59:20', '2026-05-13 12:59:20');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_05_06_000001_create_products_table', 1),
(5, '2026_05_06_000002_create_sales_tables', 1),
(6, '2026_05_06_000003_create_expenses_table', 1),
(7, '2026_05_06_000004_create_bookings_table', 1),
(8, '2026_05_06_000005_create_cart_table', 1),
(9, '2026_05_06_000006_create_themes_table', 1),
(10, '2026_05_06_000007_create_announcements_table', 1),
(11, '2026_05_06_000008_create_dashboard_widgets_table', 1),
(12, '2026_05_06_000009_create_audit_logs_table', 1),
(13, '2026_05_06_140331_create_permission_tables', 1),
(14, '2026_05_06_140331_create_personal_access_tokens_table', 1),
(15, '2026_05_06_000010_create_site_settings_table', 2),
(16, '2026_05_06_000011_create_categories_table', 3),
(17, '2026_05_07_095359_create_hero_background_images_table', 4),
(18, '2026_05_07_200000_create_purchase_orders_table', 5),
(19, '2026_05_08_000001_update_variant_barcodes_to_dual_id_format', 6),
(20, '2026_05_08_000002_add_online_price_to_products_table', 7),
(21, '2026_05_08_175219_add_sender_number_to_booking_payments_table', 8),
(22, '2026_05_09_000001_update_hero_background_images_table', 5),
(23, '2026_05_09_112033_change_user_type_to_string_in_users_table', 9),
(24, '2026_05_10_000001_add_video_support_to_hero_images', 10),
(25, '2026_05_10_000002_make_path_nullable_in_hero_images', 11),
(26, '2026_05_10_172435_add_hero_carousel_settings_to_site_settings_table', 12),
(27, '2026_05_10_180020_create_owner_transactions_table', 13),
(28, '2026_05_11_201359_add_payment_source_to_transactions_tables', 14),
(29, '2026_05_12_063716_add_unique_constraint_to_transaction_reference_in_purchase_orders_table', 15),
(30, '2026_05_12_100000_add_bank_payment_source', 16),
(31, '2026_05_13_000001_add_show_on_mobile_to_hero_background_images', 17),
(32, '2026_05_13_000002_add_hero_visibility_settings', 18),
(33, '2026_05_13_000003_add_show_on_tablet_to_hero_background_images', 19);

-- --------------------------------------------------------

--
-- Table structure for table `mobile_banking_accounts`
--

CREATE TABLE `mobile_banking_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mobile_banking_accounts`
--

INSERT INTO `mobile_banking_accounts` (`id`, `provider`, `account_name`, `account_number`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'bkash', 'Shop bKash', '01838104366', 1, '2026-05-07 09:05:56', '2026-05-07 09:10:10'),
(2, 'nagad', 'Shop Nagad', '01XXXXXXXXX', 0, '2026-05-07 09:05:56', '2026-05-07 09:10:12'),
(3, 'rocket', 'Shop Rocket', '01XXXXXXXXX', 0, '2026-05-07 09:05:56', '2026-05-07 09:10:13');

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(1, 'App\\Models\\User', 8),
(1, 'App\\Models\\User', 13),
(2, 'App\\Models\\User', 4),
(2, 'App\\Models\\User', 7),
(2, 'App\\Models\\User', 10),
(3, 'App\\Models\\User', 2),
(3, 'App\\Models\\User', 9),
(4, 'App\\Models\\User', 3),
(4, 'App\\Models\\User', 5),
(4, 'App\\Models\\User', 6),
(5, 'App\\Models\\User', 11),
(6, 'App\\Models\\User', 12);

-- --------------------------------------------------------

--
-- Table structure for table `owner_transactions`
--

CREATE TABLE `owner_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('withdrawal','loan','deposit','loan_repayment') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_source` enum('shop_cash','online','bank') NOT NULL DEFAULT 'shop_cash',
  `recipient_name` varchar(255) DEFAULT NULL,
  `recipient_phone` varchar(255) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `expected_return_date` date DEFAULT NULL,
  `actual_return_date` date DEFAULT NULL,
  `status` enum('pending','completed','partial','overdue') NOT NULL DEFAULT 'pending',
  `related_transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `owner_transactions`
--

INSERT INTO `owner_transactions` (`id`, `user_id`, `type`, `amount`, `payment_source`, `recipient_name`, `recipient_phone`, `purpose`, `notes`, `transaction_date`, `expected_return_date`, `actual_return_date`, `status`, `related_transaction_id`, `created_at`, `updated_at`) VALUES
(14, 13, 'deposit', 50000.00, 'online', NULL, NULL, NULL, NULL, '2026-05-12', NULL, NULL, 'completed', NULL, '2026-05-12 04:00:12', '2026-05-12 04:00:12'),
(15, 13, 'deposit', 50000.00, 'bank', NULL, NULL, NULL, NULL, '2026-05-12', NULL, NULL, 'completed', NULL, '2026-05-12 04:04:49', '2026-05-12 04:04:49'),
(16, 13, 'withdrawal', 5000.00, 'bank', NULL, NULL, NULL, NULL, '2026-05-12', NULL, NULL, 'completed', NULL, '2026-05-12 10:36:53', '2026-05-12 10:36:53'),
(17, 13, 'loan', 20000.00, 'online', 'MD HASSAN', NULL, NULL, NULL, '2026-05-12', '2026-05-13', NULL, 'pending', NULL, '2026-05-12 10:38:16', '2026-05-12 10:38:16');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'view_dashboard', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(2, 'view_products', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(3, 'create_products', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(4, 'edit_products', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(5, 'delete_products', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(6, 'view_sales', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(7, 'create_sales', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(8, 'view_reports', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(9, 'view_expenses', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(10, 'create_expenses', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(11, 'edit_expenses', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(12, 'delete_expenses', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(13, 'view_bookings', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(14, 'manage_bookings', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(15, 'verify_payments', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(16, 'view_customers', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(17, 'view_users', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(18, 'manage_users', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(19, 'view_roles', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(20, 'manage_roles', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(21, 'view_announcements', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(22, 'manage_announcements', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(23, 'manage_themes', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(24, 'manage_settings', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(3, 'App\\Models\\User', 1, 'auth_token', '104ca80e66028010933cf7c0e0cd43794442b1249caa220af4bf1fafb31d537d', '[\"*\"]', '2026-05-06 14:36:22', NULL, '2026-05-06 10:35:20', '2026-05-06 14:36:22'),
(6, 'App\\Models\\User', 4, 'auth_token', '28f78b1dbd84710e9c04add56301f1f63f2d18bcc2aea2a05f24f96a3acdc5ba', '[\"*\"]', '2026-05-07 00:34:37', NULL, '2026-05-07 00:30:10', '2026-05-07 00:34:37'),
(7, 'App\\Models\\User', 1, 'auth_token', 'e354363a2130c1bc19a322d7b8c1ee2c7f55299503b400c7df15525c0fbec0ec', '[\"*\"]', '2026-05-07 00:39:13', NULL, '2026-05-07 00:38:58', '2026-05-07 00:39:13'),
(8, 'App\\Models\\User', 1, 'auth_token', 'e77a0815c2ad1ec1883306d9abe30ea75775a1c20d76c24253781e2e410462e9', '[\"*\"]', '2026-05-07 05:56:19', NULL, '2026-05-07 02:03:23', '2026-05-07 05:56:19'),
(10, 'App\\Models\\User', 5, 'auth_token', 'f2a781a6f644ac4ceac197844b121cd9105f786445873ae0aa1b1d598f8d9335', '[\"*\"]', '2026-05-09 00:56:11', NULL, '2026-05-07 08:57:53', '2026-05-09 00:56:11'),
(11, 'App\\Models\\User', 1, 'auth_token', '0986bab7975e8440a26320f1a2ed1b2f07a72f6910d2c496d089c1c7efc00f0d', '[\"*\"]', '2026-05-09 01:02:09', NULL, '2026-05-08 07:43:47', '2026-05-09 01:02:09'),
(15, 'App\\Models\\User', 1, 'auth_token', '65fbe41f38947f5996a5e88f9c6c47e9f61e1bddb2d9e30dad817606dbd8da32', '[\"*\"]', '2026-05-09 04:36:50', NULL, '2026-05-09 03:58:36', '2026-05-09 04:36:50'),
(17, 'App\\Models\\User', 8, 'auth_token', 'f1c902ed9aff3348f14a0fbde58219c4f094aca87e466473b08fb65e6045938b', '[\"*\"]', '2026-05-10 06:50:28', NULL, '2026-05-09 04:40:09', '2026-05-10 06:50:28'),
(27, 'App\\Models\\User', 13, 'auth_token', 'de8b2438e9f92b4a03035cd44fae360cd7f05cf6d41d5dc22fb293d237bcdab4', '[\"*\"]', '2026-05-10 01:02:53', NULL, '2026-05-09 20:11:45', '2026-05-10 01:02:53'),
(28, 'App\\Models\\User', 6, 'auth_token', '9f96800f8e40eb534e9f8a2d63a8599012c8251b0190d2b59fc7fcf3de59a4a1', '[\"*\"]', '2026-05-10 06:21:56', NULL, '2026-05-10 06:20:11', '2026-05-10 06:21:56'),
(29, 'App\\Models\\User', 8, 'auth_token', '4aab22bd6e64d985bfb07b3e2ced9a5bd144b283a625505049761e4babe84cf0', '[\"*\"]', '2026-05-12 01:32:07', NULL, '2026-05-10 09:31:36', '2026-05-12 01:32:07'),
(30, 'App\\Models\\User', 6, 'auth_token', '174b570e17a5086db99c13aba3c3ce07a879eda598ce20ba4554d88ab14665d3', '[\"*\"]', '2026-05-14 04:39:11', NULL, '2026-05-11 18:27:30', '2026-05-14 04:39:11'),
(31, 'App\\Models\\User', 13, 'auth_token', '59b830856c326ebb038856ec3ba6acb2ff02ad8939997647ebd41edcf249f80b', '[\"*\"]', '2026-05-12 06:53:12', NULL, '2026-05-12 03:27:30', '2026-05-12 06:53:12'),
(32, 'App\\Models\\User', 13, 'auth_token', 'c0120dbf1d82fbeacb145567c32ad8386e1b330360a12c833679421133fc68ee', '[\"*\"]', '2026-05-14 08:12:06', NULL, '2026-05-12 10:29:28', '2026-05-14 08:12:06');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `base_product_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_bn` varchar(255) DEFAULT NULL,
  `category` enum('shirts','pants','t-shirts','panjabi','accessories') NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_bn` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `has_fixed_price` tinyint(1) NOT NULL DEFAULT 1,
  `buying_price` decimal(10,2) NOT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `online_price` decimal(10,2) DEFAULT NULL,
  `size_type` enum('standard','measurement') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `base_product_id`, `name`, `name_bn`, `category`, `category_id`, `description`, `description_bn`, `image`, `has_fixed_price`, `buying_price`, `selling_price`, `online_price`, `size_type`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'TSH-0001', 't-shirts', 'টি শার্ট', 't-shirts', NULL, 'fully cottone and comportable', NULL, 'products/CahiBI9YyGmukm2fLPH2Z6KMdy6uU69yacYALxbu.jpg', 1, 200.00, 300.00, NULL, 'standard', 1, '2026-05-06 10:20:48', '2026-05-07 09:01:12', NULL),
(2, 'TSH-0002', 't-shirts', 'টি শার্ট', 't-shirts', NULL, '100% cotton products', NULL, 'products/YKCH8qFyPXeZnft22hjcjxLisjLXhVd0C5knYKKm.webp', 1, 250.00, 450.00, NULL, 'standard', 1, '2026-05-06 10:49:09', '2026-05-07 09:01:02', NULL),
(3, 'TSH-0003', 't-shirts', 'টি শার্ট', 't-shirts', NULL, 'Mens t-shirt.', NULL, 'products/fHnJardZ9jhOzhWnaxAska4MyXbil8RQ26Xuu1R0.webp', 1, 350.00, 550.00, NULL, 'standard', 1, '2026-05-06 10:50:55', '2026-05-07 09:00:51', NULL),
(4, 'SHT-0001', 'shirt', NULL, 'shirts', NULL, '100% cotton', NULL, 'products/WrMyHAlTPC8GoKMEi1tOjkmNzO6Z7HKAtFPXAM5D.jpg', 1, 350.00, 500.00, NULL, 'standard', 1, '2026-05-06 12:15:19', '2026-05-07 09:00:30', NULL),
(5, 'PNJ-0001', 'panjabi', NULL, 'panjabi', NULL, 'asdfgd dfg eg', NULL, 'products/StDenCEYyGrn737QYtCatuLY9SEZdwgqZPRuRIei.jpg', 1, 1800.00, 2500.00, NULL, 'standard', 1, '2026-05-06 12:50:53', '2026-05-07 09:00:40', NULL),
(6, 'SHT-0002', 'sdf', NULL, 'shirts', NULL, 'asdf', NULL, NULL, 0, 249.99, NULL, NULL, 'standard', 1, '2026-05-06 13:51:13', '2026-05-06 13:59:44', '2026-05-06 13:59:44'),
(7, 'TSH-0004', 'T-Shirts', NULL, 't-shirts', NULL, '100% cotton', NULL, 'products/4irEc7Cphy8ApJrScxP5zU825EBvixiUMFikPIef.webp', 0, 180.00, NULL, NULL, 'standard', 1, '2026-05-06 14:01:46', '2026-05-06 14:06:00', '2026-05-06 14:06:00'),
(8, 'PNT-0001', 'Pants', NULL, 'pants', NULL, NULL, NULL, 'products/UWKqs23en3pP4xyKBWyyhPmol1sBSUiEOeyPNWY1.jpg', 1, 850.00, 1200.00, NULL, 'measurement', 1, '2026-05-06 14:10:38', '2026-05-09 03:25:55', NULL),
(9, 'SHT-0003', 'MD AL AMIN PATOARI', NULL, 'shirts', NULL, 'gtdf hjfdtdfuy jhftufuy yfgy f fggh', NULL, 'products/iXqh2yKRYBvojbPKx6qPvVzHB3Qe8fxIPRsEVdU9.png', 0, 250.00, NULL, NULL, 'standard', 1, '2026-05-07 12:32:13', '2026-05-08 01:12:47', '2026-05-08 01:12:47'),
(10, 'SHT-0004', 'Men\'s Formal Shirt Blue', NULL, 'shirts', NULL, 'Formal shirt with 100% cotton', NULL, 'products/4AVbpYqeDuEhZw3LXnBERsoECqocAWDgWoXEb309.png', 0, 249.99, NULL, NULL, 'standard', 1, '2026-05-08 01:14:44', '2026-05-08 01:15:10', '2026-05-08 01:15:10'),
(11, 'SHT-0005', 'Men\'s Formal Shirt-Blue', NULL, 'shirts', NULL, 'Bule Formal Shirt. 100% cottone.', NULL, 'products/pdMgQf6zq20p2jrne4Qydp4js6BOvsrrvxZpYYOn.png', 0, 250.00, NULL, NULL, 'standard', 1, '2026-05-08 01:17:06', '2026-05-08 01:19:15', '2026-05-08 01:19:15'),
(12, 'SHT-0006', 'Men\'s Formal Shirt-Blue', NULL, 'shirts', NULL, 'Solid Blue Formal Shirt for Mens. 100% cottone', NULL, 'products/A9yHpDsNxg6kNGXi9yN7t6iQ36K04SYH1BFB1HfT.png', 0, 250.00, NULL, 550.00, 'standard', 1, '2026-05-08 01:21:38', '2026-05-08 11:20:18', NULL),
(13, 'SHT-0007', 'Casual Shirt Full -Black', NULL, 'shirts', NULL, 'mens formal shirt', NULL, 'products/HDrraZysRWMDWyhGuuTfR6ZJbnp2RL6LwCVsaucR.jpg', 0, 249.98, NULL, 500.00, 'standard', 1, '2026-05-08 03:13:13', '2026-05-08 11:20:01', NULL),
(14, 'TSH-0005', 't-shirts', NULL, 't-shirts', NULL, '100% cotton', NULL, 'products/P2TRF6zU8h2j63Ne25rWvrUifcXlaeEGJyRLLiqE.jpg', 0, 250.00, NULL, 580.00, 'standard', 1, '2026-05-08 13:49:17', '2026-05-08 13:49:54', '2026-05-08 13:49:54'),
(15, 'ACC-0001', 'wallmet', NULL, 'accessories', NULL, 'islamic cariography wallmet', NULL, 'products/wOQuiiUvvsH3DagM102LUqTDUBquOv1jcP93BvLz.jpg', 1, 250.00, 450.00, NULL, 'measurement', 1, '2026-05-08 13:55:34', '2026-05-08 13:55:34', NULL),
(16, 'SHT-0008', 'Three Quarter Mens Pant', NULL, 'shirts', NULL, NULL, NULL, 'products/FI2mx1YL4OkVhxKDVbaTDoYOizbPcjUGRXry0jZO.jpg', 1, 180.00, 419.99, NULL, 'measurement', 1, '2026-05-08 14:59:14', '2026-05-08 14:59:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` varchar(255) NOT NULL,
  `barcode` varchar(255) NOT NULL,
  `size` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `product_variant_id`, `barcode`, `size`, `quantity`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'TSH-0001-M', 'TSH-0001|TSH-0001-M', 'M', 4, 1, '2026-05-06 10:20:48', '2026-05-06 10:31:28', NULL),
(2, 1, 'TSH-0001-L', 'TSH-0001|TSH-0001-L', 'L', 5, 1, '2026-05-06 10:20:48', '2026-05-06 10:20:48', NULL),
(3, 1, 'TSH-0001-XL', 'TSH-0001|TSH-0001-XL', 'XL', 2, 1, '2026-05-06 10:20:48', '2026-05-06 10:34:00', NULL),
(4, 1, 'TSH-0001-XXL', 'TSH-0001|TSH-0001-XXL', 'XXL', 3, 1, '2026-05-06 10:20:48', '2026-05-06 10:34:00', NULL),
(5, 1, 'TSH-0001-XXXL', 'TSH-0001|TSH-0001-XXXL', 'XXXL', 3, 1, '2026-05-06 10:20:48', '2026-05-06 10:34:00', NULL),
(6, 2, 'TSH-0002-M', 'TSH-0002|TSH-0002-M', 'M', 3, 1, '2026-05-06 10:49:09', '2026-05-08 12:09:21', NULL),
(7, 2, 'TSH-0002-S', 'TSH-0002|TSH-0002-S', 'S', 2, 1, '2026-05-06 10:49:09', '2026-05-06 10:49:09', NULL),
(8, 2, 'TSH-0002-L', 'TSH-0002|TSH-0002-L', 'L', 5, 1, '2026-05-06 10:49:09', '2026-05-06 10:49:09', NULL),
(9, 2, 'TSH-0002-XL', 'TSH-0002|TSH-0002-XL', 'XL', 3, 1, '2026-05-06 10:49:09', '2026-05-06 10:49:09', NULL),
(10, 2, 'TSH-0002-XXL', 'TSH-0002|TSH-0002-XXL', 'XXL', 8, 1, '2026-05-06 10:49:09', '2026-05-08 02:22:12', NULL),
(11, 2, 'TSH-0002-XXXL', 'TSH-0002|TSH-0002-XXXL', 'XXXL', 2, 1, '2026-05-06 10:49:09', '2026-05-08 12:09:26', NULL),
(12, 3, 'TSH-0003-M', 'TSH-0003|TSH-0003-M', 'M', 3, 1, '2026-05-06 10:50:55', '2026-05-14 04:39:11', NULL),
(13, 3, 'TSH-0003-S', 'TSH-0003|TSH-0003-S', 'S', 5, 1, '2026-05-06 10:50:55', '2026-05-07 12:30:40', NULL),
(14, 3, 'TSH-0003-L', 'TSH-0003|TSH-0003-L', 'L', 8, 1, '2026-05-06 10:50:55', '2026-05-07 12:30:40', NULL),
(15, 3, 'TSH-0003-XL', 'TSH-0003|TSH-0003-XL', 'XL', 4, 1, '2026-05-06 10:50:55', '2026-05-06 10:50:55', NULL),
(16, 3, 'TSH-0003-XXL', 'TSH-0003|TSH-0003-XXL', 'XXL', 6, 1, '2026-05-06 10:50:55', '2026-05-06 10:50:55', NULL),
(17, 3, 'TSH-0003-XXXL', 'TSH-0003|TSH-0003-XXXL', 'XXXL', 6, 1, '2026-05-06 10:50:55', '2026-05-06 10:50:55', NULL),
(18, 4, 'SHT-0001-M', 'SHT-0001|SHT-0001-M', 'M', 5, 1, '2026-05-06 12:15:19', '2026-05-06 12:15:19', NULL),
(19, 4, 'SHT-0001-S', 'SHT-0001|SHT-0001-S', 'S', 3, 1, '2026-05-06 12:15:19', '2026-05-06 12:17:04', NULL),
(20, 4, 'SHT-0001-L', 'SHT-0001|SHT-0001-L', 'L', 5, 1, '2026-05-06 12:15:19', '2026-05-07 04:31:12', NULL),
(21, 4, 'SHT-0001-XL', 'SHT-0001|SHT-0001-XL', 'XL', 6, 1, '2026-05-06 12:15:19', '2026-05-07 04:31:12', NULL),
(22, 4, 'SHT-0001-XXL', 'SHT-0001|SHT-0001-XXL', 'XXL', 0, 1, '2026-05-06 12:15:19', '2026-05-07 04:31:12', NULL),
(23, 4, 'SHT-0001-XXXL', 'SHT-0001|SHT-0001-XXXL', 'XXXL', 0, 1, '2026-05-06 12:15:19', '2026-05-07 04:31:12', NULL),
(24, 5, 'PNJ-0001-M', 'PNJ-0001|PNJ-0001-M', 'M', 4, 1, '2026-05-06 12:50:53', '2026-05-12 22:29:42', NULL),
(25, 5, 'PNJ-0001-L', 'PNJ-0001|PNJ-0001-L', 'L', 2, 1, '2026-05-06 12:50:53', '2026-05-12 22:29:42', NULL),
(26, 6, 'SHT-0002-M', 'SHT-0002|SHT-0002-M', 'M', 5, 1, '2026-05-06 13:51:13', '2026-05-06 13:51:13', NULL),
(27, 7, 'TSH-0004-M', 'TSH-0004|TSH-0004-M', 'M', 5, 1, '2026-05-06 14:01:46', '2026-05-06 14:01:46', NULL),
(28, 7, 'TSH-0004-XXXL', 'TSH-0004|TSH-0004-XXXL', 'XXXL', 4, 1, '2026-05-06 14:01:46', '2026-05-06 14:01:46', NULL),
(29, 7, 'TSH-0004-XXL', 'TSH-0004|TSH-0004-XXL', 'XXL', 2, 1, '2026-05-06 14:01:46', '2026-05-06 14:01:46', NULL),
(30, 7, 'TSH-0004-XL', 'TSH-0004|TSH-0004-XL', 'XL', 1, 1, '2026-05-06 14:01:46', '2026-05-06 14:01:46', NULL),
(31, 7, 'TSH-0004-L', 'TSH-0004|TSH-0004-L', 'L', 6, 1, '2026-05-06 14:01:46', '2026-05-06 14:01:46', NULL),
(32, 7, 'TSH-0004-S', 'TSH-0004|TSH-0004-S', 'S', 3, 1, '2026-05-06 14:01:46', '2026-05-06 14:01:46', NULL),
(33, 8, 'PNT-0001-28', 'PNT-0001|PNT-0001-28', '28', 1, 1, '2026-05-06 14:10:38', '2026-05-12 00:33:57', NULL),
(34, 8, 'PNT-0001-32', 'PNT-0001|PNT-0001-32', '32', 1, 1, '2026-05-06 14:10:38', '2026-05-10 06:24:33', NULL),
(35, 8, 'PNT-0001-30', 'PNT-0001|PNT-0001-30', '30', 0, 1, '2026-05-06 14:10:38', '2026-05-10 06:24:33', NULL),
(36, 8, 'PNT-0001-42', 'PNT-0001|PNT-0001-42', '42', 1, 1, '2026-05-06 14:10:38', '2026-05-10 06:24:33', NULL),
(37, 9, 'SHT-0003-M', 'SHT-0003|SHT-0003-M', 'M', 4, 1, '2026-05-07 12:32:13', '2026-05-07 12:40:49', NULL),
(38, 9, 'SHT-0003-S', 'SHT-0003|SHT-0003-S', 'S', 2, 1, '2026-05-07 12:32:13', '2026-05-07 12:40:15', NULL),
(39, 9, 'SHT-0003-L', 'SHT-0003|SHT-0003-L', 'L', 6, 1, '2026-05-07 12:32:13', '2026-05-07 12:32:13', NULL),
(40, 9, 'SHT-0003-XL', 'SHT-0003|SHT-0003-XL', 'XL', 1, 1, '2026-05-07 12:32:13', '2026-05-07 12:32:13', NULL),
(41, 9, 'SHT-0003-XXL', 'SHT-0003|SHT-0003-XXL', 'XXL', 2, 1, '2026-05-07 12:32:13', '2026-05-07 12:40:15', NULL),
(42, 9, 'SHT-0003-XXXL', 'SHT-0003|SHT-0003-XXXL', 'XXXL', 8, 1, '2026-05-07 12:32:13', '2026-05-07 12:40:15', NULL),
(43, 10, 'SHT-0004-M', 'SHT-0004|SHT-0004-M', 'M', 450, 1, '2026-05-08 01:14:44', '2026-05-08 01:14:44', NULL),
(44, 10, 'SHT-0004-S', 'SHT-0004|SHT-0004-S', 'S', 460, 1, '2026-05-08 01:14:44', '2026-05-08 01:14:44', NULL),
(45, 10, 'SHT-0004-L', 'SHT-0004|SHT-0004-L', 'L', 500, 1, '2026-05-08 01:14:44', '2026-05-08 01:14:44', NULL),
(46, 10, 'SHT-0004-XL', 'SHT-0004|SHT-0004-XL', 'XL', 520, 1, '2026-05-08 01:14:44', '2026-05-08 01:14:44', NULL),
(47, 10, 'SHT-0004-XXL', 'SHT-0004|SHT-0004-XXL', 'XXL', 530, 1, '2026-05-08 01:14:44', '2026-05-08 01:14:44', NULL),
(48, 10, 'SHT-0004-XXXL', 'SHT-0004|SHT-0004-XXXL', 'XXXL', 532, 1, '2026-05-08 01:14:44', '2026-05-08 01:14:44', NULL),
(49, 11, 'SHT-0005-M', 'SHT-0005|SHT-0005-M', 'M', 5, 1, '2026-05-08 01:17:06', '2026-05-08 01:17:06', NULL),
(50, 11, 'SHT-0005-S', 'SHT-0005|SHT-0005-S', 'S', 6, 1, '2026-05-08 01:17:06', '2026-05-08 01:17:06', NULL),
(51, 11, 'SHT-0005-L', 'SHT-0005|SHT-0005-L', 'L', 4, 1, '2026-05-08 01:17:06', '2026-05-08 01:17:06', NULL),
(52, 11, 'SHT-0005-XL', 'SHT-0005|SHT-0005-XL', 'XL', 9, 1, '2026-05-08 01:17:06', '2026-05-08 01:17:06', NULL),
(53, 11, 'SHT-0005-XXL', 'SHT-0005|SHT-0005-XXL', 'XXL', 3, 1, '2026-05-08 01:17:06', '2026-05-08 01:17:06', NULL),
(54, 11, 'SHT-0005-XXXL', 'SHT-0005|SHT-0005-XXXL', 'XXXL', 7, 1, '2026-05-08 01:17:06', '2026-05-08 01:17:06', NULL),
(55, 12, 'SHT-0006-M', 'SHT-0006|SHT-0006-M', 'M', 0, 1, '2026-05-08 01:21:38', '2026-05-08 02:35:37', NULL),
(56, 12, 'SHT-0006-S', 'SHT-0006|SHT-0006-S', 'S', 2, 1, '2026-05-08 01:21:38', '2026-05-08 23:27:56', NULL),
(57, 12, 'SHT-0006-L', 'SHT-0006|SHT-0006-L', 'L', 5, 1, '2026-05-08 01:21:38', '2026-05-08 10:45:38', NULL),
(58, 12, 'SHT-0006-XL', 'SHT-0006|SHT-0006-XL', 'XL', 4, 1, '2026-05-08 01:21:38', '2026-05-08 01:21:38', NULL),
(59, 12, 'SHT-0006-XXL', 'SHT-0006|SHT-0006-XXL', 'XXL', 0, 1, '2026-05-08 01:21:38', '2026-05-08 02:35:37', NULL),
(60, 12, 'SHT-0006-XXXL', 'SHT-0006|SHT-0006-XXXL', 'XXXL', 0, 1, '2026-05-08 01:21:38', '2026-05-08 02:35:37', NULL),
(61, 13, 'SHT-0007-M', 'SHT-0007|SHT-0007-M', 'M', 0, 1, '2026-05-08 03:13:13', '2026-05-14 00:13:07', NULL),
(62, 13, 'SHT-0007-S', 'SHT-0007|SHT-0007-S', 'S', 5, 1, '2026-05-08 03:13:13', '2026-05-08 03:13:13', NULL),
(63, 13, 'SHT-0007-L', 'SHT-0007|SHT-0007-L', 'L', 1, 1, '2026-05-08 03:13:13', '2026-05-14 00:45:40', NULL),
(64, 13, 'SHT-0007-XL', 'SHT-0007|SHT-0007-XL', 'XL', 0, 1, '2026-05-08 03:13:13', '2026-05-14 00:23:19', NULL),
(65, 13, 'SHT-0007-XXL', 'SHT-0007|SHT-0007-XXL', 'XXL', 0, 1, '2026-05-08 03:13:13', '2026-05-14 01:05:43', NULL),
(66, 13, 'SHT-0007-XXXL', 'SHT-0007|SHT-0007-XXXL', 'XXXL', 0, 1, '2026-05-08 03:13:13', '2026-05-14 00:30:36', NULL),
(67, 14, 'TSH-0005-M', 'TSH-0005|TSH-0005-M', 'M', 5, 1, '2026-05-08 13:49:17', '2026-05-08 13:49:17', NULL),
(68, 14, 'TSH-0005-L', 'TSH-0005|TSH-0005-L', 'L', 6, 1, '2026-05-08 13:49:17', '2026-05-08 13:49:17', NULL),
(69, 14, 'TSH-0005-XL', 'TSH-0005|TSH-0005-XL', 'XL', 7, 1, '2026-05-08 13:49:17', '2026-05-08 13:49:17', NULL),
(70, 14, 'TSH-0005-XXL', 'TSH-0005|TSH-0005-XXL', 'XXL', 9, 1, '2026-05-08 13:49:17', '2026-05-08 13:49:17', NULL),
(71, 14, 'TSH-0005-XXXL', 'TSH-0005|TSH-0005-XXXL', 'XXXL', 6, 1, '2026-05-08 13:49:18', '2026-05-08 13:49:18', NULL),
(72, 15, 'ACC-0001-BIG', 'ACC-0001|ACC-0001-BIG', 'big', 0, 1, '2026-05-08 13:55:34', '2026-05-12 05:57:35', NULL),
(73, 15, 'ACC-0001-ASMALL', 'ACC-0001|ACC-0001-ASMALL', 'asmall', 5, 1, '2026-05-08 13:55:34', '2026-05-12 05:57:35', NULL),
(74, 15, 'ACC-0001-MEDIUM', 'ACC-0001|ACC-0001-MEDIUM', 'medium', 4, 1, '2026-05-08 13:55:34', '2026-05-12 05:57:35', NULL),
(75, 16, 'SHT-0008-30', 'SHT-0008|SHT-0008-30', '30', 0, 1, '2026-05-08 14:59:14', '2026-05-09 05:08:47', NULL),
(76, 16, 'SHT-0008-32', 'SHT-0008|SHT-0008-32', '32', 0, 1, '2026-05-08 14:59:14', '2026-05-12 00:08:27', NULL),
(77, 16, 'SHT-0008-28', 'SHT-0008|SHT-0008-28', '28', 2, 1, '2026-05-08 14:59:14', '2026-05-12 04:09:01', NULL),
(78, 16, 'SHT-0008-36', 'SHT-0008|SHT-0008-36', '36', 2, 1, '2026-05-08 14:59:14', '2026-05-08 14:59:14', NULL),
(79, 16, 'SHT-0008-34', 'SHT-0008|SHT-0008-34', '34', 3, 1, '2026-05-08 14:59:14', '2026-05-08 14:59:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `delivery_name` varchar(255) NOT NULL,
  `delivery_phone` varchar(255) NOT NULL,
  `delivery_address` varchar(255) NOT NULL,
  `delivery_city` varchar(255) NOT NULL,
  `delivery_district` varchar(255) DEFAULT NULL,
  `delivery_notes` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('bkash','nagad','rocket','other') DEFAULT NULL,
  `transaction_reference` varchar(255) DEFAULT NULL,
  `sender_number` varchar(255) DEFAULT NULL,
  `payment_screenshot` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `status` enum('pending_payment','payment_submitted','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending_payment',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `order_number`, `user_id`, `delivery_name`, `delivery_phone`, `delivery_address`, `delivery_city`, `delivery_district`, `delivery_notes`, `total_amount`, `payment_method`, `transaction_reference`, `sender_number`, `payment_screenshot`, `payment_status`, `verified_by`, `verified_at`, `rejection_reason`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'ORD-20260508-0001', 5, 'MD AL AMIN PATOARI', '01645512233', 'Kazipara', 'Dhaka', 'Dhaka', NULL, 3700.00, 'bkash', 'DDR4L3U596', '01645512233', 'order-screenshots/0RxSQOLjBqtVyq0sRbUrIeXaBh9wDq9QaKkC5PXy.jpeg', 'verified', 1, '2026-05-08 07:55:02', NULL, 'delivered', '2026-05-08 07:41:30', '2026-05-08 07:55:36', NULL),
(2, 'ORD-20260512-0001', 6, 'ABC SCHOOL', '01645512233', 'KAZIPARA', 'DHAKA', NULL, NULL, 450.00, 'bkash', 'DFG96IKJ564', '01645512233', 'order-screenshots/FRizJsi8aR9riJ3sMGgC2Mon6rJJXBcdNPyA5zi2.jpeg', 'verified', 8, '2026-05-11 18:33:20', NULL, 'delivered', '2026-05-11 18:32:31', '2026-05-11 18:34:44', NULL),
(3, 'ORD-20260512-0002', 6, 'SHONNET PATOARI', '01645512233', 'Doulatpur', 'Noakhali', 'Noakhali', NULL, 1289.98, 'bkash', 'HJK639GFD852', '01645512233', 'order-screenshots/je33IljcV0ajvvT9qsqvLnhQhwwHmhXQY9WDTb7h.jpeg', 'verified', 8, '2026-05-12 00:09:02', NULL, 'processing', '2026-05-12 00:08:27', '2026-05-12 00:11:33', NULL),
(4, 'ORD-20260512-0003', 6, 'SHONNET PATOARI', '01645512233', 'Doulatpur, Ward: 08, Unioun: 11 no Neazpur', 'Noakhali', 'Noakhali', NULL, 1700.00, 'bkash', 'F9889327AF90', '01645578899', 'order-screenshots/zgd8rr4vCoBb43mJdPPcqgvLmuP5ag8Ae9vrbjGe.jpeg', 'verified', 13, '2026-05-14 04:41:43', NULL, 'confirmed', '2026-05-12 00:33:56', '2026-05-14 04:41:43', NULL),
(5, 'ORD-20260512-0004', 6, 'ABC SCHOOL', '01645512233', 'Maijdi', 'Noakhali', NULL, NULL, 869.99, 'bkash', 'HJK639GFD8523', '01645512233', 'order-screenshots/l4JinFD6x7r7Qfn3GbyARpZxCWbfI5ifXcdk72q4.jpeg', 'verified', 13, '2026-05-14 04:41:19', NULL, 'confirmed', '2026-05-12 00:40:18', '2026-05-14 04:41:19', NULL),
(6, 'ORD-20260514-0001', 6, 'Ikhtiyar Patoari', '01839979381', 'Patoari bari', 'Noakhali', 'Noakhali', NULL, 550.00, 'bkash', 'SDF852K5OL96', '01839979381', 'order-screenshots/7pKigRVpl0W2aRc8L3kSorzuQ12LAOUbxrvVitCG.jpeg', 'verified', 13, '2026-05-14 04:40:48', NULL, 'confirmed', '2026-05-14 04:39:11', '2026-05-14 04:40:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_order_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `size` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `product_image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `product_variant_id`, `product_name`, `size`, `quantity`, `unit_price`, `subtotal`, `product_image_url`, `created_at`, `updated_at`) VALUES
(1, 1, 33, 'Pants', '28', 1, 1200.00, 1200.00, 'http://localhost:8000/storage/products/7gMiuiVP9Eg3criNl41eTdFKwrAAeLV9WaIAx5mD.jpg', '2026-05-08 07:41:30', '2026-05-08 07:41:30'),
(2, 1, 24, 'panjabi', 'M', 1, 2500.00, 2500.00, 'http://localhost:8000/storage/products/StDenCEYyGrn737QYtCatuLY9SEZdwgqZPRuRIei.jpg', '2026-05-08 07:41:30', '2026-05-08 07:41:30'),
(3, 1, 56, 'Men\'s Formal Shirt-Blue', 'S', 1, 0.00, 0.00, 'http://localhost:8000/storage/products/A9yHpDsNxg6kNGXi9yN7t6iQ36K04SYH1BFB1HfT.png', '2026-05-08 07:41:30', '2026-05-08 07:41:30'),
(4, 2, 72, 'wallmet', 'big', 1, 450.00, 450.00, 'http://localhost:8000/storage/products/wOQuiiUvvsH3DagM102LUqTDUBquOv1jcP93BvLz.jpg', '2026-05-11 18:32:31', '2026-05-11 18:32:31'),
(5, 3, 72, 'wallmet', 'big', 1, 450.00, 450.00, 'http://localhost:8000/storage/products/wOQuiiUvvsH3DagM102LUqTDUBquOv1jcP93BvLz.jpg', '2026-05-12 00:08:27', '2026-05-12 00:08:27'),
(6, 3, 76, 'Three Quarter Mens Pant', '32', 2, 419.99, 839.98, 'http://localhost:8000/storage/products/FI2mx1YL4OkVhxKDVbaTDoYOizbPcjUGRXry0jZO.jpg', '2026-05-12 00:08:27', '2026-05-12 00:08:27'),
(7, 4, 33, 'Pants', '28', 1, 1200.00, 1200.00, 'http://localhost:8000/storage/products/UWKqs23en3pP4xyKBWyyhPmol1sBSUiEOeyPNWY1.jpg', '2026-05-12 00:33:57', '2026-05-12 00:33:57'),
(8, 4, 61, 'Casual Shirt Full -Black', 'M', 1, 500.00, 500.00, 'http://localhost:8000/storage/products/HDrraZysRWMDWyhGuuTfR6ZJbnp2RL6LwCVsaucR.jpg', '2026-05-12 00:33:57', '2026-05-12 00:33:57'),
(9, 5, 72, 'wallmet', 'big', 1, 450.00, 450.00, 'http://localhost:8000/storage/products/wOQuiiUvvsH3DagM102LUqTDUBquOv1jcP93BvLz.jpg', '2026-05-12 00:40:18', '2026-05-12 00:40:18'),
(10, 5, 77, 'Three Quarter Mens Pant', '28', 1, 419.99, 419.99, 'http://localhost:8000/storage/products/FI2mx1YL4OkVhxKDVbaTDoYOizbPcjUGRXry0jZO.jpg', '2026-05-12 00:40:18', '2026-05-12 00:40:18'),
(11, 6, 12, 't-shirts', 'M', 1, 550.00, 550.00, 'http://localhost:8000/storage/products/fHnJardZ9jhOzhWnaxAska4MyXbil8RQ26Xuu1R0.webp', '2026-05-14 04:39:11', '2026-05-14 04:39:11');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(2, 'staff', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(3, 'Managr', 'web', '2026-05-06 10:06:31', '2026-05-06 14:25:39'),
(4, 'customer', 'web', '2026-05-06 10:06:31', '2026-05-06 10:06:31'),
(5, 'Clark', 'web', '2026-05-09 05:05:17', '2026-05-09 05:05:17'),
(6, 'Sales Managr', 'web', '2026-05-09 05:59:35', '2026-05-09 05:59:35');

-- --------------------------------------------------------

--
-- Table structure for table `role_dashboard_widgets`
--

CREATE TABLE `role_dashboard_widgets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `dashboard_widget_id` bigint(20) UNSIGNED NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `widget_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`widget_settings`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(2, 2),
(2, 3),
(2, 5),
(2, 6),
(3, 1),
(3, 3),
(3, 5),
(4, 1),
(5, 1),
(6, 1),
(6, 2),
(6, 3),
(6, 5),
(6, 6),
(7, 1),
(7, 2),
(7, 3),
(7, 5),
(7, 6),
(8, 1),
(8, 3),
(8, 6),
(9, 1),
(9, 3),
(9, 5),
(9, 6),
(10, 1),
(10, 3),
(10, 5),
(10, 6),
(11, 1),
(12, 1),
(13, 1),
(13, 2),
(14, 1),
(15, 1),
(15, 2),
(16, 1),
(16, 2),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1);

-- --------------------------------------------------------

--
-- Table structure for table `sales_transactions`
--

CREATE TABLE `sales_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_number` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','mobile_banking','card','other') NOT NULL DEFAULT 'cash',
  `payment_source` enum('shop_cash','online','bank') NOT NULL DEFAULT 'shop_cash',
  `payment_reference` varchar(255) DEFAULT NULL,
  `status` enum('completed','refunded','cancelled') NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_transactions`
--

INSERT INTO `sales_transactions` (`id`, `transaction_number`, `user_id`, `customer_id`, `total_amount`, `discount_amount`, `net_amount`, `payment_method`, `payment_source`, `payment_reference`, `status`, `notes`, `transaction_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'TXN-20260506-0001', NULL, NULL, 500.00, 0.00, 500.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-06 10:29:27', '2026-05-06 10:29:27', '2026-05-06 10:29:27', NULL),
(2, 'TXN-20260506-0002', NULL, NULL, 1050.00, 0.00, 1050.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-06 10:31:28', '2026-05-06 10:31:28', '2026-05-06 10:31:28', NULL),
(3, 'TXN-20260506-0003', NULL, NULL, 1160.00, 0.00, 1160.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-06 10:34:00', '2026-05-06 10:34:00', '2026-05-06 10:34:00', NULL),
(4, 'TXN-20260506-0004', 1, NULL, 950.00, 0.00, 950.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-06 12:17:04', '2026-05-06 12:17:04', '2026-05-06 12:17:04', NULL),
(5, 'TXN-20260506-0005', 1, NULL, 1300.00, 0.00, 1300.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-06 12:25:27', '2026-05-06 12:25:27', '2026-05-06 12:25:27', NULL),
(6, 'TXN-20260506-0006', 1, NULL, 20000.00, 0.00, 20000.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-06 13:17:15', '2026-05-06 13:17:15', '2026-05-06 13:17:15', NULL),
(7, 'TXN-20260506-0007', 1, NULL, 2000.00, 0.00, 2000.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-06 13:50:11', '2026-05-06 13:50:11', '2026-05-06 13:50:11', NULL),
(8, 'TXN-20260507-0001', 1, NULL, 2500.00, 0.00, 2500.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-07 04:31:12', '2026-05-07 04:31:12', '2026-05-07 04:31:12', NULL),
(9, 'TXN-20260507-0002', 1, NULL, 1100.00, 0.00, 1100.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-07 12:30:40', '2026-05-07 12:30:40', '2026-05-07 12:30:40', NULL),
(10, 'TXN-20260507-0003', 1, NULL, 2280.00, 0.00, 2280.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-07 12:40:15', '2026-05-07 12:40:15', '2026-05-07 12:40:15', NULL),
(11, 'TXN-20260507-0004', 1, NULL, 520.00, 0.00, 520.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-07 12:40:49', '2026-05-07 12:40:49', '2026-05-07 12:40:49', NULL),
(12, 'TXN-20260508-0001', 1, NULL, 450.00, 0.00, 450.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 02:19:35', '2026-05-08 02:19:35', '2026-05-08 02:19:35', NULL),
(13, 'TXN-20260508-0002', 1, NULL, 450.00, 0.00, 450.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 02:22:12', '2026-05-08 02:22:12', '2026-05-08 02:22:12', NULL),
(14, 'TXN-20260508-0003', 1, NULL, 450.00, 0.00, 450.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 02:23:02', '2026-05-08 02:23:02', '2026-05-08 02:23:02', NULL),
(15, 'TXN-20260508-0004', 1, NULL, 6240.00, 0.00, 6240.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 02:35:37', '2026-05-08 02:35:37', '2026-05-08 02:35:37', NULL),
(16, 'TXN-20260508-0005', 1, NULL, 1000.00, 0.00, 1000.00, 'mobile_banking', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 03:22:42', '2026-05-08 03:22:42', '2026-05-08 03:22:42', NULL),
(17, 'TXN-20260508-0006', 1, NULL, 450.00, 0.00, 450.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 03:24:27', '2026-05-08 03:24:27', '2026-05-08 03:24:27', NULL),
(18, 'TXN-20260508-0007', 1, NULL, 380.00, 0.00, 380.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 03:27:47', '2026-05-08 03:27:47', '2026-05-08 03:27:47', NULL),
(19, 'TXN-20260508-0008', 1, NULL, 500.00, 0.00, 500.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 10:45:38', '2026-05-08 10:45:38', '2026-05-08 10:45:38', NULL),
(20, 'TXN-20260508-0009', 1, NULL, 450.00, 0.00, 450.00, 'mobile_banking', 'shop_cash', 'bkash - 01838104366', 'completed', NULL, '2026-05-08 14:28:43', '2026-05-08 14:28:43', '2026-05-08 14:28:43', NULL),
(21, 'TXN-20260508-0010', 1, NULL, 560.00, 0.00, 560.00, 'mobile_banking', 'shop_cash', 'bkash - 01838104366', 'completed', NULL, '2026-05-08 14:34:18', '2026-05-08 14:34:18', '2026-05-08 14:34:18', NULL),
(22, 'TXN-20260509-0001', 1, NULL, 450.00, 20.00, 430.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 22:29:47', '2026-05-08 22:29:47', '2026-05-08 22:29:47', NULL),
(23, 'TXN-20260509-0002', 1, NULL, 450.00, 0.00, 450.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-08 22:54:27', '2026-05-08 22:54:27', '2026-05-08 22:54:27', NULL),
(24, 'TXN-20260509-0003', 8, NULL, 839.98, 0.00, 839.98, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-09 05:08:47', '2026-05-09 05:08:47', '2026-05-09 05:08:47', NULL),
(25, 'TXN-20260509-0004', 8, NULL, 450.00, 0.00, 450.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-09 08:39:53', '2026-05-09 08:39:53', '2026-05-09 08:39:53', NULL),
(26, 'TXN-20260509-0005', 8, NULL, 900.00, 0.00, 900.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-09 08:40:39', '2026-05-09 08:40:39', '2026-05-09 08:40:39', NULL),
(27, 'TXN-20260510-0001', 8, NULL, 1200.00, 0.00, 1200.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-10 06:22:56', '2026-05-10 06:22:56', '2026-05-10 06:22:56', NULL),
(28, 'TXN-20260510-0002', 8, NULL, 4800.00, 0.00, 4800.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-10 06:24:33', '2026-05-10 06:24:33', '2026-05-10 06:24:33', NULL),
(29, 'TXN-20260512-0001', 13, NULL, 419.99, 0.00, 419.99, 'cash', 'bank', 'MUTUAL TRUST BANK - 1234567890', 'completed', NULL, '2026-05-12 04:06:30', '2026-05-12 04:06:30', '2026-05-12 04:06:30', NULL),
(30, 'TXN-20260512-0002', 13, NULL, 419.99, 0.00, 419.99, 'cash', 'online', 'bkash - 01838104366', 'completed', NULL, '2026-05-12 04:09:01', '2026-05-12 04:09:01', '2026-05-12 04:09:01', NULL),
(31, 'TXN-20260512-0003', 13, NULL, 4050.00, 0.00, 4050.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-12 05:57:35', '2026-05-12 05:57:35', '2026-05-12 05:57:35', NULL),
(32, 'TXN-20260512-0004', 13, NULL, 37500.00, 0.00, 37500.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-12 06:30:35', '2026-05-12 06:30:35', '2026-05-12 06:30:35', NULL),
(33, 'TXN-20260513-0001', 13, NULL, 25000.00, 0.00, 25000.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-12 22:29:42', '2026-05-12 22:29:42', '2026-05-12 22:29:42', NULL),
(34, 'TXN-20260514-0001', 13, NULL, 500.00, 0.00, 500.00, 'cash', 'online', 'bkash - 01838104366', 'completed', NULL, '2026-05-14 00:13:07', '2026-05-14 00:13:07', '2026-05-14 00:13:07', NULL),
(35, 'TXN-20260514-0002', 13, NULL, 1500.00, 0.00, 1500.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-14 00:17:42', '2026-05-14 00:17:42', '2026-05-14 00:17:42', NULL),
(36, 'TXN-20260514-0003', 13, NULL, 4720.00, 0.00, 4720.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-14 00:23:19', '2026-05-14 00:23:19', '2026-05-14 00:23:19', NULL),
(37, 'TXN-20260514-0004', 13, NULL, 1200.00, 0.00, 1200.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-14 00:24:38', '2026-05-14 00:24:38', '2026-05-14 00:24:38', NULL),
(38, 'TXN-20260514-0005', 13, NULL, 800.00, 0.00, 800.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-14 00:29:02', '2026-05-14 00:29:02', '2026-05-14 00:29:02', NULL),
(39, 'TXN-20260514-0006', 13, NULL, 750.00, 0.00, 750.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-14 00:30:36', '2026-05-14 00:30:36', '2026-05-14 00:30:36', NULL),
(40, 'TXN-20260514-0007', 13, NULL, 590.00, 0.00, 590.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-14 00:45:40', '2026-05-14 00:45:40', '2026-05-14 00:45:40', NULL),
(41, 'TXN-20260514-0008', 13, NULL, 630.00, 0.00, 630.00, 'cash', 'shop_cash', NULL, 'completed', NULL, '2026-05-14 01:05:43', '2026-05-14 01:05:43', '2026-05-14 01:05:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sales_transaction_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_name_bn` varchar(255) DEFAULT NULL,
  `size` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `buying_price` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sales_transaction_id`, `product_variant_id`, `product_name`, `product_name_bn`, `size`, `quantity`, `buying_price`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 't-shirts', 'টি শার্ট', 'XL', 1, 200.00, 500.00, 500.00, '2026-05-06 10:29:27', '2026-05-06 10:29:27'),
(2, 2, 5, 't-shirts', 'টি শার্ট', 'XXXL', 1, 200.00, 500.00, 500.00, '2026-05-06 10:31:28', '2026-05-06 10:31:28'),
(3, 2, 4, 't-shirts', 'টি শার্ট', 'XXL', 1, 200.00, 250.00, 250.00, '2026-05-06 10:31:28', '2026-05-06 10:31:28'),
(4, 2, 1, 't-shirts', 'টি শার্ট', 'M', 1, 200.00, 300.00, 300.00, '2026-05-06 10:31:28', '2026-05-06 10:31:28'),
(5, 3, 5, 't-shirts', 'টি শার্ট', 'XXXL', 1, 200.00, 450.00, 450.00, '2026-05-06 10:34:00', '2026-05-06 10:34:00'),
(6, 3, 3, 't-shirts', 'টি শার্ট', 'XL', 2, 200.00, 230.00, 460.00, '2026-05-06 10:34:00', '2026-05-06 10:34:00'),
(7, 3, 4, 't-shirts', 'টি শার্ট', 'XXL', 1, 200.00, 250.00, 250.00, '2026-05-06 10:34:00', '2026-05-06 10:34:00'),
(8, 4, 21, 'shirt', NULL, 'XL', 1, 350.00, 500.00, 500.00, '2026-05-06 12:17:04', '2026-05-06 12:17:04'),
(9, 4, 19, 'shirt', NULL, 'S', 1, 350.00, 450.00, 450.00, '2026-05-06 12:17:04', '2026-05-06 12:17:04'),
(10, 5, 22, 'shirt', NULL, 'XXL', 1, 350.00, 750.00, 750.00, '2026-05-06 12:25:27', '2026-05-06 12:25:27'),
(11, 5, 23, 'shirt', NULL, 'XXXL', 1, 350.00, 550.00, 550.00, '2026-05-06 12:25:27', '2026-05-06 12:25:27'),
(12, 6, 25, 'panjabi', NULL, 'L', 1, 1800.00, 20000.00, 20000.00, '2026-05-06 13:17:15', '2026-05-06 13:17:15'),
(13, 7, 25, 'panjabi', NULL, 'L', 1, 1800.00, 2000.00, 2000.00, '2026-05-06 13:50:11', '2026-05-06 13:50:11'),
(14, 8, 23, 'shirt', NULL, 'XXXL', 1, 350.00, 500.00, 500.00, '2026-05-07 04:31:12', '2026-05-07 04:31:12'),
(15, 8, 20, 'shirt', NULL, 'L', 1, 350.00, 500.00, 500.00, '2026-05-07 04:31:12', '2026-05-07 04:31:12'),
(16, 8, 21, 'shirt', NULL, 'XL', 1, 350.00, 500.00, 500.00, '2026-05-07 04:31:12', '2026-05-07 04:31:12'),
(17, 8, 22, 'shirt', NULL, 'XXL', 2, 350.00, 500.00, 1000.00, '2026-05-07 04:31:12', '2026-05-07 04:31:12'),
(18, 9, 14, 't-shirts', 'টি শার্ট', 'L', 1, 350.00, 550.00, 550.00, '2026-05-07 12:30:40', '2026-05-07 12:30:40'),
(19, 9, 13, 't-shirts', 'টি শার্ট', 'S', 1, 350.00, 550.00, 550.00, '2026-05-07 12:30:40', '2026-05-07 12:30:40'),
(20, 10, 42, 'MD AL AMIN PATOARI', NULL, 'XXXL', 1, 250.00, 850.00, 850.00, '2026-05-07 12:40:15', '2026-05-07 12:40:15'),
(21, 10, 41, 'MD AL AMIN PATOARI', NULL, 'XXL', 1, 250.00, 450.00, 450.00, '2026-05-07 12:40:15', '2026-05-07 12:40:15'),
(22, 10, 38, 'MD AL AMIN PATOARI', NULL, 'S', 1, 250.00, 980.00, 980.00, '2026-05-07 12:40:15', '2026-05-07 12:40:15'),
(23, 11, 37, 'MD AL AMIN PATOARI', NULL, 'M', 1, 250.00, 520.00, 520.00, '2026-05-07 12:40:49', '2026-05-07 12:40:49'),
(24, 12, 11, 't-shirts', 'টি শার্ট', 'XXXL', 1, 250.00, 450.00, 450.00, '2026-05-08 02:19:35', '2026-05-08 02:19:35'),
(25, 13, 10, 't-shirts', 'টি শার্ট', 'XXL', 1, 250.00, 450.00, 450.00, '2026-05-08 02:22:12', '2026-05-08 02:22:12'),
(26, 14, 11, 't-shirts', 'টি শার্ট', 'XXXL', 1, 250.00, 450.00, 450.00, '2026-05-08 02:23:02', '2026-05-08 02:23:02'),
(27, 15, 55, 'Men\'s Formal Shirt-Blue', NULL, 'M', 3, 249.98, 520.00, 1560.00, '2026-05-08 02:35:37', '2026-05-08 02:35:37'),
(28, 15, 59, 'Men\'s Formal Shirt-Blue', NULL, 'XXL', 8, 249.98, 520.00, 4160.00, '2026-05-08 02:35:37', '2026-05-08 02:35:37'),
(29, 15, 60, 'Men\'s Formal Shirt-Blue', NULL, 'XXXL', 1, 249.98, 520.00, 520.00, '2026-05-08 02:35:37', '2026-05-08 02:35:37'),
(30, 16, 61, 'Casual Shirt Full -Black', NULL, 'M', 2, 249.98, 500.00, 1000.00, '2026-05-08 03:22:42', '2026-05-08 03:22:42'),
(31, 17, 61, 'Casual Shirt Full -Black', NULL, 'M', 1, 249.98, 450.00, 450.00, '2026-05-08 03:24:27', '2026-05-08 03:24:27'),
(32, 18, 66, 'Casual Shirt Full -Black', NULL, 'XXXL', 1, 249.98, 380.00, 380.00, '2026-05-08 03:27:47', '2026-05-08 03:27:47'),
(33, 19, 57, 'Men\'s Formal Shirt-Blue', NULL, 'L', 1, 249.98, 500.00, 500.00, '2026-05-08 10:45:38', '2026-05-08 10:45:38'),
(34, 20, 74, 'wallmet', NULL, 'medium', 1, 250.00, 450.00, 450.00, '2026-05-08 14:28:43', '2026-05-08 14:28:43'),
(35, 21, 56, 'Men\'s Formal Shirt-Blue', NULL, 'S', 1, 250.00, 560.00, 560.00, '2026-05-08 14:34:18', '2026-05-08 14:34:18'),
(36, 22, 72, 'wallmet', NULL, 'big', 1, 250.00, 450.00, 450.00, '2026-05-08 22:29:47', '2026-05-08 22:29:47'),
(37, 23, 72, 'wallmet', NULL, 'big', 1, 250.00, 450.00, 450.00, '2026-05-08 22:54:27', '2026-05-08 22:54:27'),
(38, 24, 75, 'Three Quarter Mens Pant', NULL, '30', 2, 180.00, 419.99, 839.98, '2026-05-09 05:08:47', '2026-05-09 05:08:47'),
(39, 25, 72, 'wallmet', NULL, 'big', 1, 250.00, 450.00, 450.00, '2026-05-09 08:39:53', '2026-05-09 08:39:53'),
(40, 26, 72, 'wallmet', NULL, 'big', 1, 250.00, 450.00, 450.00, '2026-05-09 08:40:39', '2026-05-09 08:40:39'),
(41, 26, 74, 'wallmet', NULL, 'medium', 1, 250.00, 450.00, 450.00, '2026-05-09 08:40:39', '2026-05-09 08:40:39'),
(42, 27, 33, 'Pants', NULL, '28', 1, 850.00, 1200.00, 1200.00, '2026-05-10 06:22:56', '2026-05-10 06:22:56'),
(43, 28, 33, 'Pants', NULL, '28', 1, 850.00, 1200.00, 1200.00, '2026-05-10 06:24:33', '2026-05-10 06:24:33'),
(44, 28, 36, 'Pants', NULL, '42', 1, 850.00, 1200.00, 1200.00, '2026-05-10 06:24:33', '2026-05-10 06:24:33'),
(45, 28, 35, 'Pants', NULL, '30', 1, 850.00, 1200.00, 1200.00, '2026-05-10 06:24:33', '2026-05-10 06:24:33'),
(46, 28, 34, 'Pants', NULL, '32', 1, 850.00, 1200.00, 1200.00, '2026-05-10 06:24:33', '2026-05-10 06:24:33'),
(47, 29, 77, 'Three Quarter Mens Pant', NULL, '28', 1, 180.00, 419.99, 419.99, '2026-05-12 04:06:30', '2026-05-12 04:06:30'),
(48, 30, 77, 'Three Quarter Mens Pant', NULL, '28', 1, 180.00, 419.99, 419.99, '2026-05-12 04:09:01', '2026-05-12 04:09:01'),
(49, 31, 72, 'wallmet', NULL, 'big', 2, 250.00, 450.00, 900.00, '2026-05-12 05:57:35', '2026-05-12 05:57:35'),
(50, 31, 73, 'wallmet', NULL, 'asmall', 3, 250.00, 450.00, 1350.00, '2026-05-12 05:57:35', '2026-05-12 05:57:35'),
(51, 31, 74, 'wallmet', NULL, 'medium', 4, 250.00, 450.00, 1800.00, '2026-05-12 05:57:35', '2026-05-12 05:57:35'),
(52, 32, 24, 'panjabi', NULL, 'M', 5, 1800.00, 2500.00, 12500.00, '2026-05-12 06:30:35', '2026-05-12 06:30:35'),
(53, 32, 25, 'panjabi', NULL, 'L', 10, 1800.00, 2500.00, 25000.00, '2026-05-12 06:30:35', '2026-05-12 06:30:35'),
(54, 33, 24, 'panjabi', NULL, 'M', 5, 1800.00, 2500.00, 12500.00, '2026-05-12 22:29:42', '2026-05-12 22:29:42'),
(55, 33, 25, 'panjabi', NULL, 'L', 5, 1800.00, 2500.00, 12500.00, '2026-05-12 22:29:42', '2026-05-12 22:29:42'),
(56, 34, 61, 'Casual Shirt Full -Black', NULL, 'M', 1, 249.98, 500.00, 500.00, '2026-05-14 00:13:07', '2026-05-14 00:13:07'),
(57, 35, 64, 'Casual Shirt Full -Black', NULL, 'XL', 3, 249.98, 500.00, 1500.00, '2026-05-14 00:17:42', '2026-05-14 00:17:42'),
(58, 36, 66, 'Casual Shirt Full -Black', NULL, 'XXXL', 4, 249.98, 550.00, 2200.00, '2026-05-14 00:23:19', '2026-05-14 00:23:19'),
(59, 36, 64, 'Casual Shirt Full -Black', NULL, 'XL', 1, 249.98, 520.00, 520.00, '2026-05-14 00:23:19', '2026-05-14 00:23:19'),
(60, 36, 63, 'Casual Shirt Full -Black', NULL, 'L', 4, 249.98, 500.00, 2000.00, '2026-05-14 00:23:19', '2026-05-14 00:23:19'),
(61, 37, 65, 'Casual Shirt Full -Black', NULL, 'XXL', 2, 249.98, 600.00, 1200.00, '2026-05-14 00:24:38', '2026-05-14 00:24:38'),
(62, 38, 66, 'Casual Shirt Full -Black', NULL, 'XXXL', 1, 249.98, 800.00, 800.00, '2026-05-14 00:29:02', '2026-05-14 00:29:02'),
(63, 39, 66, 'Casual Shirt Full -Black', NULL, 'XXXL', 1, 249.98, 750.00, 750.00, '2026-05-14 00:30:36', '2026-05-14 00:30:36'),
(64, 40, 63, 'Casual Shirt Full -Black', NULL, 'L', 1, 249.98, 590.00, 590.00, '2026-05-14 00:45:40', '2026-05-14 00:45:40'),
(65, 41, 65, 'Casual Shirt Full -Black', NULL, 'XXL', 1, 249.98, 630.00, 630.00, '2026-05-14 01:05:43', '2026-05-14 01:05:43');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` longtext DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'text',
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `label` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `key`, `value`, `type`, `group`, `label`, `description`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'YOUNA FASHION', 'text', 'general', 'Site Name', 'The name of your shop displayed across the site', '2026-05-06 11:37:25', '2026-05-06 11:52:37'),
(2, 'site_tagline', 'Premium Men\'s Fashion', 'text', 'general', 'Tagline', 'Short tagline shown below the site name', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(3, 'site_logo', 'site/m79Qav8PrNEfiavCpp0wQslDSV4BVnWYqWoVmnhr.png', 'image', 'general', 'Site Logo', 'Logo image (PNG/SVG recommended, max 2MB)', '2026-05-06 11:37:25', '2026-05-06 11:52:21'),
(4, 'favicon', 'site/xbq906CLbdLLK8OKjG8nxWvsWQYszCgr18kaHnob.png', 'image', 'general', 'Favicon', 'Browser tab icon (PNG/ICO, 32×32px recommended)', '2026-05-06 11:37:25', '2026-05-07 03:47:50'),
(5, 'site_currency', '৳', 'text', 'general', 'Currency Symbol', 'Currency symbol used throughout the site', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(6, 'site_language', 'en', 'text', 'general', 'Default Language', 'Default language (en or bn)', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(7, 'hero_title', 'Explore Our Newest Clothing Collection', 'text', 'homepage', 'Hero Title', 'Main heading on the homepage hero section', '2026-05-06 11:37:25', '2026-05-10 03:47:54'),
(8, 'hero_subtitle', 'Exclusive Offers For You', 'textarea', 'homepage', 'Hero Subtitle', 'Subtext below the hero title', '2026-05-06 11:37:25', '2026-05-10 03:47:54'),
(9, 'hero_button_text', 'Shop Now', 'text', 'homepage', 'Hero Button Text', 'Call-to-action button label in the hero', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(10, 'hero_background_image', NULL, 'image', 'homepage', 'Hero Background Image', 'Background image for the hero section (optional)', '2026-05-06 11:37:25', '2026-05-09 00:20:06'),
(11, 'hero_bg_color', '#f10000', 'color', 'homepage', 'Hero Background Color', 'Gradient start color for the hero section', '2026-05-06 11:37:25', '2026-05-07 05:15:43'),
(12, 'featured_products_title', 'Featured Products', 'text', 'homepage', 'Featured Section Title', 'Heading for the featured products section', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(13, 'show_announcements', '1', 'boolean', 'homepage', 'Show Announcements', 'Display announcements on the homepage', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(14, 'products_per_page', '8', 'text', 'homepage', 'Products Per Page', 'Number of products shown on homepage', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(15, 'contact_address', 'Polli Biddyut, Savar, Dhaka, Bangladesh', 'text', 'contact', 'Address', 'Shop physical address', '2026-05-06 11:37:25', '2026-05-06 14:31:08'),
(16, 'contact_phone', '+880 1838104366', 'text', 'contact', 'Phone Number', 'Primary contact phone number', '2026-05-06 11:37:25', '2026-05-06 11:59:02'),
(17, 'contact_email', 'info@gentsshop.com', 'text', 'contact', 'Email Address', 'Primary contact email address', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(18, 'contact_whatsapp', '', 'text', 'contact', 'WhatsApp Number', 'WhatsApp number for customer support', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(19, 'business_hours', 'Sat–Thu: 10am – 9pm', 'text', 'contact', 'Business Hours', 'Shop opening hours', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(20, 'social_facebook', '', 'text', 'social', 'Facebook URL', 'Full Facebook page URL', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(21, 'social_instagram', '', 'text', 'social', 'Instagram URL', 'Full Instagram profile URL', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(22, 'social_youtube', '', 'text', 'social', 'YouTube URL', 'Full YouTube channel URL', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(23, 'social_tiktok', '', 'text', 'social', 'TikTok URL', 'Full TikTok profile URL', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(24, 'meta_title', 'Youna Fashion – Premium Men\'s Fashion in Bangladesh', 'text', 'seo', 'Meta Title', 'Browser tab title and search engine title (max 60 chars)', '2026-05-06 11:37:25', '2026-05-07 03:04:59'),
(25, 'meta_description', 'Shop premium men\'s clothing and accessories at Gents Shop. Shirts, pants, panjabi, t-shirts and more.', 'textarea', 'seo', 'Meta Description', 'Search engine description (max 160 chars)', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(26, 'meta_keywords', 'gents shop, men clothing, shirts, pants, panjabi, bangladesh', 'text', 'seo', 'Meta Keywords', 'Comma-separated keywords for search engines', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(27, 'footer_about', 'Your one-stop destination for premium men\'s clothing and accessories in Bangladesh.', 'textarea', 'footer', 'About Text', 'Short description shown in the footer', '2026-05-06 11:37:25', '2026-05-06 11:37:25'),
(28, 'footer_copyright', 'YOUNA FASHION HOUSE, Premium Men\'s Fashion', 'text', 'footer', 'Copyright Text', 'Copyright notice at the bottom of the footer', '2026-05-06 11:37:25', '2026-05-09 06:24:03'),
(29, 'hero_carousel_interval', '6999', 'number', 'homepage', 'Hero Carousel Interval (ms)', 'Time in milliseconds before changing to next slide (1000ms = 1 second)', '2026-05-10 11:25:16', '2026-05-13 08:08:20'),
(30, 'hero_carousel_transition', 'slide', 'select', 'homepage', 'Hero Carousel Transition Style', 'Animation style when changing slides', '2026-05-10 11:25:16', '2026-05-13 05:12:13'),
(31, 'hero_show_title', '0', 'boolean', 'homepage', 'Show Hero Title & Subtitle', 'Display the title and subtitle text on the hero section', '2026-05-13 06:42:12', '2026-05-13 06:45:38'),
(32, 'hero_show_search', '0', 'boolean', 'homepage', 'Show Hero Search Bar', 'Display the search bar on the hero section', '2026-05-13 06:42:12', '2026-05-13 06:45:38'),
(33, 'hero_show_buttons', '0', 'boolean', 'homepage', 'Show Hero Buttons', 'Display the Shop Now and action buttons on the hero section', '2026-05-13 06:42:12', '2026-05-13 06:45:38');

-- --------------------------------------------------------

--
-- Table structure for table `themes`
--

CREATE TABLE `themes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `occasion` enum('eid_ul_fitr','eid_ul_adha','pohela_boishakh','independence_day','victory_day','mother_language_day','default','custom') NOT NULL,
  `css_variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`css_variables`)),
  `banner_image` varchar(255) DEFAULT NULL,
  `flying_symbols_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `max_flying_symbols` int(11) NOT NULL DEFAULT 15,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `themes`
--

INSERT INTO `themes` (`id`, `name`, `slug`, `occasion`, `css_variables`, `banner_image`, `flying_symbols_enabled`, `max_flying_symbols`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'Default Theme', 'default', 'default', '{\"primary\":\"#3b82f6\",\"secondary\":\"#1e40af\"}', NULL, 0, 15, 1, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(2, 'Eid-ul-Fitr', 'eid-ul-fitr', 'eid_ul_fitr', '{\"primary\":\"#10b981\",\"secondary\":\"#065f46\",\"accent\":\"#fbbf24\"}', NULL, 1, 15, 0, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(3, 'Eid-ul-Adha', 'eid-ul-adha', 'eid_ul_adha', '{\"primary\":\"#059669\",\"secondary\":\"#064e3b\",\"accent\":\"#d97706\"}', NULL, 1, 12, 0, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(4, 'Pohela Boishakh', 'pohela-boishakh', 'pohela_boishakh', '{\"primary\":\"#dc2626\",\"secondary\":\"#7f1d1d\",\"accent\":\"#fbbf24\"}', NULL, 1, 15, 0, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(5, 'Independence Day', 'independence-day', 'independence_day', '{\"primary\":\"#16a34a\",\"secondary\":\"#14532d\",\"accent\":\"#dc2626\"}', NULL, 1, 10, 0, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(6, 'Victory Day', 'victory-day', 'victory_day', '{\"primary\":\"#16a34a\",\"secondary\":\"#14532d\",\"accent\":\"#dc2626\"}', NULL, 1, 10, 0, '2026-05-06 10:06:32', '2026-05-06 10:06:32'),
(7, 'Mother Language Day', 'mother-language-day', 'mother_language_day', '{\"primary\":\"#7c3aed\",\"secondary\":\"#4c1d95\",\"accent\":\"#f59e0b\"}', NULL, 1, 12, 0, '2026-05-06 10:06:32', '2026-05-06 10:06:32');

-- --------------------------------------------------------

--
-- Table structure for table `theme_configurations`
--

CREATE TABLE `theme_configurations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `theme_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `theme_configurations`
--

INSERT INTO `theme_configurations` (`id`, `theme_id`, `created_by`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-05-06', '2026-05-06', 1, '2026-05-06 10:14:50', '2026-05-06 10:14:50'),
(2, 1, 1, '2026-05-06', '2026-05-06', 1, '2026-05-06 10:14:51', '2026-05-06 10:14:51'),
(3, 1, 1, '2026-05-06', '2026-05-06', 1, '2026-05-06 10:16:05', '2026-05-06 10:16:05'),
(4, 2, 1, '2026-05-06', '2026-05-06', 1, '2026-05-06 10:16:49', '2026-05-06 10:16:49'),
(5, 3, 1, '2026-05-06', '2026-05-06', 1, '2026-05-06 13:30:08', '2026-05-06 13:30:08'),
(6, 3, 1, '2026-05-06', '2026-05-06', 1, '2026-05-06 13:42:58', '2026-05-06 13:42:58'),
(7, 3, 1, '2026-05-07', '2026-05-07', 1, '2026-05-07 05:46:50', '2026-05-07 05:46:50'),
(8, 1, 1, '2026-05-07', '2026-05-07', 1, '2026-05-07 05:56:13', '2026-05-07 05:56:13'),
(9, 3, 1, '2026-05-07', '2026-05-07', 1, '2026-05-07 09:52:22', '2026-05-07 09:52:22'),
(10, 3, 1, '2026-05-08', '2026-05-08', 1, '2026-05-08 12:14:10', '2026-05-08 12:14:10');

-- --------------------------------------------------------

--
-- Table structure for table `theme_icons`
--

CREATE TABLE `theme_icons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `theme_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `theme_icons`
--

INSERT INTO `theme_icons` (`id`, `theme_id`, `file_path`, `original_name`, `sort_order`, `created_at`, `updated_at`) VALUES
(6, 3, 'theme-icons/pevKs6zIo8vzEH6WnEo97AVTOEwCjmkQ93V585YY.png', '5d5c3475e174c21d6a750b7ee29dcbe1-removebg-preview.png', 0, '2026-05-06 13:42:01', '2026-05-06 13:42:01'),
(7, 3, 'theme-icons/4TJR2nzG3pEj9oo60wxG2faQmBpYpvPRl6YZ7Nfv.png', '716E0X3gR7L._AC_UF894_1000_QL80_-removebg-preview.png', 1, '2026-05-06 13:42:06', '2026-05-06 13:42:06'),
(8, 3, 'theme-icons/JBh4fKNgkbpvYXuC4MmrptxdBprSy47wjn68BBFg.png', '5316763-removebg-preview.png', 2, '2026-05-06 13:42:09', '2026-05-06 13:42:09'),
(9, 3, 'theme-icons/y7YJxHV8RgX2U0NMXYeA4Z6c3myARoMim4oO7e1d.png', 'Screenshot_2026-05-07_013418-removebg-preview.png', 3, '2026-05-06 13:42:14', '2026-05-06 13:42:14'),
(10, 3, 'theme-icons/KZmXmFHHRP9KBkzWfuAuLA0lzXmUMz8G5GMivyhs.png', 'pngtree-allah-calligraphy-clipart-vector-png-image_9169659-removebg-preview.png', 4, '2026-05-06 13:42:17', '2026-05-06 13:42:17'),
(11, 3, 'theme-icons/SMZve3PelP7uUjFMw1cRqhJJPr3EWPF5w6WHazmT.png', 'Screenshot_2026-05-07_013337-removebg-preview.png', 5, '2026-05-06 13:42:20', '2026-05-06 13:42:20'),
(12, 3, 'theme-icons/FNPh7DW88fqi3l7x0EUDUQSOZ7MUnflKTNXFEGaH.png', 'Screenshot_2026-05-07_013459-removebg-preview.png', 6, '2026-05-06 13:42:24', '2026-05-06 13:42:24'),
(13, 3, 'theme-icons/QLbiZZUSKkBYlcqgsCGTniIKZD6jxmyX0m5ssZU4.png', 'happy-eid-al-adha-muslim-festival-celebration-eid-al-adha-calligraphy-design-with-golden-arabesque-decorations-golden-moon-vector-free-png-removebg-preview.png', 7, '2026-05-06 13:42:28', '2026-05-06 13:42:28'),
(14, 3, 'theme-icons/56NJhM1bqFuh5Sia9YNZZTxZUG22g2DaFic4ISJl.png', 'Screenshot_2026-05-07_013405-removebg-preview.png', 8, '2026-05-06 13:42:33', '2026-05-06 13:42:33'),
(15, 3, 'theme-icons/TGix7kgfD2txAluE2A6TLH9WnDNPE1Shvy9CDzUR.png', 'Screenshot_2026-05-07_013459-removebg-preview.png', 9, '2026-05-06 13:42:40', '2026-05-06 13:42:40'),
(16, 3, 'theme-icons/06XyZwaJjuO4WvneHvaIc4iexlODFbVJFVeRpyCy.png', 'Screenshot_2026-05-07_013337-removebg-preview.png', 10, '2026-05-06 13:42:53', '2026-05-06 13:42:53');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` varchar(50) NOT NULL DEFAULT 'customer',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `email_verified_at`, `password`, `user_type`, `is_active`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(6, 'MD AL AMIN PATOARI', 'alamin@tinkonna.com', '01645512233', NULL, '$2y$12$QLpT.b3PEyzgtIAKtr.KXu5z3fjmdh36EMLwaFeBrBXNK5bigiH/C', 'customer', 1, NULL, '2026-05-09 03:10:39', '2026-05-09 03:10:39', NULL),
(9, 'MANAGR', 'managr@gentsshop.com', '01895431599', NULL, '$2y$12$mw99Z7EuXJLqWEIcFbleEeeydFabvgyADtZhraKLdz/RaJ8ehxQIC', 'Managr', 1, NULL, '2026-05-09 04:44:59', '2026-05-09 04:44:59', NULL),
(10, 'STAFF', 'staff@gentsshop.com', '01489965588', NULL, '$2y$12$gXzOQGQzEXKm5hdU5jgBLOb5.B4M3BH6.70E24q2zVe0r.0WJ/qgK', 'staff', 1, NULL, '2026-05-09 04:55:12', '2026-05-09 04:55:12', NULL),
(11, 'Clark', 'clark@gentsshop.com', '01489975533', NULL, '$2y$12$e5uChgwCdix3Gmaz4kDMyOYZEygaW7ymsyrVKi/iCwqF7CsrpLli6', 'Clark', 1, NULL, '2026-05-09 05:06:01', '2026-05-09 05:06:01', NULL),
(12, 'Sales Managr', 'smanagr@gentsshop.com', '01836749566', NULL, '$2y$12$N6vh9UU2U35LMe3SV3150umtZkZzawBWQ9wivjd7B0kH8f3WGD5Iu', 'Sales Managr', 1, NULL, '2026-05-09 06:00:27', '2026-05-09 06:00:27', NULL),
(13, 'Titu Patoari', 'admin@tinkonna.com', '01838104366', NULL, '$2y$12$A.MQaTkEhFyIvYkWJaMNhufxeEkssx4Zx5fm61OIPgEJ/DwPAAoTO', 'admin', 1, NULL, '2026-05-09 13:20:59', '2026-05-09 13:20:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_widget_preferences`
--

CREATE TABLE `user_widget_preferences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `dashboard_widget_id` bigint(20) UNSIGNED NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_collapsed` tinyint(1) NOT NULL DEFAULT 0,
  `custom_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_settings`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `announcements_created_by_foreign` (`created_by`),
  ADD KEY `announcements_display_start_date_display_end_date_index` (`display_start_date`,`display_end_date`),
  ADD KEY `announcements_type_index` (`type`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_foreign` (`user_id`),
  ADD KEY `audit_logs_model_type_model_id_index` (`model_type`,`model_id`),
  ADD KEY `audit_logs_action_index` (`action`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookings_booking_number_unique` (`booking_number`),
  ADD KEY `bookings_user_id_foreign` (`user_id`),
  ADD KEY `bookings_product_variant_id_foreign` (`product_variant_id`),
  ADD KEY `bookings_booking_number_index` (`booking_number`),
  ADD KEY `bookings_status_index` (`status`),
  ADD KEY `bookings_expiry_date_index` (`expiry_date`);

--
-- Indexes for table `booking_payments`
--
ALTER TABLE `booking_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_payments_booking_id_foreign` (`booking_id`),
  ADD KEY `booking_payments_verified_by_foreign` (`verified_by`),
  ADD KEY `booking_payments_status_index` (`status`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_items_user_id_product_variant_id_unique` (`user_id`,`product_variant_id`),
  ADD KEY `cart_items_product_variant_id_foreign` (`product_variant_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Indexes for table `customer_profiles`
--
ALTER TABLE `customer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_profiles_user_id_foreign` (`user_id`);

--
-- Indexes for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dashboard_widgets_slug_unique` (`slug`);

--
-- Indexes for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `delivery_addresses_user_id_foreign` (`user_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_user_id_foreign` (`user_id`),
  ADD KEY `expenses_expense_date_index` (`expense_date`),
  ADD KEY `expenses_category_index` (`category`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `hero_background_images`
--
ALTER TABLE `hero_background_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mobile_banking_accounts`
--
ALTER TABLE `mobile_banking_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `owner_transactions`
--
ALTER TABLE `owner_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_transactions_user_id_foreign` (`user_id`),
  ADD KEY `owner_transactions_related_transaction_id_foreign` (`related_transaction_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_base_product_id_unique` (`base_product_id`),
  ADD KEY `products_base_product_id_index` (`base_product_id`),
  ADD KEY `products_category_index` (`category`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variants_product_variant_id_unique` (`product_variant_id`),
  ADD UNIQUE KEY `product_variants_barcode_unique` (`barcode`),
  ADD KEY `product_variants_product_id_foreign` (`product_id`),
  ADD KEY `product_variants_product_variant_id_index` (`product_variant_id`),
  ADD KEY `product_variants_barcode_index` (`barcode`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_orders_order_number_unique` (`order_number`),
  ADD UNIQUE KEY `purchase_orders_transaction_reference_unique` (`transaction_reference`),
  ADD KEY `purchase_orders_user_id_foreign` (`user_id`),
  ADD KEY `purchase_orders_verified_by_foreign` (`verified_by`),
  ADD KEY `purchase_orders_order_number_index` (`order_number`),
  ADD KEY `purchase_orders_status_index` (`status`),
  ADD KEY `purchase_orders_payment_status_index` (`payment_status`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_items_purchase_order_id_foreign` (`purchase_order_id`),
  ADD KEY `purchase_order_items_product_variant_id_foreign` (`product_variant_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_dashboard_widgets`
--
ALTER TABLE `role_dashboard_widgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_dashboard_widgets_role_id_dashboard_widget_id_unique` (`role_id`,`dashboard_widget_id`),
  ADD KEY `role_dashboard_widgets_dashboard_widget_id_foreign` (`dashboard_widget_id`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sales_transactions_transaction_number_unique` (`transaction_number`),
  ADD KEY `sales_transactions_user_id_foreign` (`user_id`),
  ADD KEY `sales_transactions_customer_id_foreign` (`customer_id`),
  ADD KEY `sales_transactions_transaction_date_index` (`transaction_date`),
  ADD KEY `sales_transactions_transaction_number_index` (`transaction_number`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_items_sales_transaction_id_foreign` (`sales_transaction_id`),
  ADD KEY `sale_items_product_variant_id_foreign` (`product_variant_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `site_settings_key_unique` (`key`);

--
-- Indexes for table `themes`
--
ALTER TABLE `themes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `themes_slug_unique` (`slug`);

--
-- Indexes for table `theme_configurations`
--
ALTER TABLE `theme_configurations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `theme_configurations_theme_id_foreign` (`theme_id`),
  ADD KEY `theme_configurations_created_by_foreign` (`created_by`),
  ADD KEY `theme_configurations_start_date_end_date_index` (`start_date`,`end_date`);

--
-- Indexes for table `theme_icons`
--
ALTER TABLE `theme_icons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `theme_icons_theme_id_foreign` (`theme_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`);

--
-- Indexes for table `user_widget_preferences`
--
ALTER TABLE `user_widget_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_widget_preferences_user_id_dashboard_widget_id_unique` (`user_id`,`dashboard_widget_id`),
  ADD KEY `user_widget_preferences_dashboard_widget_id_foreign` (`dashboard_widget_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `booking_payments`
--
ALTER TABLE `booking_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customer_profiles`
--
ALTER TABLE `customer_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hero_background_images`
--
ALTER TABLE `hero_background_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `mobile_banking_accounts`
--
ALTER TABLE `mobile_banking_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `owner_transactions`
--
ALTER TABLE `owner_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `role_dashboard_widgets`
--
ALTER TABLE `role_dashboard_widgets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `themes`
--
ALTER TABLE `themes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `theme_configurations`
--
ALTER TABLE `theme_configurations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `theme_icons`
--
ALTER TABLE `theme_icons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `user_widget_preferences`
--
ALTER TABLE `user_widget_preferences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `owner_transactions`
--
ALTER TABLE `owner_transactions`
  ADD CONSTRAINT `owner_transactions_related_transaction_id_foreign` FOREIGN KEY (`related_transaction_id`) REFERENCES `owner_transactions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `owner_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
