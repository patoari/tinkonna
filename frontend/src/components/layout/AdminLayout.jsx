import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { cn } from '../../lib/utils'

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
