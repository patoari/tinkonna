import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../lib/axios'
import { formatCurrency } from '../lib/utils'
import Card from './ui/Card'

export default function MonthlyRevenueCard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthlyRevenue()
  }, [selectedYear, selectedMonth])

  const fetchMonthlyRevenue = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/dashboard/monthly-revenue', {
        params: { year: selectedYear, month: selectedMonth }
      })
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch monthly revenue:', err)
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const goToNextMonth = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Don't allow future months
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return
    }

    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const goToCurrentMonth = () => {
    const now = new Date()
    setSelectedYear(now.getFullYear())
    setSelectedMonth(now.getMonth() + 1)
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1
  }

  const isFutureMonth = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    return selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-48 bg-gray-100 rounded" />
      </Card>
    )
  }

  if (!data) return null

  const { income, breakdown, comparison } = data
  const changeIsPositive = comparison.previous_month.change_amount >= 0

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Monthly Net Income</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToCurrentMonth}
            disabled={isCurrentMonth()}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isCurrentMonth()
                ? 'bg-blue-600 text-white cursor-default'
                : 'bg-white text-blue-600 hover:bg-blue-100'
            }`}
          >
            {data.month_name} {data.year}
          </button>
          <button
            onClick={goToNextMonth}
            disabled={isCurrentMonth()}
            className={`p-1.5 rounded-lg transition-colors ${
              isCurrentMonth()
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-blue-100 text-blue-600'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Income Display */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-1">Net Income</p>
        <p className="text-4xl font-bold text-gray-900">{formatCurrency(income.net_income)}</p>
        <p className="text-xs text-gray-500 mt-1">
          {income.transaction_count} transactions
        </p>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Sales</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(income.total_selling_price)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">COGS</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(income.total_buying_price)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Expenses</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(income.total_expenses)}</p>
        </div>
      </div>

      {/* Payment Source Breakdown */}
      <div className="bg-white rounded-xl p-3 border border-blue-100 mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Sales by Payment Source</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Shop Cash
            </span>
            <span className="font-semibold">{formatCurrency(breakdown.shop_cash)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Mobile Banking
            </span>
            <span className="font-semibold">{formatCurrency(breakdown.mobile_banking)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Bank
            </span>
            <span className="font-semibold">{formatCurrency(breakdown.bank)}</span>
          </div>
        </div>
      </div>

      {/* Comparison with Previous Month */}
      <div className={`flex items-center justify-center gap-2 text-sm ${
        changeIsPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {changeIsPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="font-medium">
          {changeIsPositive ? '+' : ''}{formatCurrency(comparison.previous_month.change_amount)}
        </span>
        <span>
          ({changeIsPositive ? '+' : ''}{comparison.previous_month.change_percentage}%)
        </span>
        <span className="text-gray-500">vs last month</span>
      </div>
    </Card>
  )
}
