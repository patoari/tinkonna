import { useState, useEffect, useCallback } from 'react'
import { X, Eye } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency, formatDateTime, timeRemaining } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import { TableSkeleton } from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { confirmDialog, successAlert } from '../../lib/sweetalert'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/bookings', { params: { page, status: statusFilter || undefined } })
      setBookings(res.data.data)
      setMeta(res.data.meta)
    } catch {}
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const handleCancel = async (id) => {
    const result = await confirmDialog({
      title: 'Cancel this booking?',
      text: 'The booking will be cancelled and the customer notified.',
      icon: 'warning',
      confirmButtonText: 'Yes, cancel it',
      confirmButtonColor: '#ef4444'
    })
    if (!result.isConfirmed) return

    try {
      await api.post(`/bookings/${id}/cancel`)
      successAlert({ title: 'Cancelled!', text: 'Booking has been cancelled.' })
      fetchBookings()
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage product bookings</p>
      </div>

      <Card>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Status</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? <TableSkeleton /> : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Booking #</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Fee</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Expiry</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map(booking => (
                  <TableRow key={booking.id}>
                    <TableCell><code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{booking.booking_number}</code></TableCell>
                    <TableCell className="text-sm">{booking.user?.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{booking.product_variant?.product?.name}</p>
                        <p className="text-xs text-gray-500">Size: {booking.product_variant?.size}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.booking_type === 'paid' ? 'success' : 'primary'}>
                        {booking.booking_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.booking_fee ? formatCurrency(booking.booking_fee) : '-'}</TableCell>
                    <TableCell><Badge status={booking.status} dot>{booking.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {booking.expiry_date ? timeRemaining(booking.expiry_date) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedBooking(booking)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                          <Eye size={15} />
                        </button>
                        {['active', 'pending_payment'].includes(booking.status) && (
                          <button onClick={() => handleCancel(booking.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                            <X size={15} />
                          </button>
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

      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details" size="sm"
        footer={<Button variant="secondary" onClick={() => setSelectedBooking(null)}>Close</Button>}>
        {selectedBooking && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-500">Booking #:</span><br /><span className="font-mono font-medium">{selectedBooking.booking_number}</span></div>
              <div><span className="text-gray-500">Type:</span><br /><Badge variant={selectedBooking.booking_type === 'paid' ? 'success' : 'primary'}>{selectedBooking.booking_type}</Badge></div>
              <div><span className="text-gray-500">Customer:</span><br /><span className="font-medium">{selectedBooking.user?.name}</span></div>
              <div><span className="text-gray-500">Status:</span><br /><Badge status={selectedBooking.status} dot>{selectedBooking.status.replace('_', ' ')}</Badge></div>
              <div><span className="text-gray-500">Product:</span><br /><span className="font-medium">{selectedBooking.product_variant?.product?.name}</span></div>
              <div><span className="text-gray-500">Size:</span><br /><span className="font-medium">{selectedBooking.product_variant?.size}</span></div>
              <div><span className="text-gray-500">Price:</span><br /><span className="font-medium">{formatCurrency(selectedBooking.product_price)}</span></div>
              <div><span className="text-gray-500">Fee:</span><br /><span className="font-medium">{selectedBooking.booking_fee ? formatCurrency(selectedBooking.booking_fee) : 'Free'}</span></div>
            </div>
            {selectedBooking.expiry_date && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-blue-700 font-medium">{timeRemaining(selectedBooking.expiry_date)}</p>
                <p className="text-xs text-blue-500">Expires: {formatDateTime(selectedBooking.expiry_date)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
