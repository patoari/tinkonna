import { useState, useEffect, useCallback } from 'react'
import { Check, X, Eye, CreditCard } from 'lucide-react'
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
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function PaymentVerification() {
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/booking-payments', { params: { page, status: statusFilter || undefined } })
      setPayments(res.data.data)
      setMeta(res.data.meta)
    } catch {}
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const handleApprove = async (paymentId) => {
    setProcessing(true)
    try {
      await api.post(`/booking-payments/${paymentId}/approve`)
      toast.success('Payment approved! Booking activated.')
      setSelectedPayment(null)
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve')
    } finally {
      setProcessing(false) }
  }

  const handleReject = async (paymentId) => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return }
    setProcessing(true)
    try {
      await api.post(`/booking-payments/${paymentId}/reject`, { reason: rejectReason })
      toast.success('Payment rejected')
      setSelectedPayment(null)
      setRejectReason('')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
        <p className="text-sm text-gray-500 mt-0.5">Verify booking payments from customers</p>
      </div>

      <Card>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? <TableSkeleton /> : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Method</TableHeader>
                  <TableHeader>Sender No.</TableHeader>
                  <TableHeader>Reference</TableHeader>
                  <TableHeader>Submitted</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">{payment.booking?.user?.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{payment.booking?.product_variant?.product?.name}</p>
                        <p className="text-xs text-gray-500">Size: {payment.booking?.product_variant?.size}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="capitalize text-sm">{payment.payment_method}</TableCell>
                    <TableCell className="text-sm font-mono">{payment.sender_number || '—'}</TableCell>
                    <TableCell><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{payment.transaction_reference}</code></TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDateTime(payment.created_at)}</TableCell>
                    <TableCell><Badge status={payment.status} dot>{payment.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedPayment(payment)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                          <Eye size={15} />
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(payment.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600">
                              <Check size={15} />
                            </button>
                            <button onClick={() => setSelectedPayment({ ...payment, showReject: true })} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                              <X size={15} />
                            </button>
                          </>
                        )}
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

      <Modal
        isOpen={!!selectedPayment}
        onClose={() => { setSelectedPayment(null); setRejectReason('') }}
        title="Payment Details"
        size="sm"
        footer={selectedPayment?.status === 'pending' ? (
          <>
            <Button variant="secondary" onClick={() => { setSelectedPayment(null); setRejectReason('') }}>Close</Button>
            <Button variant="danger" loading={processing} onClick={() => handleReject(selectedPayment.id)}>Reject</Button>
            <Button loading={processing} onClick={() => handleApprove(selectedPayment.id)}>Approve</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setSelectedPayment(null)}>Close</Button>
        )}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Customer:</span><br /><span className="font-medium">{selectedPayment.booking?.user?.name}</span></div>
              <div><span className="text-gray-500">Amount:</span><br /><span className="font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</span></div>
              <div><span className="text-gray-500">Method:</span><br /><span className="font-medium capitalize">{selectedPayment.payment_method}</span></div>
              <div><span className="text-gray-500">Sender Number:</span><br /><span className="font-medium font-mono">{selectedPayment.sender_number || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Transaction Reference:</span><br /><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{selectedPayment.transaction_reference}</code></div>
            </div>
            {selectedPayment.screenshot_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Screenshot:</p>
                <img src={selectedPayment.screenshot_url} alt="Payment screenshot" className="w-full rounded-xl border border-gray-200" />
              </div>
            )}
            {selectedPayment.status === 'pending' && (
              <Input
                label="Rejection Reason (required to reject)"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            )}
            {selectedPayment.rejection_reason && (
              <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700">
                <p className="font-medium">Rejection Reason:</p>
                <p>{selectedPayment.rejection_reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
