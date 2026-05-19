import { useState, useEffect, useRef } from 'react'
import { Printer } from 'lucide-react'
import api from '../../../lib/axios'
import { formatCurrency, formatDate } from '../../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { PageLoader } from '../../../components/ui/Spinner'
import { useReactToPrint } from 'react-to-print'
import ReportPrint from '../../../components/ReportPrint'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MonthlyReport() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
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
    api.get('/reports/monthly', { params: { year, month } })
      .then(res => { if (!cancelled) setReport(res.data) })
      .catch(() => { if (!cancelled) setReport(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [year, month])

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Sales Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">{months[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={printLanguage} onChange={e => setPrintLanguage(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
            <option value="english">English</option>
            <option value="bangla">Bangla</option>
          </select>
          <Button icon={<Printer size={16} />} variant="secondary" onClick={handlePrint}>Print</Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <PageLoader /> : report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(report.summary.total_revenue), color: 'text-green-600' },
              { label: 'Transactions', value: report.summary.transaction_count, color: 'text-blue-600' },
              { label: 'Total Expenses', value: formatCurrency(report.summary.total_expenses), color: 'text-red-600' },
              { label: 'Net Profit', value: formatCurrency(report.summary.net_profit), color: 'text-purple-600' },
            ].map(item => (
              <Card key={item.label}>
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={report.by_date}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate()} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '৳' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip formatter={v => formatCurrency(v)} labelFormatter={d => formatDate(d)} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRev)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {report.top_products?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
              <div className="space-y-2">
                {report.top_products.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{p.product_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.total_revenue)}</p>
                      <p className="text-xs text-gray-500">{p.total_quantity} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <div className="hidden">
        <ReportPrint ref={printRef} report={report} type="monthly" language={printLanguage} />
      </div>
    </div>
  )
}
