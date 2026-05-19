import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../../lib/axios'
import { debounce } from '../../lib/utils'
import ProductCard from '../../components/ProductCard'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { useCategories } from '../../hooks/useCategories'

export default function ProductsPage() {
  const { categories: rawCats } = useCategories()
  const categories = [{ name: 'All', slug: '' }, ...rawCats]

  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [page, setPage] = useState(1)

  // Sync category state when the URL query param changes
  // (e.g. clicking a navbar category link while already on /products)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || ''
    setCategory(urlCategory)
    setPage(1)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get('/public/products', {
      params: { search, category, page, per_page: 16 }
    }).then(res => {
      if (!cancelled) {
        setProducts(res.data.data || [])
        setMeta(res.data.meta)
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [search, category, page])

  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearch(val)
      setPage(1)
    }, 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setPage(1)
    setSearchParams(cat ? { category: cat } : {})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {category ? (rawCats.find(c => c.slug === category)?.name ?? category) : 'All Products'}
        </h1>
        {meta && <p className="text-sm text-gray-500 mt-1">{meta.total} products found</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
            <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <SlidersHorizontal size={15} />
              Filters
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                defaultValue={search}
                onChange={e => debouncedSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat.slug
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.icon ? cat.icon + ' ' : ''}{cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {(search || category) && (
              <button
                onClick={() => { setSearch(''); setCategory(''); setPage(1); setSearchParams({}) }}
                className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search size={28} />}
              title="No products found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {meta && (
                <div className="mt-6">
                  <Pagination meta={meta} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
