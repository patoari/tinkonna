import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, BookOpen, ImageOff, ArrowLeft, Check, AlertCircle, Upload, CheckCircle } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency, getCategoryLabel } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isZoomActive, setIsZoomActive] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [bookingModal, setBookingModal] = useState(false)
  const [bookingType, setBookingType] = useState('free')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  // Multi-step paid booking state
  // step: 'select' | 'payment' | 'done'
  const [bookingStep, setBookingStep] = useState('select')
  const [createdBooking, setCreatedBooking] = useState(null)
  const [mobileBankingAccounts, setMobileBankingAccounts] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionRef, setTransactionRef] = useState('')
  const [senderNumber, setSenderNumber] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    api.get(`/public/products/${id}`)
      .then(res => {
        setProduct(res.data)
        const firstInStock = res.data.variants?.find(v => v.quantity > 0)
        setSelectedVariant(firstInStock || res.data.variants?.[0])
        setActiveImageIndex(0)
      })
      .finally(() => setLoading(false))
  }, [id])

  // Load mobile banking accounts when modal opens
  useEffect(() => {
    if (bookingModal) {
      api.get('/public/mobile-banking-accounts')
        .then(res => setMobileBankingAccounts(res.data || []))
        .catch(() => {})
    }
  }, [bookingModal])

  const resetBookingModal = () => {
    setBookingStep('select')
    setBookingType('free')
    setCreatedBooking(null)
    setPaymentMethod('')
    setTransactionRef('')
    setSenderNumber('')
    setScreenshot(null)
    setScreenshotPreview(null)
  }

  const handleZoomMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    })
  }

  const handleZoomEnter = () => setIsZoomActive(true)
  const handleZoomLeave = () => setIsZoomActive(false)

  const handleCloseModal = () => {
    setBookingModal(false)
    resetBookingModal()
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!selectedVariant) { toast.error('Please select a size'); return }
    setAddingToCart(true)
    try {
      await addToCart(selectedVariant.id)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  // Step 1: Create the booking
  const handleConfirmBooking = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!selectedVariant) { toast.error('Please select a size'); return }
    setBookingLoading(true)
    try {
      const res = await api.post('/bookings', {
        product_variant_id: selectedVariant.id,
        booking_type: bookingType,
        quantity: 1,
      })
      if (bookingType === 'free') {
        toast.success('Free booking created! Reserved for 24 hours.')
        handleCloseModal()
      } else {
        // Paid booking — move to payment step
        setCreatedBooking(res.data)
        setBookingStep('payment')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  // Step 2: Submit payment details
  const handleSubmitPayment = async () => {
    if (!paymentMethod) { toast.error('Select a payment method'); return }
    if (!transactionRef.trim()) { toast.error('Enter the transaction reference'); return }
    if (!senderNumber.trim()) { toast.error('Enter your sender number'); return }

    setPaymentLoading(true)
    try {
      const formData = new FormData()
      formData.append('booking_id', createdBooking.id)
      formData.append('payment_method', paymentMethod)
      formData.append('transaction_reference', transactionRef)
      formData.append('sender_number', senderNumber)
      if (screenshot) formData.append('payment_screenshot', screenshot)

      await api.post('/booking-payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setBookingStep('done')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Removed file size limit - backend will handle compression
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  if (loading) return <PageLoader />
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

  const displayPrice = product.has_fixed_price
    ? product.selling_price
    : (product.online_price || null)

  const imageGallery = (product.images?.length > 0)
    ? product.images
    : product.image_url
      ? [{ image_url: product.image_url }]
      : []

  const activeImage = imageGallery[activeImageIndex] || imageGallery[0] || null
  const bookingFee = displayPrice ? (displayPrice * 0.2).toFixed(2) : null

  // ── Modal title per step ──
  const modalTitle = bookingStep === 'payment'
    ? 'Submit Payment'
    : bookingStep === 'done'
      ? 'Booking Confirmed!'
      : 'Book This Product'

  // ── Modal footer per step ──
  const modalFooter = bookingStep === 'select' ? (
    <>
      <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
      <Button onClick={handleConfirmBooking} loading={bookingLoading}>Confirm Booking</Button>
    </>
  ) : bookingStep === 'payment' ? (
    <>
      <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
      <Button onClick={handleSubmitPayment} loading={paymentLoading}>Submit Payment</Button>
    </>
  ) : (
    <Button fullWidth onClick={handleCloseModal}>Close</Button>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative">
            {activeImage ? (
              <img
                src={activeImage.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onMouseEnter={handleZoomEnter}
                onMouseMove={handleZoomMouseMove}
                onMouseLeave={handleZoomLeave}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageOff size={64} />
              </div>
            )}
          </div>

          {imageGallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {imageGallery.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`rounded-2xl overflow-hidden border ${activeImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} focus:outline-none`}
                >
                  <img src={item.image_url} alt={`${product.name} ${idx + 1}`} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          )}

          {imageGallery.length > 1 && (
            <p className="text-xs text-gray-500">{activeImageIndex + 1} of {imageGallery.length} photos</p>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5 relative">
          {activeImage && isZoomActive && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 p-4 sm:p-6">
              <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-2xl h-[520px]">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${activeImage.image_url})`,
                    backgroundSize: '220%',
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <Badge variant="primary" className="mb-2">{getCategoryLabel(product.category)}</Badge>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            {product.name_bn && <p className="text-gray-500 mt-1">{product.name_bn}</p>}
            <p className="text-xs text-gray-400 mt-1 font-mono">ID: {product.base_product_id}</p>
          </div>

          {/* Price */}
          <div className="p-4 bg-gray-50 rounded-xl">
            {displayPrice ? (
              <>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(displayPrice)}</p>
                {!product.has_fixed_price && (
                  <p className="text-xs text-gray-500 mt-1">Online price — in-store price may vary</p>
                )}
              </>
            ) : (
              <p className="text-lg text-gray-600 italic">Contact us for pricing</p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Size selection */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants?.map(v => (
                <button
                  key={v.id}
                  onClick={() => v.quantity > 0 && setSelectedVariant(v)}
                  disabled={v.quantity === 0}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    selectedVariant?.id === v.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : v.quantity > 0
                        ? 'border-gray-300 text-gray-700 hover:border-blue-400'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                  }`}
                >
                  {v.size}
                  {v.quantity === 0 && <span className="ml-1 text-xs">(Out)</span>}
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.quantity > 0 && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Check size={12} />
                {selectedVariant.quantity} in stock
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isCustomer && (
              <Button
                fullWidth
                size="lg"
                icon={<ShoppingCart size={18} />}
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={!selectedVariant || selectedVariant.quantity === 0}
              >
                Add to Cart
              </Button>
            )}
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              icon={<BookOpen size={18} />}
              onClick={() => {
                if (!isAuthenticated) { navigate('/login'); return }
                setBookingModal(true)
              }}
              disabled={!selectedVariant || selectedVariant.quantity === 0}
            >
              Book Now
            </Button>
          </div>

          {/* Stock info */}
          <div className="grid grid-cols-2 gap-3">
            {product.variants?.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium text-gray-700">Size {v.size}</span>
                <Badge status={v.quantity > 0 ? 'active' : 'cancelled'} dot>
                  {v.quantity > 0 ? `${v.quantity} left` : 'Out of stock'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Booking Modal ── */}
      <Modal
        isOpen={bookingModal}
        onClose={handleCloseModal}
        title={modalTitle}
        size="sm"
        footer={modalFooter}
      >
        {/* ── Step 1: Select booking type ── */}
        {bookingStep === 'select' && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl text-sm">
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-gray-500">Size: {selectedVariant?.size}</p>
              {displayPrice && <p className="text-gray-700 font-medium mt-1">{formatCurrency(displayPrice)}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Booking Type</p>
              <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${bookingType === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" value="free" checked={bookingType === 'free'} onChange={() => setBookingType('free')} className="mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Free Booking</p>
                  <p className="text-xs text-gray-500">Reserve for 24 hours, no payment required</p>
                </div>
              </label>
              {bookingFee && (
                <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${bookingType === 'paid' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" value="paid" checked={bookingType === 'paid'} onChange={() => setBookingType('paid')} className="mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Paid Booking</p>
                    <p className="text-xs text-gray-500">Pay {formatCurrency(bookingFee)} (20%) to reserve for 7 days</p>
                  </div>
                </label>
              )}
            </div>

            {bookingType === 'paid' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <p>After confirming, you'll be asked to submit your payment details (transaction ID, sender number, screenshot).</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Payment details ── */}
        {bookingStep === 'payment' && (
          <div className="space-y-4">
            {/* Booking summary */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm space-y-1">
              <p className="font-semibold text-blue-900">Booking #{createdBooking?.booking_number}</p>
              <p className="text-blue-700">{product.name} — Size {selectedVariant?.size}</p>
              <p className="text-blue-800 font-bold">Booking Fee: {formatCurrency(createdBooking?.booking_fee)}</p>
            </div>

            {/* Shop's mobile banking accounts */}
            {mobileBankingAccounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">Send payment to:</p>
                {mobileBankingAccounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">{acc.provider}</p>
                      <p className="text-xs text-gray-500">{acc.account_name}</p>
                    </div>
                    <p className="font-mono font-bold text-gray-900 text-base">{acc.account_number}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Payment method */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Payment Method <span className="text-red-500">*</span></label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select method...</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Sender number */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Your Sender Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={senderNumber}
                onChange={e => setSenderNumber(e.target.value)}
                placeholder="e.g. 01XXXXXXXXX"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Transaction reference */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Transaction ID / Reference <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g. 8N7A2B3C4D"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Payment Screenshot (optional)</label>
              <div
                onClick={() => document.getElementById('booking-screenshot').click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="screenshot" className="max-h-32 mx-auto rounded-lg object-contain" />
                ) : (
                  <div className="text-gray-400">
                    <Upload size={24} className="mx-auto mb-1" />
                    <p className="text-xs">Click to upload screenshot</p>
                    <p className="text-xs text-gray-300 mt-0.5">JPEG, PNG • Any size</p>
                  </div>
                )}
              </div>
              <input
                id="booking-screenshot"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleScreenshotChange}
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {bookingStep === 'done' && (
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Paid Booking Created!</h3>
            <p className="text-sm text-gray-500">
              Your payment details have been submitted. The shop will verify your payment and activate your booking within a short time.
            </p>
            <div className="p-3 bg-gray-50 rounded-xl text-sm text-left space-y-1">
              <p className="font-medium text-gray-800">{product.name} — Size {selectedVariant?.size}</p>
              <p className="text-gray-500">Booking: {createdBooking?.booking_number}</p>
              <p className="text-gray-500">Fee paid: {formatCurrency(createdBooking?.booking_fee)}</p>
            </div>
            <p className="text-xs text-gray-400">You can track your booking status in My Orders.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
