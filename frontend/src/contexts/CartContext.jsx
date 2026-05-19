import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/axios'
import { useAuth, registerCartClearCallback } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await api.get('/cart')
      setCartItems(res.data)
    } catch {}
    finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && user?.user_type === 'customer') {
      fetchCart()
    } else {
      setCartItems([])
    }
  }, [isAuthenticated, user, fetchCart])

  // CRITICAL FIX: Register callback to clear cart on logout
  useEffect(() => {
    const unregister = registerCartClearCallback(() => {
      setCartItems([])
    })
    return unregister
  }, [])

  const addToCart = useCallback(async (productVariantId, quantity = 1) => {
    const res = await api.post('/cart', { product_variant_id: productVariantId, quantity })
    await fetchCart()
    return res.data
  }, [fetchCart])

  const updateCartItem = useCallback(async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity })
    await fetchCart()
  }, [fetchCart])

  const removeFromCart = useCallback(async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    setCartItems(prev => prev.filter(i => i.id !== itemId))
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => {
    const product = item.product_variant?.product
    // Use online_price for variable-price products, selling_price for fixed-price products
    const price = product?.has_fixed_price 
      ? (product?.selling_price || 0)
      : (product?.online_price || 0)
    return sum + (price * item.quantity)
  }, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
