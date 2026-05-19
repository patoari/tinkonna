import { useState, useEffect, useRef } from 'react'
import { Printer, Calendar } from 'lucide-react'
import api from '../../../lib/axios'
import { formatCurrency, formatDate } from '../../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { PageLoader } from '../../../components/ui/Spinner'
import { useReactToPrint } from 'react-to-print'
import ReportPrint from '../../../components/ReportPrint'

export default function DailyReport() {
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
    api.get('/reports/daily', { params: { date } })
      .then(res => { if (!cancelled) setReport(res.data) })
      .catch(() => { if (!cancelled) setReport(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [date])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Sales Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sales summary for a specific day</p>
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
          <Calendar size={18} className="text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 font-medium">{formatDate(date)}</span>
        </div>
      </Card>

      {loading ? <PageLoader /> : report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(report.summary.total_revenue), color: 'text-green-600' },
              { label: 'Transactions', value: report.summary.transaction_count, color: 'text-blue-600' },
              { label: 'Gross Profit', value: formatCurrency(report.summary.gross_profit), color: 'text-purple-600' },
              { label: 'Net Profit', value: formatCurrency(report.summary.net_profit), color: 'text-indigo-600' },
            ].map(item => (
              <Card key={item.label}>
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              </Card>
            ))}
          </div>

          {/* Cash Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-gray-500 font-medium">Shop Cash</p>
              <p className="text-xl font-bold mt-1 text-amber-600">{formatCurrency(report.summary.shop_cash)}</p>
              <p className="text-xs text-gray-400 mt-1">Physical cash</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 font-medium">Mobile Banking</p>
              <p className="text-xl font-bold mt-1 text-emerald-600">{formatCurrency(report.summary.online_cash)}</p>
              <p className="text-xs text-gray-400 mt-1">Digital payments</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 font-medium">Bank</p>
              <p className="text-xl font-bold mt-1 text-blue-600">{formatCurrency(report.summary.bank_cash)}</p>
              <p className="text-xs text-gray-400 mt-1">Bank transfers</p>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <p className="text-xs text-gray-600 font-medium">Net Cash (Total)</p>
              <p className="text-2xl font-bold mt-1 text-blue-700">{formatCurrency(report.summary.net_cash)}</p>
              <p className="text-xs text-gray-500 mt-1">Shop + Mobile Banking + Bank</p>
            </Card>
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader><CardTitle>Transactions ({report.summary.transaction_count})</CardTitle></CardHeader>
            {report.by_date?.[0]?.transactions?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions for this date</p>
            ) : (
              <div className="space-y-3">
                {report.by_date?.[0]?.transactions?.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{txn.transaction_number}</p>
                      <p className="text-xs text-gray-500">{txn.items?.length} items • {txn.payment_method?.replace('_', ' ')}</p>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(txn.net_amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Expense breakdown */}
          {report.expense_by_category?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
              <div className="space-y-2">
                {report.expense_by_category.map(cat => (
                  <div key={cat.category} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{cat.category}</span>
                    <span className="font-medium text-red-600">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 font-bold">
                  <span>Total Expenses</span>
                  <span className="text-red-600">{formatCurrency(report.summary.total_expenses)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Owner Transactions */}
          {report.owner_transactions?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Owner Cash Management ({report.owner_transactions.length})</CardTitle></CardHeader>
              <div className="space-y-2">
                {report.owner_transactions.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          txn.type === 'withdrawal' ? 'bg-red-100 text-red-700' :
                          txn.type === 'deposit' ? 'bg-green-100 text-green-700' :
                          txn.type === 'loan' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {txn.type === 'withdrawal' ? 'Withdrawal' :
                           txn.type === 'deposit' ? 'Deposit' :
                           txn.type === 'loan' ? 'Loan Given' : 'Loan Repayment'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          txn.payment_source === 'shop_cash' ? 'bg-amber-100 text-amber-700' : 
                          txn.payment_source === 'online' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {txn.payment_source === 'shop_cash' ? 'Shop Cash' : 
                           txn.payment_source === 'online' ? 'Mobile Banking' : 'Bank'}
                        </span>
                      </div>
                      {txn.recipient_name && <p className="text-sm text-gray-700 mt-1">{txn.recipient_name}</p>}
                      {txn.purpose && <p className="text-xs text-gray-500 mt-0.5">{txn.purpose}</p>}
                    </div>
                    <p className={`font-bold ${
                      txn.type === 'withdrawal' || txn.type === 'loan' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {txn.type === 'withdrawal' || txn.type === 'loan' ? '-' : '+'}
                      {formatCurrency(txn.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Hidden print */}
      <div className="hidden">
        <ReportPrint ref={printRef} report={report} type="daily" language={printLanguage} />
      </div>
    </div>
  )
}
