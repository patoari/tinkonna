import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input({
  label,
  error,
  hint,
  className,
  containerClassName,
  prefix,
  suffix,
  required,
  ...props
}, ref) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500 text-sm select-none">{prefix}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'transition-colors duration-150',
            error && 'border-red-400 focus:ring-red-500',
            prefix && 'pl-8',
            suffix && 'pr-8',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500 text-sm select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
})

export default Input
