import { useState, useCallback, useEffect } from 'react'
import {
  ShoppingBag, Eye, CheckCircle, XCircle, ChevronDown,
  Package, Truck, MapPin, Phone, User, Clock, RefreshCw,
  ExternalLink, Filter, Search
} from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency, formatDate } from '../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

// ── Status config ────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
  { value: '', label: 'All Orders' },
  { value: 'payment_submitted', label: 'Payment Submitted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_STATUSES = [
  { value: '', label: 'All Payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

const NEXT_STATUSES = {
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
}

function statusBadge(status) {
  const map = {
    payment_submitted: 'bg-yellow-100 text-yellow-700',
    confirmed:         'bg-blue-100 text-blue-700',
    processing:        'bg-purple-100 text-purple-700',
    shipped:           'bg-indigo-100 text-indigo-700',
    delivered:         'bg-green-100 text-green-700',
    cancelled:         'bg-red-100 text-red-500',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function paymentBadge(status) {
  const map = {
    pending:  'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-500',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function label(str) {
  return str?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—'
}

// ── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose, onVerify, onReject, onStatusChange }) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [nextStatus, setNextStatus] = useState('')
  const [loading, setLoading] = useState(false)

  if (!order) return null

  const canVerify = order.payment_status === 'pending'
  const nextOptions = NEXT_STATUSES[order.status] || []

  const handleVerify = async () => {
    setLoading(true)
    await onVerify(order.id)
    setLoading(false)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Enter a rejection reason'); return }
    setLoading(true)
    await onReject(order.id, rejectReason)
    setLoading(false)
  }

  const handleStatusChange = async () => {
    if (!nextStatus) { toast.error('Select a status'); return }
    setLoading(true)
    await onStatusChange(order.id, nextStatus)
    setLoading(false)
    setNextStatus('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900">{order.order_number}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(order.status)}`}>
              {label(order.status)}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentBadge(order.payment_status)}`}>
              {label(order.payment_status)}
            </span>
            <button onClick={onClose} className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <XCircle size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Customer & Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</p>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <User size={14} className="text-gray-400" />
                {order.user?.name || '—'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {order.user?.phone || '—'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery</p>
              <div className="flex items-start gap-2 text-sm text-gray-800">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <span>
                  {order.delivery_name}<br />
                  {order.delivery_phone}<br />
                  {order.delivery_address}, {order.delivery_city}
                  {order.delivery_district ? `, ${order.delivery_district}` : ''}
                </span>
              </div>
              {order.delivery_notes && (
                <p className="text-xs text-gray-500 italic">Note: {order.delivery_notes}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  {item.product_image_url
                    ? <img src={item.product_image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-gray-300" />
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Size: {item.size} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 font-bold text-sm">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-800">{label(order.payment_method)}</span>
              <span className="text-gray-500">Txn Reference</span>
              <span className="font-medium text-gray-800">{order.transaction_reference || '—'}</span>
              <span className="text-gray-500">Sender Number</span>
              <span className="font-medium text-gray-800">{order.sender_number || '—'}</span>
            </div>
            {order.payment_screenshot_url && (
              <a
                href={order.payment_screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:underline font-medium"
              >
                <ExternalLink size={12} />
                View Payment Screenshot
              </a>
            )}
            {order.rejection_reason && (
              <p className="text-xs text-red-500 mt-1">Rejection reason: {order.rejection_reason}</p>
            )}
          </div>

          {/* Actions */}
          {canVerify && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  fullWidth
                  loading={loading && !showRejectForm}
                  onClick={handleVerify}
                  icon={<CheckCircle size={15} />}
                >
                  Verify Payment & Confirm Order
                </Button>
                <button
                  onClick={() => setShowRejectForm(v => !v)}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap"
                >
                  Reject
                </button>
              </div>
              {showRejectForm && (
                <div className="flex gap-2">
                  <input
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="flex-1 px-3 py-2 text-sm border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status progression */}
          {nextOptions.length > 0 && (
            <div className="flex gap-2 items-center">
              <select
                value={nextStatus}
                onChange={e => setNextStatus(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Move to next status...</option>
                {nextOptions.map(s => (
                  <option key={s} value={s}>{label(s)}</option>
                ))}
              </select>
              <Button onClick={handleStatusChange} loading={loading} icon={<Truck size={15} />}>
                Update
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function OnlineOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: 20, page }
      if (statusFilter) params.status = statusFilter
      if (paymentFilter) params.payment_status = paymentFilter
      const res = await api.get('/purchase-orders', { params })
      setOrders(res.data.data || res.data)
      setMeta(res.data.meta || null)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, paymentFilter, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleVerify = async (orderId) => {
    try {
      await api.post(`/purchase-orders/${orderId}/verify-payment`)
      toast.success('Payment verified — order confirmed!')
      setSelectedOrder(null)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify payment')
    }
  }

  const handleReject = async (orderId, reason) => {
    try {
      await api.post(`/purchase-orders/${orderId}/reject-payment`, { reason })
      toast.success('Payment rejected — stock restored')
      setSelectedOrder(null)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject payment')
    }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/purchase-orders/${orderId}/status`, { status })
      toast.success(`Order moved to ${label(status)}`)
      // Update in-place so modal reflects new status
      setSelectedOrder(prev => prev ? { ...prev, status } : null)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  // Client-side search by order number or customer name
  const filtered = orders.filter(o => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.delivery_phone?.includes(q)
    )
  })

  // Summary counts
  const pendingCount = orders.filter(o => o.payment_status === 'pending').length
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length
  const shippedCount = orders.filter(o => o.status === 'shipped').length

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Online Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage customer purchase orders from the online store</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting Payment Verification</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-blue-600">{confirmedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Confirmed / Processing</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-indigo-600">{shippedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Shipped</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search order #, customer name, phone..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Order status filter */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Filter size={14} />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Payment status filter */}
          <select
            value={paymentFilter}
            onChange={e => { setPaymentFilter(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {PAYMENT_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Orders table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <CardTitle>Orders ({filtered.length})</CardTitle>
          {pendingCount > 0 && (
            <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">
              {pendingCount} need payment review
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-center px-4 py-3">Payment</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Date</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-400">{label(order.payment_method)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{order.delivery_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentBadge(order.payment_status)}`}>
                        {label(order.payment_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(order.status)}`}>
                        {label(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onVerify={handleVerify}
          onReject={handleReject}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
