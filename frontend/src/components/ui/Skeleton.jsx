import { cn } from '../../lib/utils'

// ── Base pulse block ──────────────────────────────────────────────────────────
export function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />
  )
}

// ── Stat card (Dashboard top row) ─────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  )
}

// ── Card with lines ───────────────────────────────────────────────────────────
export function CardSkeleton({ lines = 3, className }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-5 space-y-3', className)}>
      <Skeleton className="h-4 w-40" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`} />
      ))}
    </div>
  )
}

// ── Product card (public grid) ────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-9 w-full rounded-xl mt-1" />
      </div>
    </div>
  )
}

// ── Dashboard skeleton ────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
      </div>

      {/* Alert banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Products table skeleton ───────────────────────────────────────────────────
export function ProductsTableSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex gap-6">
            {[120,60,80,70,80,100,60,80].map((w,i) => (
              <Skeleton key={i} className={`h-3 w-${w === 60 ? '16' : w === 70 ? '20' : w === 80 ? '24' : w === 100 ? '28' : '32'}`} />
            ))}
          </div>
        </div>
        <table className="w-full">
          <tbody>
            {[1,2,3,4,5,6,7,8].map(i => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Skeleton className="h-3.5 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="px-4 py-3"><Skeleton className="h-3.5 w-16" /></td>
                <td className="px-4 py-3"><Skeleton className="h-3.5 w-16" /></td>
                <td className="px-4 py-3"><div className="flex gap-1">{[1,2,3].map(j=><Skeleton key={j} className="h-5 w-10 rounded" />)}</div></td>
                <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">{[1,2,3,4].map(j=><Skeleton key={j} className="h-7 w-7 rounded-lg" />)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── New Sale skeleton ─────────────────────────────────────────────────────────
export function NewSaleSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="p-5 flex flex-col items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          </div>
          <Skeleton className="h-12 rounded-xl" />
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-20" /></div>
            <div className="flex justify-between"><Skeleton className="h-5 w-12" /><Skeleton className="h-5 w-24" /></div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Homepage hero + categories skeleton ──────────────────────────────────────
export function HomePageSkeleton() {
  return (
    <div>
      {/* Hero */}
      <Skeleton className="w-full h-72 rounded-none" />
      {/* Features bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Categories */}
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-5 gap-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
      {/* Products */}
      <div className="max-w-7xl mx-auto px-8 pb-12 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}

// ── Generic table skeleton (drop-in for any table page) ──────────────────────
export function TableSkeleton({ rows = 8, cols = 6 }) {
  return (
    <div className="overflow-hidden">
      {/* Fake header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16' : 'w-20'}`} />
        ))}
      </div>
      {/* Fake rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-4 py-3.5 border-b border-gray-50 flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-36' : c === cols - 1 ? 'w-16' : 'w-24'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Settings page skeleton ────────────────────────────────────────────────────
export function SettingsSkeleton() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="flex gap-6">
        <div className="w-52 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
          <Skeleton className="h-5 w-40" />
          {[1,2,3,4].map(i => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
