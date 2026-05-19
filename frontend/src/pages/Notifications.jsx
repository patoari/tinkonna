import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, MessageCircle, Send, CheckCircle, Clock } from 'lucide-react'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'
import { formatDateTime } from '../lib/utils'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function NotificationsPage() {
  const { user, isAdmin, isCustomer } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState('admin')
  const [recipientId, setRecipientId] = useState('')
  const [customers, setCustomers] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const isAdminView = isAdmin || !isCustomer

  useEffect(() => {
    if (isAdminView) {
      api.get('/customers', { params: { per_page: 100 } })
        .then(res => setCustomers(res.data.data || []))
        .catch(() => setCustomers([]))
    }
  }, [isAdminView])

  const fetchNotifications = useCallback((showLoader = true) => {
    if (showLoader) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    api.get('/notifications', { params: { page, per_page: 12 } })
      .then(res => {
        setNotifications(res.data.data || [])
        setMeta(res.data.meta)
        setUnreadCount(res.data.unread_count || 0)
      })
      .catch(err => {
        console.error('Failed to fetch notifications:', err.response?.data || err.message)
      })
      .finally(() => {
        if (showLoader) {
          setLoading(false)
        } else {
          setRefreshing(false)
        }
      })
  }, [page])

  useEffect(() => {
    fetchNotifications(true)

    const handleServiceWorkerMessage = (event) => {
      const data = event.data || {}
      if (data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        fetchNotifications(false)
      }
    }

    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('notification-channel') : null
    const handleBroadcast = (event) => {
      if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
        fetchNotifications(false)
      }
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.addEventListener) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    }
    window.addEventListener('message', handleServiceWorkerMessage)
    if (channel) channel.addEventListener('message', handleBroadcast)

    return () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.removeEventListener) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      }
      window.removeEventListener('message', handleServiceWorkerMessage)
      if (channel) channel.removeEventListener('message', handleBroadcast)
      if (channel) channel.close()
    }
  }, [fetchNotifications])

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return
    if (isAdminView && targetRole === 'customer' && !recipientId) {
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        subject,
        message,
      }

      if (isAdminView) {
        if (targetRole === 'admin') {
          payload.target_role = 'admin'
        } else {
          payload.target_role = 'customer'
          payload.recipient_id = recipientId
        }
      } else {
        payload.target_role = 'admin'
      }

      await api.post('/notifications', payload)
      setSubject('')
      setMessage('')
      setRecipientId('')
      fetchNotifications(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      setNotifications((prev) => prev.map((notification) => (
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      )))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      window.dispatchEvent(new Event('notification-status-updated'))
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('notification-channel')
        channel.postMessage({ type: 'NOTIFICATION_UPDATED' })
        channel.close()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read')
      fetchNotifications(false)
      window.dispatchEvent(new Event('notification-status-updated'))
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('notification-channel')
        channel.postMessage({ type: 'NOTIFICATION_UPDATED' })
        channel.close()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const title = isAdminView ? 'Admin Notifications' : 'My Notifications'
  const subtitle = isAdminView
    ? 'Send and receive messages with customers and other staff.'
    : 'Send messages to the shop and receive order status updates.'

  const recipientOptions = useMemo(() => {
    if (!isAdminView) return []
    return customers.map(customer => ({
      id: customer.id,
      label: `${customer.name} (${customer.email || customer.phone || 'No contact'})`,
    }))
  }, [customers, isAdminView])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-600">
            <Bell size={20} />
            <h1 className="text-2xl font-bold">{title}</h1>
            {refreshing && !loading && (
              <span className="text-xs text-gray-500 ml-2">Updating...</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={unreadCount > 0 ? 'secondary' : 'default'}>
            {unreadCount} unread
          </Badge>
          <Button variant="secondary" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={18} />
              <h2 className="text-lg font-semibold">Send a notification</h2>
            </div>
            <div className="space-y-4">
              {isAdminView && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Recipient type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-xl text-sm border ${targetRole === 'admin' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                      onClick={() => setTargetRole('admin')}
                    >
                      All admins
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-xl text-sm border ${targetRole === 'customer' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                      onClick={() => setTargetRole('customer')}
                    >
                      Customer
                    </button>
                  </div>
                </div>
              )}

              {isAdminView && targetRole === 'customer' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select customer</option>
                    {recipientOptions.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short title"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your notification SMS here"
                  className="w-full rounded-3xl border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button onClick={handleSend} loading={submitting} icon={<Send size={16} />}>
                Send Notification
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} />
              <h2 className="text-lg font-semibold">Notification tips</h2>
            </div>
            <p className="text-sm text-gray-500">
              Use this section to write custom messages between customers and staff. All sent messages appear in the recipient's notification section.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Recent notifications</h2>
                <p className="text-sm text-gray-500">{meta?.total ?? 0} total notifications</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-24 rounded-3xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                You have no notifications yet.
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`rounded-3xl border p-4 ${notification.is_read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'}`}
                    onMouseEnter={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{notification.subject}</p>
                          {!notification.is_read && <Badge status="active">New</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          From {notification.sender?.name || 'System'} • {formatDateTime(notification.created_at)}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => markAsRead(notification.id)}>
                        Mark read
                      </Button>
                    </div>
                    <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}

            {meta?.last_page > 1 && (
              <div className="flex items-center justify-between gap-3 mt-4 text-sm text-gray-600">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {page} of {meta?.last_page}</span>
                <button
                  onClick={() => setPage(Math.min(meta?.last_page || 1, page + 1))}
                  disabled={page >= (meta?.last_page || 1)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
