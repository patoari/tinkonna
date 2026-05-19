import { useState, useRef } from 'react'
import { Printer, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../../../lib/axios'
import { formatCurrency } from '../../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { PageLoader } from '../../../components/ui/Spinner'
import { useReactToPrint } from 'react-to-print'
import ReportPrint from '../../../components/ReportPrint'

export default function CashFlowReport() {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [printLanguage, setPrintLanguage] = useState('english')
  const printRef = useRef()
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print { body { margin: 0; } }
    `,
  })

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports/cashflow', { params: { start_date: startDate, end_date: endDate } })
      setReport(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue, expenses, and profit analysis</p>
        </div>
        {report && (
          <div className="flex items-center gap-3">
            <select value={printLanguage} onChange={e => setPrintLanguage(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
              <option value="english">English</option>
              <option value="bangla">Bangla</option>
            </select>
            <Button icon={<Printer size={16} />} variant="secondary" onClick={handlePrint}>Print</Button>
          </div>
        )}
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Button onClick={fetchReport} loading={loading}>Generate Report</Button>
        </div>
      </Card>

      {loading ? <PageLoader /> : report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(report.summary.total_revenue), color: 'bg-green-50 text-green-700', icon: TrendingUp },
              { label: 'Cost of Goods', value: formatCurrency(report.summary.total_cogs), color: 'bg-orange-50 text-orange-700', icon: TrendingDown },
              { label: 'Gross Profit', value: formatCurrency(report.summary.gross_profit), color: 'bg-blue-50 text-blue-700', icon: TrendingUp },
              { label: 'Total Expenses', value: formatCurrency(report.summary.total_expenses), color: 'bg-red-50 text-red-700', icon: TrendingDown },
              { label: 'Net Profit', value: formatCurrency(report.summary.net_profit), color: 'bg-purple-50 text-purple-700', icon: TrendingUp },
              { label: 'Cash on Hand', value: formatCurrency(report.summary.cash_on_hand), color: 'bg-indigo-50 text-indigo-700', icon: TrendingUp },
            ].map(item => (
              <Card key={item.label} className={item.color}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-70">{item.label}</p>
                    <p className="text-xl font-bold mt-1">{item.value}</p>
                  </div>
                  <item.icon size={24} className="opacity-40" />
                </div>
              </Card>
            ))}
          </div>

          {/* Owner Transactions Summary */}
          {(report.summary.owner_withdrawals > 0 || report.summary.owner_deposits > 0 || report.summary.loans_given > 0 || report.summary.loans_received > 0) && (
            <Card>
              <CardHeader><CardTitle>Owner Cash Transactions</CardTitle></CardHeader>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">Withdrawals</p>
                  <p className="text-lg font-bold text-red-700 mt-1">{formatCurrency(report.summary.owner_withdrawals)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Deposits</p>
                  <p className="text-lg font-bold text-green-700 mt-1">{formatCurrency(report.summary.owner_deposits)}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">Loans Given</p>
                  <p className="text-lg font-bold text-orange-700 mt-1">{formatCurrency(report.summary.loans_given)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Loans Received</p>
                  <p className="text-lg font-bold text-blue-700 mt-1">{formatCurrency(report.summary.loans_received)}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Net Owner Impact</p>
                <p className={`text-xl font-bold mt-1 ${report.summary.net_owner_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.summary.net_owner_impact >= 0 ? '+' : ''}{formatCurrency(report.summary.net_owner_impact)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {report.summary.net_owner_impact >= 0 ? 'Money added to business' : 'Money taken from business'}
                </p>
              </div>
            </Card>
          )}

          {report.expense_by_category?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
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
                    <span className="text-sm font-medium text-red-600 w-24 text-right">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <div className="hidden">
        <ReportPrint ref={printRef} report={report} type="cashflow" language={printLanguage} />
      </div>
    </div>
  )
}
