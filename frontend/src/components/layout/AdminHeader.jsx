import { Menu, Bell, User, LogOut, ChevronDown, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

export default function AdminHeader({ onToggleSidebar, sidebarCollapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const fetchUnreadCount = () => {
      api.get('/notifications', { params: { page: 1, per_page: 1 } })
        .then(res => setUnreadCount(res.data.unread_count || 0))
        .catch(() => {})
    }

    const handleServiceWorkerMessage = (event) => {
      const data = event.data || {}
      if (data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        fetchUnreadCount()
      }
    }

    fetchUnreadCount()
    if ('serviceWorker' in navigator && navigator.serviceWorker.addEventListener) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    } else {
      window.addEventListener('message', handleServiceWorkerMessage)
    }

    return () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.removeEventListener) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      } else {
        window.removeEventListener('message', handleServiceWorkerMessage)
      }
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => navigate('/admin/notifications')}
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-4 bg-red-500 text-[10px] leading-4 text-white rounded-full flex items-center justify-center px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.roles?.[0]?.name || user?.user_type}</p>
            </div>
            <ChevronDown size={14} className="text-gray-500 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => { navigate('/admin/profile'); setDropdownOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={16} />
                My Profile
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
