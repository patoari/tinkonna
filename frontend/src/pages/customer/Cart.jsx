import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ImageOff } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'

export default function CartPage() {
  const navigate = useNavigate()
  const { cartItems, cartTotal, updateCartItem, removeFromCart, loading } = useCart()

  const handleUpdateQty = async (itemId, qty) => {
    try {
      await updateCartItem(itemId, qty)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity')
    }
  }

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId)
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={32} />}
          title="Your cart is empty"
          description="Browse our products and add items to your cart"
          action={<Link to="/products"><Button>Browse Products</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map(item => {
              const product = item.product_variant?.product
              const variant = item.product_variant
              // Use online_price for variable-price products, selling_price for fixed-price products
              const price = product?.has_fixed_price 
                ? (product?.selling_price || 0)
                : (product?.online_price || 0)

              return (
                <Card key={item.id}>
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {product?.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageOff size={24} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${product?.id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm">
                        {product?.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">Size: {variant?.size}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(price)}</p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(price * item.quantity)}</p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {cartItems.map(item => {
                  const product = item.product_variant?.product
                  // Use online_price for variable-price products, selling_price for fixed-price products
                  const price = product?.has_fixed_price 
                    ? (product?.selling_price || 0)
                    : (product?.online_price || 0)
                  return (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate flex-1 mr-2">{item.product_variant?.product?.name} × {item.quantity}</span>
                      <span className="shrink-0">{formatCurrency(price * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              <Button fullWidth size="lg" iconRight={<ArrowRight size={16} />} onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <Link to="/products" className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-3">
                Continue Shopping
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
