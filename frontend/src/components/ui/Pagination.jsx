import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page, last_page, from, to, total } = meta

  const pages = []
  const delta = 2
  for (let i = Math.max(1, current_page - delta); i <= Math.min(last_page, current_page + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
        >
          <ChevronLeft size={16} />
        </button>

        {pages[0] > 1 && (
          <>
            <PageBtn page={1} current={current_page} onClick={onPageChange} />
            {pages[0] > 2 && <span className="px-1 text-gray-400">...</span>}
          </>
        )}

        {pages.map(p => (
          <PageBtn key={p} page={p} current={current_page} onClick={onPageChange} />
        ))}

        {pages[pages.length - 1] < last_page && (
          <>
            {pages[pages.length - 1] < last_page - 1 && <span className="px-1 text-gray-400">...</span>}
            <PageBtn page={last_page} current={current_page} onClick={onPageChange} />
          </>
        )}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function PageBtn({ page, current, onClick }) {
  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
        page === current
          ? 'bg-blue-600 text-white'
          : 'hover:bg-gray-100 text-gray-700'
      )}
    >
      {page}
    </button>
  )
}
