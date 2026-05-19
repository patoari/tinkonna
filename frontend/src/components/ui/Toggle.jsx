import { cn } from '../../lib/utils'

export default function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      )}
    </div>
  )
}
