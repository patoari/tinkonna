import { cn } from '../../lib/utils'

export default function Card({ children, className, padding = true, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        padding && 'p-6',
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, action }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-base font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-gray-500 mt-0.5', className)}>
      {children}
    </p>
  )
}
