import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Phone, User, CreditCard,
  Upload, CheckCircle, AlertCircle, ImageOff, Copy, Check
} from 'lucide-react'
import api from '../../lib/axios'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

const PROVIDER_META = {
  bkash:  { label: 'bKash',  color: 'bg-pink-600',   textColor: 'text-pink-700',  border: 'border-pink-300',  bg: 'bg-pink-50',  logo: '💳' },
  nagad:  { label: 'Nagad',  color: 'bg-orange-500', textColor: 'text-orange-700', border: 'border-orange-300', bg: 'bg-orange-50', logo: '💳' },
  rocket: { label: 'Rocket', color: 'bg-purple-600',  textColor: 'text-purple-700', border: 'border-purple-300', bg: 'bg-purple-50', logo: '💳' },
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, cartTotal, clearCart } = useCart()

  const [step, setStep] = useState(1) // 1=address, 2=payment, 3=success
  const [mobileBankingAccounts, setMobileBankingAccounts] = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [copiedNumber, setCopiedNumber] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState(null)

  // Address form
  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    district: '',
    notes: '',
  })

  // Payment form
  const [payment, setPayment] = useState({
    transaction_id: '',
    sender_number: '',
    screenshot: null,
    screenshotPreview: null,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    api.get('/public/mobile-banking-accounts').then(res => {
      setMobileBankingAccounts(res.data || [])
    }).catch(() => {})
  }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && step !== 3) {
      navigate('/cart')
    }
  }, [cartItems, step, navigate])

  const validateAddress = () => {
    const e = {}
    if (!address.full_name.trim()) e.full_name = 'Full name is required'
    if (!address.phone.trim()) e.phone = 'Phone number is required'
    if (!address.address_line.trim()) e.address_line = 'Address is required'
    if (!address.city.trim()) e.city = 'City is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePayment = () => {
    const e = {}
    if (!selectedProvider) e.provider = 'Please select a payment method'
    if (!payment.transaction_id.trim()) e.transaction_id = 'Transaction ID is required'
    if (!payment.sender_number.trim()) e.sender_number = 'Your number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddressNext = () => {
    if (validateAddress()) setStep(2)
  }

  const handleScreenshot = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Removed file size limit - backend will handle compression
    setPayment(prev => ({
      ...prev,
      screenshot: file,
      screenshotPreview: URL.createObjectURL(file),
    }))
  }

  const copyNumber = (number) => {
    navigator.clipboard.writeText(number).then(() => {
      setCopiedNumber(number)
      toast.success('Number copied!')
      setTimeout(() => setCopiedNumber(null), 2000)
    })
  }

  const handlePlaceOrder = async () => {
    if (!validatePayment()) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('delivery_name', address.full_name)
      formData.append('delivery_phone', address.phone)
      formData.append('delivery_address', address.address_line)
      formData.append('delivery_city', address.city)
      formData.append('delivery_district', address.district)
      formData.append('delivery_notes', address.notes)
      formData.append('payment_method', selectedProvider)
      formData.append('transaction_reference', payment.transaction_id)
      formData.append('sender_number', payment.sender_number)
      formData.append('amount', cartTotal)
      if (payment.screenshot) {
        formData.append('payment_screenshot', payment.screenshot)
      }

      const res = await api.post('/customer/orders', formData, {
      })

      setOrderId(res.data.order_number || res.data.id)
      clearCart()
      setStep(3)
    } catch (err) {
      const backendMessage = err.response?.data?.message
      const validationErrors = err.response?.data?.errors
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null
      toast.error(firstValidationMessage || backendMessage || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedAccount = mobileBankingAccounts.find(a => a.provider === selectedProvider)
  const providerMeta = selectedProvider ? PROVIDER_META[selectedProvider] : null

  // Group accounts by provider
  const accountsByProvider = mobileBankingAccounts.reduce((acc, a) => {
    if (!acc[a.provider]) acc[a.provider] = []
    acc[a.provider].push(a)
    return acc
  }, {})

  // ── Step 3: Success ────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-2">
          Your order has been received and your payment is being verified.
        </p>
        {orderId && (
          <p className="text-sm font-mono bg-gray-100 rounded-lg px-4 py-2 inline-block mb-6 text-gray-700">
            Order #{orderId}
          </p>
        )}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left mb-8">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="space-y-1 list-disc list-inside text-amber-700">
            <li>Our team will verify your payment within a few hours</li>
            <li>You'll receive confirmation once verified</li>
            <li>Your order will be prepared for delivery</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/orders">
            <Button fullWidth>View My Orders</Button>
          </Link>
          <Link to="/products">
            <Button fullWidth variant="secondary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => step === 1 ? navigate('/cart') : setStep(1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500">{step === 1 ? 'Delivery information' : 'Payment'}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > n ? <Check size={14} /> : n}
            </div>
            <span className={`text-sm font-medium ${step >= n ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
            {n < 2 && <div className={`w-12 h-0.5 ${step > n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── Step 1: Delivery Address ── */}
          {step === 1 && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      <User size={13} className="inline mr-1" />Full Name *
                    </label>
                    <input
                      type="text"
                      value={address.full_name}
                      onChange={e => setAddress(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="Your full name"
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.full_name ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      <Phone size={13} className="inline mr-1" />Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Address *</label>
                  <input
                    type="text"
                    value={address.address_line}
                    onChange={e => setAddress(p => ({ ...p, address_line: e.target.value }))}
                    placeholder="House/Road/Area"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address_line ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.address_line && <p className="text-xs text-red-500 mt-1">{errors.address_line}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">City *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={e => setAddress(p => ({ ...p, city: e.target.value }))}
                      placeholder="Dhaka"
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">District</label>
                    <input
                      type="text"
                      value={address.district}
                      onChange={e => setAddress(p => ({ ...p, district: e.target.value }))}
                      placeholder="Dhaka"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Order Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={address.notes}
                    onChange={e => setAddress(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Any special instructions..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <Button fullWidth size="lg" onClick={handleAddressNext}>
                  Continue to Payment
                </Button>
              </div>
            </Card>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Select provider */}
              <Card>
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-600" />
                  Select Payment Method
                </h2>

                {mobileBankingAccounts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    <AlertCircle size={24} className="mx-auto mb-2 text-amber-400" />
                    No payment methods configured. Please contact the shop.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(accountsByProvider).map(([provider, accounts]) => {
                      const meta = PROVIDER_META[provider] || { label: provider, color: 'bg-gray-600', textColor: 'text-gray-700', border: 'border-gray-300', bg: 'bg-gray-50', logo: '💳' }
                      const isSelected = selectedProvider === provider
                      return (
                        <button
                          key={provider}
                          onClick={() => { setSelectedProvider(provider); setErrors(p => ({ ...p, provider: null })) }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${meta.border} ${meta.bg} ring-2 ring-offset-1 ring-current`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`w-12 h-12 ${meta.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                            {meta.label.charAt(0)}
                          </div>
                          <span className={`text-sm font-semibold ${isSelected ? meta.textColor : 'text-gray-700'}`}>
                            {meta.label}
                          </span>
                          {isSelected && <Check size={14} className={meta.textColor} />}
                        </button>
                      )
                    })}
                  </div>
                )}
                {errors.provider && <p className="text-xs text-red-500 mt-2">{errors.provider}</p>}
              </Card>

              {/* Send money instructions */}
              {selectedProvider && accountsByProvider[selectedProvider] && (
                <Card>
                  <h3 className={`font-semibold mb-4 flex items-center gap-2 ${providerMeta?.textColor}`}>
                    Send {formatCurrency(cartTotal)} via {providerMeta?.label}
                  </h3>
                  <div className="space-y-3">
                    {accountsByProvider[selectedProvider].map(account => (
                      <div key={account.id} className={`flex items-center justify-between p-4 rounded-xl border ${providerMeta?.border} ${providerMeta?.bg}`}>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Send to ({account.account_name})</p>
                          <p className={`text-xl font-bold font-mono tracking-wider ${providerMeta?.textColor}`}>
                            {account.account_number}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">{providerMeta?.label} {account.account_name}</p>
                        </div>
                        <button
                          onClick={() => copyNumber(account.account_number)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${providerMeta?.textColor} ${providerMeta?.bg} border ${providerMeta?.border} hover:opacity-80`}
                        >
                          {copiedNumber === account.account_number ? <Check size={12} /> : <Copy size={12} />}
                          {copiedNumber === account.account_number ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>Send the exact amount <strong>{formatCurrency(cartTotal)}</strong> and note the Transaction ID shown after payment.</span>
                  </div>
                </Card>
              )}

              {/* Transaction details */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Payment Confirmation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Transaction ID / TrxID *</label>
                    <input
                      type="text"
                      value={payment.transaction_id}
                      onChange={e => setPayment(p => ({ ...p, transaction_id: e.target.value }))}
                      placeholder="e.g. 8N7A3B2C1D"
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.transaction_id ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.transaction_id && <p className="text-xs text-red-500 mt-1">{errors.transaction_id}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Your {providerMeta?.label || 'Mobile Banking'} Number *</label>
                    <input
                      type="tel"
                      value={payment.sender_number}
                      onChange={e => setPayment(p => ({ ...p, sender_number: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sender_number ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.sender_number && <p className="text-xs text-red-500 mt-1">{errors.sender_number}</p>}
                  </div>

                  {/* Screenshot upload */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      Payment Screenshot <span className="text-gray-400 font-normal">(optional but recommended)</span>
                    </label>
                    <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      {payment.screenshotPreview ? (
                        <img src={payment.screenshotPreview} alt="screenshot" className="max-h-32 rounded-lg object-contain" />
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-400" />
                          <span className="text-sm text-gray-500">Click to upload screenshot</span>
                          <span className="text-xs text-gray-400">JPG, PNG · Any size</span>
                        </>
                      )}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleScreenshot} />
                    </label>
                    {payment.screenshotPreview && (
                      <button
                        onClick={() => setPayment(p => ({ ...p, screenshot: null, screenshotPreview: null }))}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        Remove screenshot
                      </button>
                    )}
                  </div>
                </div>
              </Card>

              <Button fullWidth size="lg" onClick={handlePlaceOrder} loading={submitting}>
                Place Order — {formatCurrency(cartTotal)}
              </Button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <Card className="sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map(item => {
                const product = item.product_variant?.product
                const variant = item.product_variant
                const price = product?.selling_price || 0
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {product?.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageOff size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{product?.name}</p>
                      <p className="text-xs text-gray-500">Size: {variant?.size} × {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900 shrink-0">{formatCurrency(price * item.quantity)}</p>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">To be confirmed</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {step === 2 && address.full_name && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivering to</p>
                <p className="text-sm font-medium text-gray-900">{address.full_name}</p>
                <p className="text-xs text-gray-500">{address.phone}</p>
                <p className="text-xs text-gray-500">{address.address_line}, {address.city}</p>
                <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:text-blue-700 mt-1">Edit</button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
