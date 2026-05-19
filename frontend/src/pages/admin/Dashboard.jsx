import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, ShoppingCart, Package, DollarSign, AlertTriangle,
  ArrowUpRight, ArrowDownRight, CheckCircle, BookOpen, CreditCard, Building2
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import api from '../../lib/axios'
import { formatCurrency, formatDate } from '../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../contexts/AuthContext'
import MonthlyRevenueCard from '../../components/MonthlyRevenueCard'
import DailyRevenueCard from '../../components/DailyRevenueCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const stats = data?.stats || {}
  const recentTransactions = data?.recent_transactions || []
  const lowStockItems = data?.low_stock_items || []
  const weeklyChart = data?.weekly_chart || []
  const pendingBookings = data?.pending_bookings || 0
  const pendingPayments = data?.pending_payments || 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/admin/sales/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <ShoppingCart size={16} />
          New Sale
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.today_revenue)}
          change={stats.revenue_change}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Today's Sales"
          value={stats.today_transactions || 0}
          suffix="transactions"
          change={stats.transaction_change}
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Total Products"
          value={stats.total_products || 0}
          suffix="items"
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Shop Cash"
          value={formatCurrency(stats.shop_cash)}
          subtitle="Physical cash"
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="Mobile Banking"
          value={formatCurrency(stats.online_cash)}
          subtitle="Digital payments"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Bank"
          value={formatCurrency(stats.bank_cash)}
          subtitle="Bank transfers"
          icon={Building2}
          color="blue"
        />
      </div>

      {/* Net Cash Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Net Cash (Total)</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.net_cash)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Shop: {formatCurrency(stats.shop_cash)} + Mobile Banking: {formatCurrency(stats.online_cash)} + Bank: {formatCurrency(stats.bank_cash)}
            </p>
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <TrendingUp size={28} className="text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Monthly Revenue Card */}
      <MonthlyRevenueCard />

      {/* Daily Revenue Card */}
      <DailyRevenueCard />

      {/* Alert cards */}
      {(pendingBookings > 0 || pendingPayments > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingPayments > 0 && (
            <Link to="/admin/payments" className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <CreditCard size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-orange-900 text-sm">{pendingPayments} Pending Payments</p>
                <p className="text-xs text-orange-600">Awaiting verification</p>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-orange-500" />
            </Link>
          )}
          {pendingBookings > 0 && (
            <Link to="/admin/bookings" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 text-sm">{pendingBookings} Active Bookings</p>
                <p className="text-xs text-blue-600">Needs attention</p>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-blue-500" />
            </Link>
          )}
          {lowStockItems.length > 0 && (
            <Link to="/admin/products" className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-900 text-sm">{lowStockItems.length} Low Stock Items</p>
                <p className="text-xs text-red-600">Restock needed</p>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-red-500" />
            </Link>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyChart}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en-GB', { weekday: 'short' })} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '৳' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip formatter={v => formatCurrency(v)} labelFormatter={d => formatDate(d)} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.category_sales || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => '৳' + (v / 1000).toFixed(0) + 'k'} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transactions & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/admin/sales" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-8">No transactions today</p>
            ) : recentTransactions.map(txn => (
              <div key={txn.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle size={15} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{txn.transaction_number}</p>
                  <p className="text-xs text-gray-500">{txn.items?.length} items • {new Date(txn.transaction_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(txn.net_amount)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <CardTitle>Low Stock Alerts</CardTitle>
            <Link to="/admin/products" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Manage</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockItems.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-8">All items well stocked</p>
            ) : lowStockItems.slice(0, 6).map(item => (
              <div key={item.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                  <p className="text-xs text-gray-500">Size: {item.size}</p>
                </div>
                <Badge variant={item.quantity === 0 ? 'danger' : 'warning'}>
                  {item.quantity === 0 ? 'Out of stock' : `${item.quantity} left`}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, suffix, subtitle, change, icon: Icon, color }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-600' },
  }
  const c = colors[color] || colors.blue

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {suffix && <p className="text-xs text-gray-500 mt-0.5">{suffix}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {Math.abs(change)}% vs yesterday
            </div>
          )}
        </div>
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </Card>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
