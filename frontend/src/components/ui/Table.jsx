import { cn } from '../../lib/utils'

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  )
}

export function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-gray-100 bg-white">
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-blue-50',
        !onClick && 'hover:bg-gray-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableHeader({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

export function TableCell({ children, className }) {
  return (
    <td className={cn('px-4 py-3 text-gray-700', className)}>
      {children}
    </td>
  )
}
