import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, AlertCircle, ImageOff, ShoppingBag } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'

const STATUS_META = {
  pending_payment:   { label: 'Pending Payment',   color: 'warning', icon: Clock },
  payment_submitted: { label: 'Payment Submitted', color: 'primary', icon: AlertCircle },
  confirmed:         { label: 'Confirmed',          color: 'success', icon: CheckCircle },
  processing:        { label: 'Processing',         color: 'primary', icon: Package },
  shipped:           { label: 'Shipped',            color: 'primary', icon: Package },
  delivered:         { label: 'Delivered',          color: 'success', icon: CheckCircle },
  cancelled:         { label: 'Cancelled',          color: 'danger',  icon: XCircle },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    api.get('/customer/purchase-orders', { params: { page, per_page: 10 } })
      .then(res => {
        setOrders(res.data.data || res.data || [])
        setMeta(res.data.meta || null)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  if (loading) return <PageLoader />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta ? `${meta.total} order${meta.total !== 1 ? 's' : ''}` : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/products">
          <Button variant="secondary" size="sm">Continue Shopping</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title="No orders yet"
          description="Your orders will appear here after you make a purchase"
          action={<Link to="/products"><Button>Browse Products</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const meta = STATUS_META[order.status] || { label: order.status, color: 'default', icon: Package }
            const StatusIcon = meta.icon
            return (
              <Card key={order.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 font-mono text-sm">#{order.order_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <StatusIcon size={12} />
                    {meta.label}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {item.product_image_url ? (
                          <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageOff size={18} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Size: {item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">
                      {order.delivery_city && `Delivering to ${order.delivery_city}`}
                    </p>
                    {order.payment_method && (
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        Paid via {order.payment_method}
                        {order.payment_status === 'verified' && <span className="text-green-600 ml-1">✓ Verified</span>}
                        {order.payment_status === 'pending' && <span className="text-amber-600 ml-1">· Pending verification</span>}
                        {order.payment_status === 'rejected' && <span className="text-red-600 ml-1">· Payment rejected</span>}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600 bg-white rounded-xl border border-gray-200 px-4 py-3">
          <span>Page {meta.current_page} of {meta.last_page}</span>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
