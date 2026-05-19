import { useState, useRef, useCallback, useEffect } from 'react'
import { Plus, Minus, Trash2, ShoppingCart, Printer, CheckCircle, Barcode, Layers, MessageCircle, Phone } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import SalesReceipt from '../../components/SalesReceipt'
import toast from 'react-hot-toast'
import { useReactToPrint } from 'react-to-print'
import { useLocation } from 'react-router-dom'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'

export default function NewSale() {
  const location = useLocation()
  const { settings } = useSiteSettings()
  const [cartItems, setCartItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [paymentSource, setPaymentSource] = useState('shop_cash')
  const [mobileBankingAccounts, setMobileBankingAccounts] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [selectedMbAccount, setSelectedMbAccount] = useState(null)
  const [selectedBankAccount, setSelectedBankAccount] = useState(null)
  const [discount, setDiscount] = useState('')
  const [discountType, setDiscountType] = useState('flat') // 'flat' | 'percent'
  const [processing, setSaving] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState(null)
  const [availableSizes, setAvailableSizes] = useState([])
  const [printLanguage, setPrintLanguage] = useState('english')
  // Scanned product panel: shows all sizes of the last barcode-scanned product
  const [scannedProduct, setScannedProduct] = useState(null) // { product, variants }
  const [customerPhone, setCustomerPhone] = useState('')
  const receiptRef = useRef()

  // Build a plain-text receipt message for sharing
  const buildReceiptText = (txn) => {
    if (!txn) return ''
    const shopName = (settings.site_name || 'Our Shop').toUpperCase()
    const tagline  = settings.site_tagline || ''
    const phone    = settings.contact_phone || ''
    const address  = settings.contact_address || ''

    const lines = [
      `🛍️ ${shopName}`,
      tagline ? tagline : null,
      '─────────────────',
      `📋 Receipt: ${txn.transaction_number}`,
      `📅 Date: ${new Date(txn.transaction_date).toLocaleString('en-BD')}`,
      `💳 Payment: ${txn.payment_method?.replace('_', ' ')}`,
      '─────────────────',
      ...(txn.items?.map(i =>
        `• ${i.product_name} (${i.size}) × ${i.quantity}  ৳${Number(i.subtotal).toFixed(2)}`
      ) || []),
      '─────────────────',
      txn.discount_amount > 0 ? `Discount: -৳${Number(txn.discount_amount).toFixed(2)}` : null,
      `💰 TOTAL: ৳${Number(txn.net_amount).toFixed(2)}`,
      '',
      `🙏 Thank you for shopping at ${shopName}!`,
      `We appreciate your trust in us. Visit us again for the best deals in men\'s fashion.`,
      phone   ? `📞 ${phone}`   : null,
      address ? `📍 ${address}` : null,
    ].filter(Boolean)
    return lines.join('\n')
  }

  const handleWhatsApp = () => {
    const phone = customerPhone.replace(/\D/g, '')
    if (!phone) { toast.error('Enter customer phone number first'); return }
    const text = encodeURIComponent(buildReceiptText(completedTransaction))
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  const handleImo = () => {
    const phone = customerPhone.replace(/\D/g, '')
    if (!phone) { toast.error('Enter customer phone number first'); return }
    const text = encodeURIComponent(buildReceiptText(completedTransaction))
    // IMO deep link — falls back gracefully if IMO is not installed
    window.open(`imo://chat?to=${phone}&text=${text}`, '_blank')
    // Show a fallback toast since IMO web share isn't universally supported
    setTimeout(() => toast('If IMO didn\'t open, make sure it\'s installed on this device.', { icon: 'ℹ️' }), 1200)
  }

  // Fetch mobile banking accounts once on mount
  useEffect(() => {
    Promise.all([
      api.get('/public/mobile-banking-accounts'),
      api.get('/public/bank-accounts')
    ])
      .then(([mbRes, bankRes]) => {
        setMobileBankingAccounts(mbRes.data || [])
        setBankAccounts(bankRes.data || [])
      })
      .catch(() => {})
  }, [])

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    pageStyle: `
      @page {
        size: 58mm auto;
        margin: 0;
      }
      @media print {
        body { margin: 0; padding: 0; }
      }
    `
  })

  // Auto-print receipt as soon as the sale completes
  useEffect(() => {
    if (completedTransaction) {
      // Small delay to let React render the hidden SalesReceipt component first
      const timer = setTimeout(() => handlePrint(), 300)
      return () => clearTimeout(timer)
    }
  }, [completedTransaction]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-trigger search when navigated here from a global barcode scan
  useEffect(() => {
    const scanned = location.state?.autoScan
    if (scanned) {
      setSearchQuery(scanned)
      searchProducts(scanned)
      // Clear the state so a page refresh doesn't re-trigger
      window.history.replaceState({}, '')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await api.get('/products/availability', { params: { identifier: query } })
      const data = res.data

      // If a specific variant was directly matched by barcode scan, auto-add it to cart
      if (data.direct_variant_id) {
        const matchedVariant = data.variants.find(v => v.id === data.direct_variant_id)
        if (matchedVariant) {
          addToCartSilent(matchedVariant, data.product)
        }
        // Show all sizes of this product in the scanned panel below cart
        setScannedProduct({ product: data.product, variants: data.variants })
        setSearchResults([])
        setSearching(false)
        return
      }

      setSearchResults([data])
      setSearching(false)
    } catch {
      // Try product search
      try {
        const res = await api.get('/products', { params: { search: query, per_page: 5 } })
        setSearchResults(res.data.data?.map(p => ({
          product: p,
          variants: p.variants,
          total_quantity: p.variants?.reduce((s, v) => s + v.quantity, 0),
        })) || [])
      } catch (innerErr) {
        console.error('Product search failed:', innerErr)
      }
      setSearching(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = (variant, product, price = null) => {
    const unitPrice = price || (product.has_fixed_price ? product.selling_price : null)

    if (!unitPrice && product.has_fixed_price) {
      toast.error('No selling price set for this product')
      return
    }

    const existing = cartItems.find(i => i.variantId === variant.id)
    if (existing) {
      if (existing.quantity >= variant.quantity) {
        toast.error(`Only ${variant.quantity} in stock`)
        return
      }
      setCartItems(prev => prev.map(i =>
        i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      if (variant.quantity === 0) {
        toast.error('Out of stock')
        return
      }
      setCartItems(prev => [...prev, {
        variantId: variant.id,
        productId: product.id || product.base_product_id,
        productName: product.name,
        size: variant.size,
        quantity: 1,
        unitPrice: unitPrice || 0,
        maxQty: variant.quantity,
        hasFixedPrice: product.has_fixed_price,
        imageUrl: product.image_url,
      }])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  // Used for barcode scan: adds directly without clearing search or showing dropdown
  const addToCartSilent = (variant, product, price = null) => {
    const unitPrice = price || (product.has_fixed_price ? product.selling_price : null)

    if (!unitPrice && product.has_fixed_price) {
      toast.error('No selling price set for this product')
      return
    }

    if (variant.quantity === 0) {
      toast.error(`${product.name} (Size: ${variant.size}) is out of stock`)
      return
    }

    setCartItems(prev => {
      const existing = prev.find(i => i.variantId === variant.id)
      if (existing) {
        if (existing.quantity >= variant.quantity) {
          toast.error(`Only ${variant.quantity} in stock for size ${variant.size}`)
          return prev
        }
        toast.success(`${product.name} × ${variant.size} qty updated`)
        return prev.map(i =>
          i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      toast.success(`${product.name} (Size: ${variant.size}) added to cart`)
      return [...prev, {
        variantId: variant.id,
        productId: product.id || product.base_product_id,
        productName: product.name,
        size: variant.size,
        quantity: 1,
        unitPrice: unitPrice || 0,
        maxQty: variant.quantity,
        hasFixedPrice: product.has_fixed_price,
        imageUrl: product.image_url,
      }]
    })
    setSearchQuery('')
  }

  const updateQuantity = (variantId, qty) => {
    if (qty < 1) return removeItem(variantId)
    const item = cartItems.find(i => i.variantId === variantId)
    if (qty > item.maxQty) { toast.error(`Only ${item.maxQty} in stock`); return }
    
    setCartItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i))
    
    // When increasing quantity, show the scanned product panel with all sizes
    if (qty > item.quantity) {
      // Fetch product details to show all available sizes
      api.get(`/products/${item.productId}`).then(res => {
        setScannedProduct({ product: res.data, variants: res.data.variants })
      }).catch(() => {})
    }
  }

  const updatePrice = (variantId, price) => {
    setCartItems(prev => prev.map(i => i.variantId === variantId ? { ...i, unitPrice: parseFloat(price) || 0 } : i))
  }

  const removeItem = (variantId) => {
    setCartItems(prev => prev.filter(i => i.variantId !== variantId))
  }

  const scannedVariantCartQuantities = scannedProduct ? cartItems.reduce((acc, item) => {
    const variantExists = scannedProduct.variants.some(v => v.id === item.variantId)
    if (!variantExists) return acc
    acc[item.variantId] = (acc[item.variantId] || 0) + item.quantity
    return acc
  }, {}) : {}

  const subtotal = cartItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const discountValue = parseFloat(discount) || 0
  const discountAmount = discountType === 'percent'
    ? Math.min(subtotal, (subtotal * discountValue) / 100)
    : Math.min(subtotal, discountValue)
  const total = subtotal - discountAmount

  const handleCheckout = async () => {
    if (cartItems.length === 0) { toast.error('Cart is empty'); return }

    const variablePriceItems = cartItems.filter(i => !i.hasFixedPrice && !i.unitPrice)
    if (variablePriceItems.length > 0) {
      toast.error('Please enter selling price for all variable-price items')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/sales', {
        items: cartItems.map(i => ({
          product_variant_id: i.variantId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
        payment_source: paymentSource,
        payment_reference: paymentSource === 'online' && selectedMbAccount
          ? `${selectedMbAccount.provider} - ${selectedMbAccount.account_number}`
          : paymentSource === 'bank' && selectedBankAccount
          ? `${selectedBankAccount.bank_name} - ${selectedBankAccount.account_number}`
          : undefined,
        discount_amount: discountAmount,
      })

      setCompletedTransaction(res.data.transaction)
      setAvailableSizes(res.data.available_sizes || [])
      setCartItems([])
      setDiscount('')
      setDiscountType('flat')
      setSelectedMbAccount(null)
      setSelectedBankAccount(null)
      toast.success('Sale completed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed')
    } finally {
      setSaving(false)
    }
  }

  if (completedTransaction) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Success */}
        <Card>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Sale Completed!</h2>
            <p className="text-gray-500 text-sm mt-1">Transaction #{completedTransaction.transaction_number}</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(completedTransaction.net_amount)}</p>
          </div>

          {/* Available sizes */}
          {availableSizes.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-semibold text-blue-900 mb-3">Available Sizes After Sale:</p>
              {availableSizes.map(item => (
                <div key={item.base_product_id} className="mb-3">
                  <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.variants.map(v => (
                      <span
                        key={v.product_variant_id}
                        className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          v.is_in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500 line-through'
                        }`}
                      >
                        {v.size}: {v.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Share via WhatsApp / IMO */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Phone size={14} className="text-gray-400" />
              Customer Phone (for sharing receipt)
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="e.g. 8801XXXXXXXXX"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ background: '#25D366' }}
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>

              {/* IMO */}
              <button
                onClick={handleImo}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ background: '#0084FF' }}
              >
                {/* IMO icon — speech bubble */}
                <MessageCircle size={18} />
                IMO
              </button>
            </div>
          </div>

          {/* Print options */}
          <div className="mt-3 flex items-center gap-3">
            <select
              value={printLanguage}
              onChange={e => setPrintLanguage(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="english">Print in English</option>
              <option value="bangla">Print in Bangla</option>
            </select>
            <Button icon={<Printer size={16} />} onClick={handlePrint}>
              Print Receipt
            </Button>
          </div>

          <div className="mt-3">
            <Button variant="secondary" fullWidth onClick={() => { setCompletedTransaction(null); setAvailableSizes([]); setCustomerPhone(''); setDiscount(''); setDiscountType('flat') }}>
              New Sale
            </Button>
          </div>
        </Card>

        {/* Hidden receipt for printing */}
        <div className="hidden">
          <SalesReceipt ref={receiptRef} transaction={completedTransaction} language={printLanguage} />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Product Search */}
      <div className="lg:col-span-3 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Sale</h1>
          <p className="text-sm text-gray-500 mt-0.5">Search products by name, ID, or scan barcode</p>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Barcode size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); searchProducts(e.target.value) }}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) searchProducts(searchQuery) }}
                placeholder="Search by name, product ID, or scan barcode..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                autoFocus
              />
              {searching && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
            </div>

            {/* Results dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                {searchResults.map((result, ri) => (
                  <div key={ri} className="p-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      {result.product?.image_url && (
                        <img src={result.product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{result.product?.name}</p>
                        <p className="text-xs text-gray-500">{result.product?.base_product_id}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.variants?.map(v => (
                        <button
                          key={v.id}
                          onClick={() => addToCart(v, result.product)}
                          disabled={v.quantity === 0}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            v.quantity > 0
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          }`}
                        >
                          <span>{v.size}</span>
                          <span className="text-gray-500">({v.quantity})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Cart Items */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-100">
            <CardTitle>Cart Items ({cartItems.length})</CardTitle>
          </div>
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No items in cart</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {cartItems.map(item => (
                <div key={item.variantId} className="flex items-center gap-3 px-5 py-3">
                  {/* Product image */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                      <ShoppingCart size={16} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">Size: {item.size}</p>
                  </div>
                  {/* Price input for variable price */}
                  {!item.hasFixedPrice ? (
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={e => updatePrice(item.variantId, e.target.value)}
                      placeholder="Price"
                      className="w-24 px-2 py-1.5 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-700 w-24 text-right">{formatCurrency(item.unitPrice)}</span>
                  )}
                  {/* Quantity */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  <button onClick={() => removeItem(item.variantId)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Scanned Product — All Sizes Panel */}
        {scannedProduct && (
          <Card padding={false}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-800">
                  {scannedProduct.product.name}
                  <span className="ml-2 text-xs font-normal text-gray-400">{scannedProduct.product.base_product_id}</span>
                </span>
              </div>
              <button
                onClick={() => setScannedProduct(null)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
              >
                Dismiss
              </button>
            </div>
            <div className="px-5 py-3">
              <p className="text-xs text-gray-500 mb-2">All available sizes — click to add to cart</p>
              <div className="flex flex-wrap gap-2">
                {scannedProduct.variants.map(v => {
                  const inCartQty = scannedVariantCartQuantities[v.id] || 0
                  const remainingQty = Math.max(v.quantity - inCartQty, 0)
                  const isAvailable = remainingQty > 0
                  return (
                    <button
                      key={v.id}
                      onClick={() => addToCart(v, scannedProduct.product)}
                      disabled={!isAvailable}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                        isAvailable
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                      }`}
                    >
                      <span className="font-semibold">{v.size}</span>
                      <span className={`text-xs mt-0.5 ${isAvailable ? 'text-blue-500' : 'text-gray-400'}`}>
                        {isAvailable ? `${remainingQty} left` : 'Out of stock'}
                      </span>
                      {inCartQty > 0 && (
                        <span className="text-[10px] text-gray-600 mt-1">In cart: {inCartQty}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-2">
        <Card className="sticky top-20">
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <div className="space-y-4">
            {/* Payment Source */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Payment Source</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentSource('shop_cash')}
                  className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                    paymentSource === 'shop_cash'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">Shop Cash</div>
                    <div className="text-[10px] opacity-80">Physical cash</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentSource('online')}
                  className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                    paymentSource === 'online'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">Mobile Banking</div>
                    <div className="text-[10px] opacity-80">Digital payment</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentSource('bank')}
                  className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                    paymentSource === 'bank'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">Bank</div>
                    <div className="text-[10px] opacity-80">Bank transfer</div>
                  </div>
                </button>
              </div>

              {/* Mobile banking accounts panel */}
              {paymentSource === 'online' && (
                <div className="mt-3 space-y-2">
                  {mobileBankingAccounts.length === 0 ? (
                    <p className="text-xs text-gray-400 italic px-1">No mobile banking accounts configured.</p>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 px-0.5">Select account used for payment:</p>
                      {mobileBankingAccounts.map(acc => {
                        const isSelected = selectedMbAccount?.id === acc.id
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => setSelectedMbAccount(isSelected ? null : acc)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-emerald-50 border-emerald-100 hover:border-emerald-400 hover:bg-emerald-100'
                            }`}
                          >
                            <div>
                              <p className={`text-xs font-bold capitalize ${isSelected ? 'text-white' : 'text-emerald-800'}`}>
                                {acc.provider}
                              </p>
                              <p className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                {acc.account_name}
                              </p>
                            </div>
                            <p className={`text-sm font-mono font-bold ${isSelected ? 'text-white' : 'text-emerald-900'}`}>
                              {acc.account_number}
                            </p>
                          </button>
                        )
                      })}
                    </>
                  )}
                </div>
              )}

              {/* Bank accounts panel */}
              {paymentSource === 'bank' && (
                <div className="mt-3 space-y-2">
                  {bankAccounts.length === 0 ? (
                    <p className="text-xs text-gray-400 italic px-1">No bank accounts configured.</p>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 px-0.5">Select bank account used for payment:</p>
                      {bankAccounts.map(acc => {
                        const isSelected = selectedBankAccount?.id === acc.id
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => setSelectedBankAccount(isSelected ? null : acc)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-blue-50 border-blue-100 hover:border-blue-400 hover:bg-blue-100'
                            }`}
                          >
                            <div>
                              <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-blue-800'}`}>
                                {acc.bank_name}
                              </p>
                              <p className={`text-xs ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                                {acc.account_name}
                              </p>
                              {acc.branch && (
                                <p className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-blue-500'}`}>
                                  {acc.branch}
                                </p>
                              )}
                            </div>
                            <p className={`text-sm font-mono font-bold ${isSelected ? 'text-white' : 'text-blue-900'}`}>
                              {acc.account_number}
                            </p>
                          </button>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Discount</label>
              <div className="flex gap-2">
                {/* Type toggle */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setDiscountType('flat')}
                    className={`px-3 py-2 text-sm font-semibold transition-colors ${
                      discountType === 'flat'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ৳
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`px-3 py-2 text-sm font-semibold transition-colors ${
                      discountType === 'percent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    %
                  </button>
                </div>
                {/* Value input */}
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percent' ? 100 : undefined}
                  step="0.01"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder={discountType === 'percent' ? '0 – 100' : '0.00'}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Live preview when percent */}
              {discountType === 'percent' && discountValue > 0 && subtotal > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  = {formatCurrency(discountAmount)} off
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Discount
                    {discountType === 'percent' && discountValue > 0 && (
                      <span className="ml-1 text-xs opacity-75">({discountValue}%)</span>
                    )}
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              loading={processing}
              disabled={cartItems.length === 0}
              onClick={handleCheckout}
              icon={<CheckCircle size={18} />}
            >
              Complete Sale
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
