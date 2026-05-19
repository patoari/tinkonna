import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, BookOpen, ImageOff, Check } from 'lucide-react'
import { formatCurrency, getCategoryLabel } from '../lib/utils'
import Badge from './ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer } = useAuth()
  const { addToCart } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const inStock = product.variants?.some(v => v.quantity > 0)
  const inStockVariants = product.variants?.filter(v => v.quantity > 0) || []

  // Auto-select first in-stock variant
  const effectiveVariantId = selectedVariantId || inStockVariants[0]?.id

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated || !isCustomer) { navigate('/login'); return }
    if (!effectiveVariantId) { toast.error('Select a size first'); return }
    setAdding(true)
    try {
      await addToCart(effectiveVariantId, 1)
      setAdded(true)
      toast.success('Added to cart!')
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover group flex flex-col">
      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="block relative aspect-square overflow-hidden bg-gray-50 border-b-4 border-blue-400 group-hover:border-purple-500 transition-colors duration-300"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff size={40} />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {product.images?.length > 1 && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-[11px] font-semibold text-gray-700 shadow-sm">
            {product.images.length} photos
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="primary" className="text-xs">{getCategoryLabel(product.category)}</Badge>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Size selector */}
        <div className="flex flex-wrap gap-1 mt-2">
          {product.variants?.slice(0, 5).map(v => (
            <button
              key={v.id}
              disabled={v.quantity === 0}
              onClick={(e) => { e.preventDefault(); v.quantity > 0 && setSelectedVariantId(v.id) }}
              className={`text-xs px-1.5 py-0.5 rounded border font-medium transition-colors ${
                effectiveVariantId === v.id && v.quantity > 0
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : v.quantity > 0
                    ? 'border-gray-300 text-gray-600 bg-gray-50 hover:border-blue-400'
                    : 'border-gray-200 text-gray-300 bg-gray-50 line-through cursor-not-allowed'
              }`}
            >
              {v.size}
            </button>
          ))}
          {product.variants?.length > 5 && (
            <span className="text-xs text-gray-400 self-center">+{product.variants.length - 5}</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-2">
          {product.has_fixed_price ? (
            <p className="font-bold text-gray-900 text-sm">{formatCurrency(product.selling_price)}</p>
          ) : product.online_price ? (
            <p className="font-bold text-gray-900 text-sm">{formatCurrency(product.online_price)}</p>
          ) : (
            <p className="text-xs text-gray-500 italic">Contact for price</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`flex-1 flex items-center justify-center gap-1 text-xs sm:text-xs font-medium px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg transition-all ${
              added
                ? 'bg-green-500 text-white'
                : inStock
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {adding ? (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : added ? (
              <Check size={12} />
            ) : (
              <ShoppingCart size={12} />
            )}
            <span className="hidden xs:inline">{added ? 'Added!' : 'Add to Cart'}</span>
            <span className="xs:hidden">{added ? '✓' : 'Cart'}</span>
          </button>

          {/* Book */}
          <Link
            to={`/products/${product.id}`}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg transition-colors shrink-0"
          >
            <BookOpen size={12} />
            <span className="hidden xs:inline">Book</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
