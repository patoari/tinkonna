import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'
import toast from 'react-hot-toast'

/**
 * Mounts once inside the Router. Listens for barcode scans globally.
 *
 * Behaviour:
 * - If staff/admin is logged in AND a barcode is scanned from anywhere
 *   in the app (no input focused), navigate to /admin/sales/new and
 *   pass the scanned value so it auto-searches immediately.
 * - If already on /admin/sales/new, do nothing — the page handles it.
 * - If not logged in or user is a customer, ignore.
 */
export default function GlobalBarcodeListener() {
  const { user, isStaff, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const onScan = useCallback((barcode) => {
    // Not ready yet
    if (loading) return

    // Only for staff / admin
    if (!user || !isStaff) return

    // Already on New Sale page — let the page's own input handle it
    if (location.pathname === '/admin/sales/new') return

    // Navigate to New Sale, passing the barcode as state
    navigate('/admin/sales/new', {
      state: { autoScan: barcode },
      replace: false,
    })

    toast.success(`Barcode scanned — opening New Sale`, {
      duration: 1500,
      icon: '🔍',
    })
  }, [user, isStaff, loading, location.pathname, navigate])

  // Only active when staff is logged in and not already on the sale page
  const enabled = !loading && !!user && isStaff && location.pathname !== '/admin/sales/new'

  useBarcodeScanner(onScan, enabled)

  return null // renders nothing
}
