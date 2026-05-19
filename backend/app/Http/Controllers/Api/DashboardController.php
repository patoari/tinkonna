<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Expense;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SalesTransaction;
use App\Models\OwnerTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();
        $yesterday = today()->subDay();

        // Today's stats - include both in-store sales and verified online orders
        $todayTransactions = SalesTransaction::whereDate('transaction_date', $today)
            ->where('status', 'completed')
            ->with('items')
            ->get();

        $yesterdayTransactions = SalesTransaction::whereDate('transaction_date', $yesterday)
            ->where('status', 'completed')
            ->get();

        // Include verified online orders in today's revenue
        $todayOnlineOrders = \App\Models\PurchaseOrder::whereDate('created_at', $today)
            ->where('payment_status', 'verified')
            ->sum('total_amount');

        $todayOnlineOrdersCount = \App\Models\PurchaseOrder::whereDate('created_at', $today)
            ->where('payment_status', 'verified')
            ->count();

        $yesterdayOnlineOrders = \App\Models\PurchaseOrder::whereDate('created_at', $yesterday)
            ->where('payment_status', 'verified')
            ->sum('total_amount');

        $yesterdayOnlineOrdersCount = \App\Models\PurchaseOrder::whereDate('created_at', $yesterday)
            ->where('payment_status', 'verified')
            ->count();

        $todayRevenue = $todayTransactions->sum('net_amount') + $todayOnlineOrders;
        $yesterdayRevenue = $yesterdayTransactions->sum('net_amount') + $yesterdayOnlineOrders;
        $todayExpenses = Expense::whereDate('expense_date', $today)->sum('amount');

        // CRITICAL FIX: Cash on hand calculation separated by payment source
        // Shop Cash = shop_cash transactions only
        // Online Cash = online transactions + verified online orders
        // Bank Cash = bank transactions only

        // Shop cash (physical cash in shop) - only shop_cash transactions
        $shopRevenue = SalesTransaction::where('status', 'completed')
            ->where('payment_source', 'shop_cash')
            ->sum('net_amount');

        $shopExpenses = Expense::where('payment_source', 'shop_cash')->sum('amount');

        $shopOwnerWithdrawals = OwnerTransaction::where('type', 'withdrawal')
            ->where('payment_source', 'shop_cash')
            ->sum('amount');
        $shopOwnerDeposits = OwnerTransaction::where('type', 'deposit')
            ->where('payment_source', 'shop_cash')
            ->sum('amount');
        $shopLoansGiven = OwnerTransaction::where('type', 'loan')
            ->where('payment_source', 'shop_cash')
            ->sum('amount');
        $shopLoansReceived = OwnerTransaction::where('type', 'loan_repayment')
            ->where('payment_source', 'shop_cash')
            ->sum('amount');

        $shopCash = $shopRevenue - $shopExpenses
                  - $shopOwnerWithdrawals + $shopOwnerDeposits
                  - $shopLoansGiven + $shopLoansReceived;

        // Online cash (digital payments) - online transactions + verified online orders
        $onlineRevenue = SalesTransaction::where('status', 'completed')
            ->where('payment_source', 'online')
            ->sum('net_amount');

        $verifiedOnlineOrders = \App\Models\PurchaseOrder::where('payment_status', 'verified')
            ->sum('total_amount');

        $onlineExpenses = Expense::where('payment_source', 'online')->sum('amount');

        $onlineOwnerWithdrawals = OwnerTransaction::where('type', 'withdrawal')
            ->where('payment_source', 'online')
            ->sum('amount');
        $onlineOwnerDeposits = OwnerTransaction::where('type', 'deposit')
            ->where('payment_source', 'online')
            ->sum('amount');
        $onlineLoansGiven = OwnerTransaction::where('type', 'loan')
            ->where('payment_source', 'online')
            ->sum('amount');
        $onlineLoansReceived = OwnerTransaction::where('type', 'loan_repayment')
            ->where('payment_source', 'online')
            ->sum('amount');

        $onlineCash = $onlineRevenue + $verifiedOnlineOrders - $onlineExpenses
                    - $onlineOwnerWithdrawals + $onlineOwnerDeposits
                    - $onlineLoansGiven + $onlineLoansReceived;

        // Bank cash (bank transfers)
        $bankRevenue = SalesTransaction::where('status', 'completed')
            ->where('payment_source', 'bank')
            ->sum('net_amount');

        $bankExpenses = Expense::where('payment_source', 'bank')->sum('amount');

        $bankOwnerWithdrawals = OwnerTransaction::where('type', 'withdrawal')
            ->where('payment_source', 'bank')
            ->sum('amount');
        $bankOwnerDeposits = OwnerTransaction::where('type', 'deposit')
            ->where('payment_source', 'bank')
            ->sum('amount');
        $bankLoansGiven = OwnerTransaction::where('type', 'loan')
            ->where('payment_source', 'bank')
            ->sum('amount');
        $bankLoansReceived = OwnerTransaction::where('type', 'loan_repayment')
            ->where('payment_source', 'bank')
            ->sum('amount');

        $bankCash = $bankRevenue - $bankExpenses
                  - $bankOwnerWithdrawals + $bankOwnerDeposits
                  - $bankLoansGiven + $bankLoansReceived;

        // Net cash (total of all three)
        $netCash = $shopCash + $onlineCash + $bankCash;

        $revenueChange = $yesterdayRevenue > 0
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
            : 0;

        $todayTotalTransactions = $todayTransactions->count() + $todayOnlineOrdersCount;
        $yesterdayTotalTransactions = $yesterdayTransactions->count() + $yesterdayOnlineOrdersCount;

        $transactionChange = $yesterdayTotalTransactions > 0
            ? round((($todayTotalTransactions - $yesterdayTotalTransactions) / $yesterdayTotalTransactions) * 100, 1)
            : 0;

        // Weekly chart - include both in-store sales and verified online orders
        $weeklyChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = today()->subDays($i);
            $dayRevenue = SalesTransaction::whereDate('transaction_date', $date)
                ->where('status', 'completed')
                ->sum('net_amount');
            $dayOnlineRevenue = \App\Models\PurchaseOrder::whereDate('created_at', $date)
                ->where('payment_status', 'verified')
                ->sum('total_amount');
            $weeklyChart[] = [
                'date' => $date->toDateString(),
                'revenue' => $dayRevenue + $dayOnlineRevenue,
            ];
        }

        // Category sales (last 30 days)
        $categorySales = DB::table('sale_items')
            ->join('product_variants', 'sale_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('sales_transactions', 'sale_items.sales_transaction_id', '=', 'sales_transactions.id')
            ->where('sales_transactions.transaction_date', '>=', now()->subDays(30))
            ->where('sales_transactions.status', 'completed')
            ->select('products.category', DB::raw('SUM(sale_items.subtotal) as revenue'))
            ->groupBy('products.category')
            ->get();

        // Low stock items
        $lowStockItems = ProductVariant::with('product')
            ->where('quantity', '<=', 5)
            ->where('is_active', true)
            ->orderBy('quantity')
            ->take(10)
            ->get();

        // Recent transactions
        $recentTransactions = SalesTransaction::with('items')
            ->whereDate('transaction_date', $today)
            ->where('status', 'completed')
            ->latest('transaction_date')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'today_revenue' => $todayRevenue,
                'today_transactions' => $todayTotalTransactions,
                'total_products' => Product::where('is_active', true)->count(),
                'shop_cash' => $shopCash,
                'online_cash' => $onlineCash,
                'bank_cash' => $bankCash,
                'net_cash' => $netCash,
                'revenue_change' => $revenueChange,
                'transaction_change' => $transactionChange,
            ],
            'weekly_chart' => $weeklyChart,
            'category_sales' => $categorySales,
            'low_stock_items' => $lowStockItems,
            'recent_transactions' => $recentTransactions,
            'pending_bookings' => Booking::whereIn('status', ['active', 'pending_payment'])->count(),
            'pending_payments' => BookingPayment::where('status', 'pending')->count(),
        ]);
    }

    public function monthlyRevenue(Request $request)
    {
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();

        // Get all sales transactions for the month
        $transactions = SalesTransaction::with('items')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->get();

        // Calculate total selling price and total buying price (COGS)
        $totalSellingPrice = $transactions->sum('net_amount');
        $totalBuyingPrice = $transactions->flatMap->items->sum(fn($item) => $item->buying_price * $item->quantity);

        // Add verified online orders (they don't have COGS tracked, so we'll use 0 for now)
        $onlineOrders = \App\Models\PurchaseOrder::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'verified')
            ->sum('total_amount');

        $totalSellingPrice += $onlineOrders;

        // Gross Profit = Selling Price - Buying Price
        $grossProfit = $totalSellingPrice - $totalBuyingPrice;

        // Total Expenses for the month
        $totalExpenses = Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->sum('amount');

        // Net Income = Gross Profit - Expenses
        $netIncome = $grossProfit - $totalExpenses;

        // Breakdown by payment source
        $shopCashSales = SalesTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->where('payment_source', 'shop_cash')
            ->sum('net_amount');

        $mobileBankingSales = SalesTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->where('payment_source', 'online')
            ->sum('net_amount') + $onlineOrders;

        $bankSales = SalesTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->where('payment_source', 'bank')
            ->sum('net_amount');

        // Previous month comparison
        $prevStartDate = \Carbon\Carbon::create($year, $month, 1)->subMonth()->startOfMonth();
        $prevEndDate = \Carbon\Carbon::create($year, $month, 1)->subMonth()->endOfMonth();

        $prevTransactions = SalesTransaction::with('items')
            ->whereBetween('transaction_date', [$prevStartDate, $prevEndDate])
            ->where('status', 'completed')
            ->get();

        $prevSellingPrice = $prevTransactions->sum('net_amount');
        $prevBuyingPrice = $prevTransactions->flatMap->items->sum(fn($item) => $item->buying_price * $item->quantity);
        
        $prevOnlineOrders = \App\Models\PurchaseOrder::whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->where('payment_status', 'verified')
            ->sum('total_amount');
        
        $prevSellingPrice += $prevOnlineOrders;
        $prevGrossProfit = $prevSellingPrice - $prevBuyingPrice;

        $prevExpenses = Expense::whereBetween('expense_date', [$prevStartDate, $prevEndDate])
            ->sum('amount');
        
        $prevNetIncome = $prevGrossProfit - $prevExpenses;

        $changeAmount = $netIncome - $prevNetIncome;
        $changePercentage = $prevNetIncome > 0 
            ? round((($netIncome - $prevNetIncome) / $prevNetIncome) * 100, 1)
            : 0;

        // Transaction count
        $transactionCount = $transactions->count();

        return response()->json([
            'year' => $year,
            'month' => $month,
            'month_name' => $startDate->format('F'),
            'income' => [
                'total_selling_price' => $totalSellingPrice,
                'total_buying_price' => $totalBuyingPrice,
                'gross_profit' => $grossProfit,
                'total_expenses' => $totalExpenses,
                'net_income' => $netIncome,
                'transaction_count' => $transactionCount,
            ],
            'breakdown' => [
                'shop_cash' => $shopCashSales,
                'mobile_banking' => $mobileBankingSales,
                'bank' => $bankSales,
            ],
            'comparison' => [
                'previous_month' => [
                    'net_income' => $prevNetIncome,
                    'change_amount' => $changeAmount,
                    'change_percentage' => $changePercentage,
                ],
            ],
        ]);
    }

    public function dailyRevenue(Request $request)
    {
        $date = $request->date ?? now()->toDateString();
        $selectedDate = \Carbon\Carbon::parse($date);

        // Get all sales transactions for the day
        $transactions = SalesTransaction::with('items')
            ->whereDate('transaction_date', $date)
            ->where('status', 'completed')
            ->get();

        // Calculate total selling price and total buying price (COGS)
        $totalSellingPrice = $transactions->sum('net_amount');
        $totalBuyingPrice = $transactions->flatMap->items->sum(fn($item) => $item->buying_price * $item->quantity);

        // Add verified online orders
        $onlineOrders = \App\Models\PurchaseOrder::whereDate('created_at', $date)
            ->where('payment_status', 'verified')
            ->sum('total_amount');

        $totalSellingPrice += $onlineOrders;

        // Gross Profit = Selling Price - Buying Price
        $grossProfit = $totalSellingPrice - $totalBuyingPrice;

        // Total Expenses for the day
        $totalExpenses = Expense::whereDate('expense_date', $date)
            ->sum('amount');

        // Net Income = Gross Profit - Expenses
        $netIncome = $grossProfit - $totalExpenses;

        // Breakdown by payment source
        $shopCashSales = SalesTransaction::whereDate('transaction_date', $date)
            ->where('status', 'completed')
            ->where('payment_source', 'shop_cash')
            ->sum('net_amount');

        $mobileBankingSales = SalesTransaction::whereDate('transaction_date', $date)
            ->where('status', 'completed')
            ->where('payment_source', 'online')
            ->sum('net_amount') + $onlineOrders;

        $bankSales = SalesTransaction::whereDate('transaction_date', $date)
            ->where('status', 'completed')
            ->where('payment_source', 'bank')
            ->sum('net_amount');

        // Previous day comparison
        $prevDate = $selectedDate->copy()->subDay()->toDateString();

        $prevTransactions = SalesTransaction::with('items')
            ->whereDate('transaction_date', $prevDate)
            ->where('status', 'completed')
            ->get();

        $prevSellingPrice = $prevTransactions->sum('net_amount');
        $prevBuyingPrice = $prevTransactions->flatMap->items->sum(fn($item) => $item->buying_price * $item->quantity);
        
        $prevOnlineOrders = \App\Models\PurchaseOrder::whereDate('created_at', $prevDate)
            ->where('payment_status', 'verified')
            ->sum('total_amount');
        
        $prevSellingPrice += $prevOnlineOrders;
        $prevGrossProfit = $prevSellingPrice - $prevBuyingPrice;

        $prevExpenses = Expense::whereDate('expense_date', $prevDate)
            ->sum('amount');
        
        $prevNetIncome = $prevGrossProfit - $prevExpenses;

        $changeAmount = $netIncome - $prevNetIncome;
        $changePercentage = $prevNetIncome > 0 
            ? round((($netIncome - $prevNetIncome) / $prevNetIncome) * 100, 1)
            : 0;

        // Transaction count
        $transactionCount = $transactions->count();

        return response()->json([
            'date' => $date,
            'date_formatted' => $selectedDate->format('d M Y'),
            'day_name' => $selectedDate->format('l'),
            'income' => [
                'total_selling_price' => $totalSellingPrice,
                'total_buying_price' => $totalBuyingPrice,
                'gross_profit' => $grossProfit,
                'total_expenses' => $totalExpenses,
                'net_income' => $netIncome,
                'transaction_count' => $transactionCount,
            ],
            'breakdown' => [
                'shop_cash' => $shopCashSales,
                'mobile_banking' => $mobileBankingSales,
                'bank' => $bankSales,
            ],
            'comparison' => [
                'previous_day' => [
                    'net_income' => $prevNetIncome,
                    'change_amount' => $changeAmount,
                    'change_percentage' => $changePercentage,
                ],
            ],
        ]);
    }
}
