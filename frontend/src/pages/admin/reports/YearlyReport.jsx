import { useState, useEffect, useRef } from 'react'
import { Printer, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../../../lib/axios'
import { formatCurrency } from '../../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { PageLoader } from '../../../components/ui/Spinner'
import { useReactToPrint } from 'react-to-print'
import ReportPrint from '../../../components/ReportPrint'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function YearlyReport() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [printLanguage, setPrintLanguage] = useState('english')
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print { body { margin: 0; } }
    `,
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get('/reports/yearly', { params: { year } })
      .then(res => { if (!cancelled) setReport(res.data) })
      .catch(() => { if (!cancelled) setReport(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [year])

  // Year options: 2023 → current year + 1
  const yearOptions = []
  for (let y = 2023; y <= currentYear + 1; y++) yearOptions.push(y)

  const chartData = report?.by_month?.map(m => ({
    name: MONTHS[m.month - 1],
    Revenue: Number(m.revenue),
    Expenses: Number(m.expenses),
    'Net Profit': Number(m.net_profit),
  })) || []

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yearly Sales Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full year overview — {year}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={printLanguage}
            onChange={e => setPrintLanguage(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="english">English</option>
            <option value="bangla">Bangla</option>
          </select>
          <Button icon={<Printer size={16} />} variant="secondary" onClick={handlePrint}>
            Print
          </Button>
        </div>
      </div>

      {/* Year picker */}
      <Card>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Select Year:</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <PageLoader /> : report && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue',   value: formatCurrency(report.summary.total_revenue),   color: 'text-green-600',  bg: 'bg-green-50',  icon: TrendingUp },
              { label: 'Cost of Goods',   value: formatCurrency(report.summary.total_cogs),       color: 'text-orange-600', bg: 'bg-orange-50', icon: TrendingDown },
              { label: 'Gross Profit',    value: formatCurrency(report.summary.gross_profit),     color: 'text-blue-600',   bg: 'bg-blue-50',   icon: TrendingUp },
              { label: 'Total Expenses',  value: formatCurrency(report.summary.total_expenses),   color: 'text-red-600',    bg: 'bg-red-50',    icon: TrendingDown },
              { label: 'Net Profit',      value: formatCurrency(report.summary.net_profit),       color: 'text-purple-600', bg: 'bg-purple-50', icon: TrendingUp },
              { label: 'Transactions',    value: report.summary.transaction_count,                color: 'text-indigo-600', bg: 'bg-indigo-50', icon: TrendingUp },
            ].map(item => (
              <Card key={item.label} className={item.bg}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${item.color} opacity-70`}>{item.label}</p>
                    <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                  </div>
                  <item.icon size={24} className={`${item.color} opacity-30`} />
                </div>
              </Card>
            ))}
          </div>

          {/* Revenue vs Expenses bar chart */}
          <Card>
            <CardHeader><CardTitle>Monthly Revenue vs Expenses — {year}</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '৳' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Revenue"  fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Net profit trend line */}
          <Card>
            <CardHeader><CardTitle>Monthly Net Profit Trend — {year}</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '৳' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="Net Profit"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly breakdown table */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-gray-100">
              <CardTitle>Month-by-Month Breakdown</CardTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Month</th>
                    <th className="text-right px-4 py-3">Transactions</th>
                    <th className="text-right px-4 py-3">Revenue</th>
                    <th className="text-right px-4 py-3">COGS</th>
                    <th className="text-right px-4 py-3">Expenses</th>
                    <th className="text-right px-4 py-3">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.by_month?.map(row => (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{MONTHS[row.month - 1]}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.transaction_count}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(row.revenue)}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(row.cogs)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.expenses)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${row.net_profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {formatCurrency(row.net_profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold text-sm">
                    <td className="px-5 py-3">Total {year}</td>
                    <td className="px-4 py-3 text-right">{report.summary.transaction_count}</td>
                    <td className="px-4 py-3 text-right text-green-700">{formatCurrency(report.summary.total_revenue)}</td>
                    <td className="px-4 py-3 text-right text-orange-700">{formatCurrency(report.summary.total_cogs)}</td>
                    <td className="px-4 py-3 text-right text-red-700">{formatCurrency(report.summary.total_expenses)}</td>
                    <td className={`px-4 py-3 text-right ${report.summary.net_profit >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                      {formatCurrency(report.summary.net_profit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Top products */}
          {report.top_products?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Top 10 Products — {year}</CardTitle></CardHeader>
              <div className="space-y-2">
                {report.top_products.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-900">{p.product_name}</span>
                    <span className="text-xs text-gray-500">{p.total_quantity} units</span>
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(p.total_revenue)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Expense breakdown */}
          {report.expense_by_category?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
              <div className="space-y-2">
                {report.expense_by_category.map(cat => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 flex-1">{cat.category}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-400 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (cat.total / report.summary.total_expenses) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-red-600 w-28 text-right">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Hidden print target */}
      <div className="hidden">
        <ReportPrint ref={printRef} report={report} type="yearly" language={printLanguage} />
      </div>
    </div>
  )
}
