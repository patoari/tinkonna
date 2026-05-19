import { useState, useEffect, useRef } from 'react'
import { Printer } from 'lucide-react'
import api from '../../../lib/axios'
import { formatCurrency, formatDate } from '../../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { PageLoader } from '../../../components/ui/Spinner'
import { useReactToPrint } from 'react-to-print'
import ReportPrint from '../../../components/ReportPrint'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeeklyReport() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
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
    api.get('/reports/weekly', { params: { date } })
      .then(res => { if (!cancelled) setReport(res.data) })
      .catch(() => { if (!cancelled) setReport(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [date])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Sales Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sales summary for a 7-day period</p>
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
          <label className="text-sm text-gray-600">Week containing:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {report && <span className="text-sm text-gray-500">{formatDate(report.start_date)} – {formatDate(report.end_date)}</span>}
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
            <CardHeader><CardTitle>Daily Breakdown</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={report.by_date}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickFormatter={d => formatDate(d)} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '৳' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip formatter={v => formatCurrency(v)} labelFormatter={d => formatDate(d)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader><CardTitle>Daily Summary</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Date</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">Transactions</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">Revenue</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">Expenses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.by_date?.map(day => (
                    <tr key={day.date}>
                      <td className="py-2 px-3">{formatDate(day.date)}</td>
                      <td className="py-2 px-3 text-right">{day.transaction_count}</td>
                      <td className="py-2 px-3 text-right font-medium text-green-600">{formatCurrency(day.revenue)}</td>
                      <td className="py-2 px-3 text-right font-medium text-red-600">{formatCurrency(day.expenses)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <div className="hidden">
        <ReportPrint ref={printRef} report={report} type="weekly" language={printLanguage} />
      </div>
    </div>
  )
}
