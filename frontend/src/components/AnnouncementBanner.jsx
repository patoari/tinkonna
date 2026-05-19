import { X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'

const typeStyles = {
  joy_occasion: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-900',
  sorrow_occasion: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 text-gray-700',
  achievement: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-900',
  promotional: 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 text-pink-900',
  general_message: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900',
}

const typeIcons = {
  joy_occasion: '🎉',
  sorrow_occasion: '🕊️',
  achievement: '🏆',
  promotional: '🔥',
  general_message: '📢',
}

export default function AnnouncementBanner({ announcement }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const style = typeStyles[announcement.type] || typeStyles.general_message
  const icon = typeIcons[announcement.type] || '📢'

  return (
    <div className={cn('rounded-xl border overflow-hidden', style)}>
      {/* Text section */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <h4
              className="font-semibold text-sm"
              style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, 'URW Palladio L', serif" }}
            >
              {announcement.title}
            </h4>
          </div>
          <p
            className="text-sm opacity-80 leading-relaxed"
            style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, 'URW Palladio L', serif" }}
          >
            {announcement.content}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-black/10 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Banner image — full width below the text, SVG-friendly */}
      {announcement.banner_url && (
        <div className="w-full border-t border-current/10">
          {announcement.banner_url.toLowerCase().endsWith('.svg') ? (
            <img
              src={announcement.banner_url}
              alt={announcement.title}
              className="w-full h-auto"
            />
          ) : (
            <img
              src={announcement.banner_url}
              alt={announcement.title}
              className="w-full max-h-64 object-contain"
            />
          )}
        </div>
      )}
    </div>
  )
}
