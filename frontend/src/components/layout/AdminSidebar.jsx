import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, DollarSign,
  BookOpen, CreditCard, Users, Shield, Settings, ChevronDown,
  Store, Tag, Boxes, FileText, TrendingUp, Bell, Palette,
  Home, LogOut, LayoutGrid, Globe, Wallet
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    permission: 'view_dashboard',
  },
  {
    label: 'Products',
    icon: Package,
    permission: 'view_products',
    children: [
      { label: 'Catalog',     path: '/admin/products',     icon: Boxes,     permission: 'view_products' },
      { label: 'Add Product', path: '/admin/products/new', icon: Tag,       permission: 'create_products' },
      { label: 'Categories',  path: '/admin/categories',   icon: LayoutGrid, permission: 'view_products' },
    ],
  },
  {
    label: 'Sales',
    icon: ShoppingCart,
    permission: 'view_sales',
    children: [
      { label: 'New Sale',      path: '/admin/sales/new', icon: ShoppingCart, permission: 'create_sales' },
      { label: 'Transactions',  path: '/admin/sales',     icon: FileText,     permission: 'view_sales' },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    permission: 'view_reports',
    children: [
      { label: 'Daily Report',   path: '/admin/reports/daily',    icon: BarChart3,  permission: 'view_reports' },
      { label: 'Weekly Report',  path: '/admin/reports/weekly',   icon: TrendingUp, permission: 'view_reports' },
      { label: 'Monthly Report', path: '/admin/reports/monthly',  icon: TrendingUp, permission: 'view_reports' },
      { label: 'Yearly Report',  path: '/admin/reports/yearly',   icon: TrendingUp, permission: 'view_reports' },
      { label: 'Cash Flow',      path: '/admin/reports/cashflow', icon: DollarSign, permission: 'view_reports' },
    ],
  },
  { label: 'Expenses',      icon: DollarSign, path: '/admin/expenses',      permission: 'view_expenses' },
  { label: 'Owner Cash',    icon: Wallet,     path: '/admin/owner-transactions', permission: 'view_expenses' },
  { label: 'Online Orders', icon: Globe,      path: '/admin/online-orders', permission: 'view_sales' },
  { label: 'Bookings',      icon: BookOpen,   path: '/admin/bookings',      permission: 'manage_bookings' },
  { label: 'Payments',      icon: CreditCard, path: '/admin/payments',      permission: 'verify_payments' },
  { label: 'Customers',     icon: Users,      path: '/admin/customers',     permission: 'view_customers' },
  { label: 'Notifications', icon: Bell,       path: '/admin/notifications', permission: null },
  { label: 'Users',         icon: Users,      path: '/admin/users',         permission: 'view_users' },
  { label: 'Roles',         icon: Shield,     path: '/admin/roles',         permission: 'view_roles' },
  { label: 'Announcements', icon: Bell,       path: '/admin/announcements', permission: 'view_announcements' },
  { label: 'Themes',        icon: Palette,    path: '/admin/themes',        permission: 'manage_themes' },
  { label: 'Settings',      icon: Settings,   path: '/admin/settings',      permission: 'manage_settings' },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  const { isAdmin, hasPermission, logout } = useAuth()
  const { settings } = useSiteSettings()
  const location = useLocation()
  const navigate = useNavigate()
  const [openGroups, setOpenGroups] = useState({})

  const canSee = (permission) => isAdmin || !permission || hasPermission(permission)

  const toggleGroup = (label) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isGroupActive = (children) => {
    return children?.some(c => location.pathname.startsWith(c.path))
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const filteredItems = navItems
    .filter(item => canSee(item.permission))
    .map(item => item.children
      ? { ...item, children: item.children.filter(c => canSee(c.permission)) }
      : item
    )
    .filter(item => !item.children || item.children.length > 0)

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-gray-900 text-white flex flex-col transition-all duration-300 z-40',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${settings?.site_logo_url ? 'bg-white border border-gray-700' : 'bg-blue-600'}`}>
          {settings?.site_logo_url
            ? <img src={settings.site_logo_url} alt="logo" className="w-9 h-9 object-contain" />
            : <Store size={22} className="text-white" />
          }
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight">{settings?.site_name || 'GENTS SHOP'}</p>
            <p className="text-xs text-gray-400">{settings?.site_tagline || 'Management System'}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {filteredItems.map((item) => {
          if (item.children) {
            const isOpen = openGroups[item.label] ?? isGroupActive(item.children)
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
                    isGroupActive(item.children)
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-4 pl-3 border-l border-gray-700 mb-1">
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                          isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <child.icon size={15} />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-3 border-t border-gray-800 space-y-0.5">
        <Link
          to="/"
          title={collapsed ? 'Homepage' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Home size={18} className="shrink-0" />
          {!collapsed && 'Homepage'}
        </Link>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}
