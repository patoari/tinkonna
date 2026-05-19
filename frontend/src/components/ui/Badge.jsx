import { cn, getStatusColor } from '../../lib/utils'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-cyan-100 text-cyan-700',
  purple: 'bg-purple-100 text-purple-700',
}

export default function Badge({ children, variant = 'default', status, className, dot = false }) {
  const colorClass = status ? getStatusColor(status) : variants[variant]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClass,
      className
    )}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-green-500': variant === 'success' || status === 'active' || status === 'completed' || status === 'verified',
          'bg-red-500': variant === 'danger' || status === 'cancelled' || status === 'rejected',
          'bg-amber-500': variant === 'warning' || status === 'pending' || status === 'pending_payment',
          'bg-gray-400': status === 'expired' || status === 'hidden',
          'bg-purple-500': status === 'upcoming',
          'bg-blue-500': variant === 'primary',
        })} />
      )}
      {children}
    </span>
  )
}
