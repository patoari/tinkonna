import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, ChevronDown, LayoutGrid, Bell } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import { useCategories } from '../../hooks/useCategories'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

export default function PublicNavbar() {
  const { user, logout, isAuthenticated, isCustomer } = useAuth()
  const { cartCount } = useCart()
  const { settings } = useSiteSettings()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const catMenuRef = useRef(null)

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
        setCatMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = () => {
      api.get('/notifications', { params: { page: 1, per_page: 1 } })
        .then(res => setUnreadCount(res.data.unread_count || 0))
        .catch(() => setUnreadCount(0))
    }

    const handleServiceWorkerMessage = (event) => {
      const data = event.data || {}
      if (data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        fetchUnreadCount()
      }
    }

    const handleLocalNotificationUpdate = () => {
      fetchUnreadCount()
    }

    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('notification-channel') : null
    const handleBroadcast = (event) => {
      if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED' || event.data?.type === 'NOTIFICATION_UPDATED') {
        fetchUnreadCount()
      }
    }

    fetchUnreadCount()
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
      navigator.serviceWorker.onmessage = handleServiceWorkerMessage
    }
    window.addEventListener('message', handleServiceWorkerMessage)
    window.addEventListener('notification-status-updated', handleLocalNotificationUpdate)

    if (channel) {
      channel.addEventListener('message', handleBroadcast)
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
        if (navigator.serviceWorker.onmessage === handleServiceWorkerMessage) {
          navigator.serviceWorker.onmessage = null
        }
      }
      window.removeEventListener('message', handleServiceWorkerMessage)
      window.removeEventListener('notification-status-updated', handleLocalNotificationUpdate)
      if (channel) {
        channel.removeEventListener('message', handleBroadcast)
        channel.close()
      }
    }
  }, [isAuthenticated, isCustomer])

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {settings.site_logo_url && (
              <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm bg-white border border-gray-200">
                <img src={settings.site_logo_url} alt="logo" className="w-11 h-11 object-contain" />
              </div>
            )}
            <div>
              {settings.site_name && <p className="font-bold text-gray-900 leading-tight text-sm">{settings.site_name}</p>}
              {settings.site_tagline && <p className="text-xs text-gray-500 leading-tight">{settings.site_tagline}</p>}
            </div>
          </Link>

          {/* Desktop nav — only 2 items */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/products"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              All Products
            </Link>

            {/* Categories dropdown */}
            <div className="relative" ref={catMenuRef}>
              <button
                onClick={() => setCatMenuOpen(v => !v)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <LayoutGrid size={15} />
                Categories
                <ChevronDown size={13} className={`transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {catMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
                  {categories.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-gray-400">No categories yet</p>
                  ) : (
                    categories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        onClick={() => setCatMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        {cat.image_url
                          ? <img src={cat.image_url} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                          : <span className="text-base leading-none">{cat.icon || '📦'}</span>
                        }
                        {cat.name}
                      </Link>
                    ))
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      to="/products"
                      onClick={() => setCatMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      View all products →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dashboard button — staff/admin only */}
            {isAuthenticated && !isCustomer && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            )}

            {/* Cart */}
            {isAuthenticated && isCustomer && (
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications icon for customers */}
            {isAuthenticated && isCustomer && (
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-5 bg-red-500 text-white text-[10px] leading-5 rounded-full flex items-center justify-center px-1 font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                    {isCustomer ? (
                      <>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <User size={15} /> My Profile
                        </Link>
                        <Link to="/notifications" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Bell size={15} /> Notifications
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Package size={15} /> My Orders
                        </Link>
                      </>
                    ) : (
                      <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Package size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-0.5">
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              All Products
            </Link>

            {/* All categories in mobile */}
            <div className="px-3 pt-2 pb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Categories</p>
            </div>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <span className="text-base">{cat.icon || ''}</span>
                {cat.name}
              </Link>
            ))}

            {isAuthenticated && !isCustomer && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 mt-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
