import { useState, useEffect, useCallback } from 'react'
import { Eye, Printer } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency, formatDateTime } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import { TableSkeleton } from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import SalesReceipt from '../../components/SalesReceipt'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

export default function SalesTransactions() {
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [dateFilter, setDateFilter] = useState('')
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [printLanguage, setPrintLanguage] = useState('english')
  const receiptRef = useRef()
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    pageStyle: `
      @page {
        size: 58mm auto;
        margin: 0;
      }
      @media print {
        body { margin: 0; padding: 0; }
      }
    `
  })

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/sales', { params: { page, date: dateFilter || undefined } })
      setTransactions(res.data.data)
      setMeta(res.data.meta)
    } catch {}
    finally { setLoading(false) }
  }, [page, dateFilter])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage all sales</p>
        </div>
      </div>

      <Card>
        <div className="flex gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-sm text-red-600 hover:text-red-700">Clear</button>
          )}
        </div>
      </Card>

      <Card padding={false}>
        {loading ? <TableSkeleton /> : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Transaction #</TableHeader>
                  <TableHeader>Date & Time</TableHeader>
                  <TableHeader>Items</TableHeader>
                  <TableHeader>Payment</TableHeader>
                  <TableHeader>Total</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{txn.transaction_number}</code>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(txn.transaction_date)}</TableCell>
                    <TableCell>{txn.items?.length || 0} items</TableCell>
                    <TableCell className="capitalize">{txn.payment_method?.replace('_', ' ')}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(txn.net_amount)}</TableCell>
                    <TableCell>
                      <Badge status={txn.status} dot>{txn.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedTxn(txn)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                          <Eye size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        title={`Transaction: ${selectedTxn?.transaction_number}`}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <select
              value={printLanguage}
              onChange={e => setPrintLanguage(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="english">English</option>
              <option value="bangla">Bangla</option>
            </select>
            <Button icon={<Printer size={15} />} size="sm" onClick={handlePrint}>Print Receipt</Button>
          </div>
        }
      >
        {selectedTxn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDateTime(selectedTxn.transaction_date)}</span></div>
              <div><span className="text-gray-500">Payment:</span> <span className="font-medium capitalize">{selectedTxn.payment_method?.replace('_', ' ')}</span></div>
            </div>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedTxn.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{item.product_name} <span className="text-gray-500 text-xs">({item.size})</span></td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(selectedTxn.net_amount)}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden receipt */}
      <div className="hidden">
        <SalesReceipt ref={receiptRef} transaction={selectedTxn} language={printLanguage} />
      </div>
    </div>
  )
}
