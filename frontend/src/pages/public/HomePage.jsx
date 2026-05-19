import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Star, ShoppingBag, Tag, Truck, Shield } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency } from '../../lib/utils'
import ProductCard from '../../components/ProductCard'
import AnnouncementBanner from '../../components/AnnouncementBanner'
import HeroCarousel from '../../components/HeroCarousel'
import Spinner from '../../components/ui/Spinner'
import { HomePageSkeleton } from '../../components/ui/Skeleton'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import { useCategories } from '../../hooks/useCategories'

// Fixed 5 core categories always shown on homepage — replaced by API categories below

export default function HomePage() {
  const { settings } = useSiteSettings()
  const { categories: allCategories } = useCategories()
  const topCategories = allCategories.slice(0, 5)
  const [products, setProducts] = useState([])
  const [heroImages, setHeroImages] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  // Detect device type once on mount
  // mobile < 768px | tablet 768–1023px | desktop ≥ 1024px
  const getDevice = () => {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
  }
  const device = getDevice()

  useEffect(() => {
    Promise.all([
      api.get(`/public/products?per_page=${settings.products_per_page || 8}`),
      api.get('/public/announcements'),
      api.get(`/public/hero-images?device=${device}`),
    ]).then(([prodRes, annRes, heroRes]) => {
      setProducts(prodRes.data.data || [])
      setAnnouncements(annRes.data || [])
      setHeroImages(heroRes.data || [])
    }).finally(() => setLoading(false))
  }, [settings.products_per_page])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`)
  }

  if (loading) return <HomePageSkeleton />

  return (
    <div>
      {/* Hero */}
      <HeroCarousel
        images={heroImages}
        fallbackColor={settings.hero_bg_color || ''}
        interval={parseInt(settings.hero_carousel_interval) || 5000}
        transition={settings.hero_carousel_transition || 'slide'}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-20">
          <div className="max-w-2xl">

            {/* Title & Subtitle — controlled by hero_show_title */}
            {settings.hero_show_title !== '0' && (
              <>
                <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs sm:text-sm text-white mb-3 sm:mb-5">
                  <Star size={12} className="text-yellow-300" />
                  {settings.site_tagline || "Premium Men's Fashion in Bangladesh"}
                </div>
                <h1
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2 sm:mb-4 text-white"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {settings.hero_title || 'Dress to Impress'}
                </h1>
                <p
                  className="text-white text-sm sm:text-lg mb-4 sm:mb-6 leading-relaxed"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                >
                  {settings.hero_subtitle || "Discover our curated collection of premium men's clothing."}
                </p>
              </>
            )}

            {/* Search bar — controlled by hero_show_search */}
            {settings.hero_show_search !== '0' && (
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-3">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap shadow-lg"
                >
                  Search
                </button>
              </form>
            )}

            {/* Shop Now button — controlled by hero_show_buttons */}
            {settings.hero_show_buttons !== '0' && (
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg"
              >
                {settings.hero_button_text || 'Shop Now'}
                <ArrowRight size={15} />
              </Link>
            )}

          </div>
        </div>
      </HeroCarousel>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-3">
              {announcements.slice(0, 3).map(ann => (
                <AnnouncementBanner key={ann.id} announcement={ann} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, label: 'Wide Selection', desc: 'Hundreds of styles' },
              { icon: Tag, label: 'Best Prices', desc: 'Competitive pricing' },
              { icon: Truck, label: 'Fast Delivery', desc: 'Quick shipping' },
              { icon: Shield, label: 'Quality Assured', desc: 'Premium products' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {topCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-white transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
              >
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                  : <span className="text-4xl">{cat.icon || '🏷️'}</span>
                }
                <span className="text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{settings.featured_products_title || 'Featured Products'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Handpicked for you</p>
            </div>
            <Link to="/products" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No products available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
