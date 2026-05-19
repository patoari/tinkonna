/**
 * Format currency in Bangladeshi Taka
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '৳0.00'
  return '৳' + Number(amount).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-GB')
}

/**
 * Format datetime
 */
export function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Format time as HH:MM
 */
export function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Get category label
 */
export function getCategoryLabel(category) {
  const labels = {
    'shirts': 'Shirts',
    'pants': 'Pants',
    't-shirts': 'T-Shirts',
    'panjabi': 'Panjabi',
    'accessories': 'Accessories',
  }
  return labels[category] || category
}

/**
 * Get expense category label
 */
export function getExpenseCategoryLabel(category, other = null) {
  const labels = {
    'staff_salary': 'Staff Salary',
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'utility_bills': 'Utility Bills',
    'shipping_cost': 'Shipping Cost',
    'other': other || 'Other',
  }
  return labels[category] || category
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
  const colors = {
    'active': 'bg-green-100 text-green-700',
    'completed': 'bg-blue-100 text-blue-700',
    'cancelled': 'bg-red-100 text-red-700',
    'expired': 'bg-gray-100 text-gray-600',
    'pending': 'bg-yellow-100 text-yellow-700',
    'pending_payment': 'bg-orange-100 text-orange-700',
    'verified': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700',
    'upcoming': 'bg-purple-100 text-purple-700',
    'hidden': 'bg-gray-100 text-gray-500',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

/**
 * Truncate text
 */
export function truncate(text, length = 50) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Calculate time remaining
 */
export function timeRemaining(expiryDate) {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diff = expiry - now

  if (diff <= 0) return 'Expired'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h remaining`
  }
  return `${hours}h ${minutes}m remaining`
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Class names utility
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
