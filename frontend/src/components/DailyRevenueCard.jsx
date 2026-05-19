import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../lib/axios'
import { formatCurrency } from '../lib/utils'
import Card from './ui/Card'

export default function DailyRevenueCard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDailyRevenue()
  }, [selectedDate])

  const fetchDailyRevenue = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/dashboard/daily-revenue', {
        params: { date: selectedDate }
      })
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch daily revenue:', err)
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Don't allow future dates
    if (selectedDate === today) {
      return
    }

    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const isToday = () => {
    return selectedDate === new Date().toISOString().split('T')[0]
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
  const changeIsPositive = comparison.previous_day.change_amount >= 0

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Daily Net Income</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousDay}
            className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            disabled={isToday()}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isToday()
                ? 'bg-purple-600 text-white cursor-default'
                : 'bg-white text-purple-600 hover:bg-purple-100'
            }`}
          >
            <div className="text-center">
              <div className="text-xs">{data.day_name}</div>
              <div className="font-bold">{data.date_formatted}</div>
            </div>
          </button>
          <button
            onClick={goToNextDay}
            disabled={isToday()}
            className={`p-1.5 rounded-lg transition-colors ${
              isToday()
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-purple-100 text-purple-600'
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
        <div className="bg-white rounded-xl p-3 border border-purple-100">
          <p className="text-xs text-gray-500 mb-1">Sales</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(income.total_selling_price)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-purple-100">
          <p className="text-xs text-gray-500 mb-1">COGS</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(income.total_buying_price)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-purple-100">
          <p className="text-xs text-gray-500 mb-1">Expenses</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(income.total_expenses)}</p>
        </div>
      </div>

      {/* Payment Source Breakdown */}
      <div className="bg-white rounded-xl p-3 border border-purple-100 mb-4">
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

      {/* Comparison with Previous Day */}
      <div className={`flex items-center justify-center gap-2 text-sm ${
        changeIsPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {changeIsPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="font-medium">
          {changeIsPositive ? '+' : ''}{formatCurrency(comparison.previous_day.change_amount)}
        </span>
        <span>
          ({changeIsPositive ? '+' : ''}{comparison.previous_day.change_percentage}%)
        </span>
        <span className="text-gray-500">vs yesterday</span>
      </div>
    </Card>
  )
}
