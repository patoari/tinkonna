import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext'
import GlobalBarcodeListener from './components/GlobalBarcodeListener'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import HomePage from './pages/public/HomePage'
import ProductsPage from './pages/public/ProductsPage'
import ProductDetailPage from './pages/public/ProductDetailPage'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import NewSale from './pages/admin/NewSale'
import SalesTransactions from './pages/admin/SalesTransactions'
import DailyReport from './pages/admin/reports/DailyReport'
import WeeklyReport from './pages/admin/reports/WeeklyReport'
import MonthlyReport from './pages/admin/reports/MonthlyReport'
import CashFlowReport from './pages/admin/reports/CashFlowReport'
import YearlyReport from './pages/admin/reports/YearlyReport'
import Expenses from './pages/admin/Expenses'
import Bookings from './pages/admin/Bookings'
import PaymentVerification from './pages/admin/PaymentVerification'
import Customers from './pages/admin/Customers'
import Users from './pages/admin/Users'
import Roles from './pages/admin/Roles'
import Announcements from './pages/admin/Announcements'
import Themes from './pages/admin/Themes'
import Settings from './pages/admin/Settings'
import Categories from './pages/admin/Categories'
import OnlineOrders from './pages/admin/OnlineOrders'
import OwnerTransactions from './pages/admin/OwnerTransactions'
import NotificationsPage from './pages/Notifications'

// Customer pages
import CustomerProfile from './pages/customer/Profile'
import CartPage from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import Orders from './pages/customer/Orders'

import { PageLoader } from './components/ui/Spinner'
import { DashboardSkeleton, HomePageSkeleton } from './components/ui/Skeleton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
})

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <DashboardSkeleton />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.user_type === 'customer') return <Navigate to="/" replace />

  return children
}

function CustomerRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <HomePageSkeleton />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.user_type !== 'customer') return <Navigate to="/admin/dashboard" replace />

  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <HomePageSkeleton />
  if (user) {
    return <Navigate to={user.user_type === 'customer' ? '/' : '/admin/dashboard'} replace />
  }

  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <SiteSettingsProvider>
              <GlobalBarcodeListener />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                }}
              />
              <Routes>
                {/* Public routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                </Route>

                {/* Auth routes */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                {/* Customer routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/profile" element={<CustomerRoute><CustomerProfile /></CustomerRoute>} />
                  <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
                  <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
                  <Route path="/orders" element={<CustomerRoute><Orders /></CustomerRoute>} />
                  <Route path="/notifications" element={<CustomerRoute><NotificationsPage /></CustomerRoute>} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id" element={<ProductForm />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />
                  <Route path="sales" element={<SalesTransactions />} />
                  <Route path="sales/new" element={<NewSale />} />
                  <Route path="reports/daily" element={<DailyReport />} />
                  <Route path="reports/weekly" element={<WeeklyReport />} />
                  <Route path="reports/monthly" element={<MonthlyReport />} />
                  <Route path="reports/yearly" element={<YearlyReport />} />
                  <Route path="reports/cashflow" element={<CashFlowReport />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="payments" element={<PaymentVerification />} />
                  <Route path="online-orders" element={<OnlineOrders />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="users" element={<Users />} />
                  <Route path="roles" element={<Roles />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="themes" element={<Themes />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="owner-transactions" element={<OwnerTransactions />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SiteSettingsProvider>
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
