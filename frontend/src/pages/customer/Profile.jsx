import { useState, useEffect } from 'react'
import { User, Package, BookOpen, ShoppingCart, MapPin, Edit, Trash2, ImageOff, Plus, Minus, Upload, CheckCircle, Camera, MoreVertical, LogOut, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../lib/axios'
import { formatCurrency, formatDateTime, timeRemaining } from '../../lib/utils'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { PageLoader } from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'cart', label: 'Cart', icon: ShoppingCart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
]

export default function CustomerProfile() {
  const { user, updateUser } = useAuth()
  const { removeFromCart, updateCartItem } = useCart()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [bookings, setBookings] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })

  // Image upload states
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  // Booking → online purchase modal state
  const [buyBookingModal, setBuyBookingModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [mobileBankingAccounts, setMobileBankingAccounts] = useState([])
  const [buyForm, setBuyForm] = useState({
    delivery_name: user?.name || '', delivery_phone: user?.phone || '',
    delivery_address: '', delivery_city: '', delivery_district: '', delivery_notes: '',
    payment_method: '', transaction_reference: '', sender_number: '',
  })
  const [buyScreenshot, setBuyScreenshot] = useState(null)
  const [buyScreenshotPreview, setBuyScreenshotPreview] = useState(null)
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyDone, setBuyDone] = useState(null) // holds response on success

  useEffect(() => {
    if (activeTab === 'orders') {
      setLoading(true)
      api.get('/customer/orders').then(res => setOrders(res.data)).finally(() => setLoading(false))
    } else if (activeTab === 'bookings') {
      setLoading(true)
      api.get('/customer/bookings').then(res => setBookings(res.data)).finally(() => setLoading(false))
    } else if (activeTab === 'cart') {
      setLoading(true)
      api.get('/cart').then(res => setCartItems(res.data || [])).finally(() => setLoading(false))
    } else if (activeTab === 'addresses') {
      setLoading(true)
      api.get('/customer/addresses').then(res => setAddresses(res.data)).finally(() => setLoading(false))
    }
  }, [activeTab])

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put('/auth/profile', profileData)
      updateUser(res.data)
      setEditProfile(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleUploadCoverImage = async (file) => {
    if (!file) return
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('cover_image', file)
      const res = await api.post('/auth/profile/cover-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser(res.data)
      setCoverImage(null)
      setCoverImagePreview(res.data.cover_image_url)
      toast.success('Cover image updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload cover image')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleUploadProfileImage = async (file) => {
    if (!file) return
    setUploadingProfile(true)
    try {
      const formData = new FormData()
      formData.append('profile_avatar', file)
      const res = await api.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser(res.data)
      setProfileImage(null)
      setProfileImagePreview(res.data.profile_avatar_url)
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile image')
    } finally {
      setUploadingProfile(false)
    }
  }

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onload = () => setCoverImagePreview(reader.result)
      reader.readAsDataURL(file)
      await handleUploadCoverImage(file)
    }
  }

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = () => setProfileImagePreview(reader.result)
      reader.readAsDataURL(file)
      await handleUploadProfileImage(file)
    }
  }

  const handleCancelBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/cancel`)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  const openBuyModal = (booking) => {
    setSelectedBooking(booking)
    setBuyDone(null)
    setBuyScreenshot(null)
    setBuyScreenshotPreview(null)
    setBuyForm(f => ({ ...f, delivery_name: user?.name || '', delivery_phone: user?.phone || '' }))
    // Load mobile banking accounts
    api.get('/public/mobile-banking-accounts')
      .then(res => setMobileBankingAccounts(res.data || []))
      .catch(() => {})
    setBuyBookingModal(true)
  }

  const handleBuyBooking = async () => {
    if (!buyForm.delivery_name || !buyForm.delivery_phone || !buyForm.delivery_address || !buyForm.delivery_city) {
      toast.error('Fill in all required delivery fields'); return
    }
    if (!buyForm.payment_method) { toast.error('Select a payment method'); return }
    if (!buyForm.transaction_reference) { toast.error('Enter transaction reference'); return }
    if (!buyForm.sender_number) { toast.error('Enter your sender number'); return }

    setBuyLoading(true)
    try {
      const formData = new FormData()
      formData.append('booking_id', selectedBooking.id)
      Object.entries(buyForm).forEach(([k, v]) => { if (v) formData.append(k, v) })
      if (buyScreenshot) formData.append('payment_screenshot', buyScreenshot)

      const res = await api.post('/customer/orders/from-booking', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setBuyDone(res.data)
      // Mark booking as completed in local state
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'completed' } : b))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setBuyLoading(false)
    }
  }

  const handleRemoveCartItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`)
      setCartItems(prev => prev.filter(i => i.id !== itemId))
      removeFromCart(itemId)
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const handleUpdateCartQty = async (item, qty) => {
    if (qty < 1) { handleRemoveCartItem(item.id); return }
    try {
      await api.put(`/cart/${item.id}`, { quantity: qty })
      setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: qty } : i))
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product_variant?.product?.selling_price
      || item.product_variant?.product?.online_price
      || 0
    return sum + (parseFloat(price) * item.quantity)
  }, 0)

  const coverSrc = coverImagePreview || user?.cover_image_url
  const profileSrc = profileImagePreview || user?.profile_avatar_url

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('Profile image source:', profileSrc)
      console.debug('Cover image source:', coverSrc)
    }
  }, [profileSrc, coverSrc])

  return (
    <div className="bg-white">
      {/* Cover + Profile header (Facebook-like) */}
      <div className="w-full bg-gray-100">
        <div className="relative">
          <div className="h-48 bg-gray-200 w-full overflow-hidden group relative">
            {coverSrc ? (
              <img key={coverSrc} src={coverSrc} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Cover image</div>
            )}
            
            {/* Cover image upload button */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 cursor-pointer transition-all">
              <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
              <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </label>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-4">
                <label className="w-36 h-36 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden cursor-pointer group relative">
                  <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                  {profileSrc ? (
                    <img key={profileSrc} src={profileSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                    <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </label>
                <div className="pb-3">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-sm text-gray-500">{user?.email || user?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative">
                <Button size="sm" variant="secondary" onClick={() => setEditProfile(true)}>Edit Profile</Button>
                <div className="relative">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {moreMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => { setEditProfile(true); setMoreMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit size={14} /> Edit Details
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => { setMoreMenuOpen(false); /* logout handler */ }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={14} /> More Options
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Horizontal nav like Facebook */}
            <div className="mt-4 border-t border-gray-100">
              <nav className="flex space-x-6 text-sm font-medium">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 ${activeTab === tab.id ? 'border-b-4 border-blue-600 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon size={14} />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeTab === 'profile' && (
        <Card>
          <CardHeader action={
            <Button size="sm" variant="secondary" icon={<Edit size={14} />} onClick={() => setEditProfile(!editProfile)}>
              {editProfile ? 'Cancel' : 'Edit'}
            </Button>
          }>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          {editProfile ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <input value={profileData.name} onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                <input type="email" value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
                <input value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Image upload preview sections */}
              {coverImagePreview && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-blue-900">Cover image ready to upload</p>
                  <Button size="sm" onClick={() => handleUploadCoverImage(coverImage)} loading={uploadingCover} fullWidth>
                    Upload Cover Image
                  </Button>
                </div>
              )}

              {profileImagePreview && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-green-900">Profile picture ready to upload</p>
                  <Button size="sm" onClick={() => handleUploadProfileImage(profileImage)} loading={uploadingProfile} fullWidth>
                    Upload Profile Picture
                  </Button>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateProfile} fullWidth>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditProfile(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email || 'Not set' },
                { label: 'Phone', value: user?.phone || 'Not set' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          {loading ? <PageLoader /> : orders.length === 0 ? (
            <Card><p className="text-center text-gray-500 py-8">No orders yet</p></Card>
          ) : orders.map(order => (
            <Card key={order.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">{order.transaction_number}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(order.transaction_date)}</p>
                </div>
                <p className="font-bold text-gray-900">{formatCurrency(order.net_amount)}</p>
              </div>
              <div className="space-y-1">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600">
                    <span>{item.product_name} ({item.size}) × {item.quantity}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {loading ? <PageLoader /> : bookings.length === 0 ? (
            <Card><p className="text-center text-gray-500 py-8">No bookings yet</p></Card>
          ) : bookings.map(booking => {
            const product    = booking.product_variant?.product
            const basePrice  = parseFloat(product?.selling_price || product?.online_price || 0)
            const feeDeduct  = booking.booking_type === 'paid' && booking.booking_fee > 0
              ? parseFloat(booking.booking_fee) : 0
            const finalPrice = Math.max(0, basePrice - feeDeduct)
            const canBuy     = booking.status === 'active' && basePrice > 0

            return (
              <Card key={booking.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{product?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Size: {booking.product_variant?.size} • {booking.booking_type} booking
                    </p>
                    {booking.expiry_date && booking.status === 'active' && (
                      <p className="text-xs text-blue-600 mt-1">{timeRemaining(booking.expiry_date)}</p>
                    )}
                    {/* Price info */}
                    {canBuy && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {feeDeduct > 0 ? (
                          <>
                            <span className="text-xs text-gray-400 line-through">{formatCurrency(basePrice)}</span>
                            <span className="text-sm font-bold text-green-600">{formatCurrency(finalPrice)}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              -{formatCurrency(feeDeduct)} booking fee deducted
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-800">{formatCurrency(basePrice)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Badge status={booking.status} dot>{booking.status.replace('_', ' ')}</Badge>
                      {['active', 'pending_payment'].includes(booking.status) && (
                        <button onClick={() => handleCancelBooking(booking.id)} className="text-xs text-red-600 hover:text-red-700">Cancel</button>
                      )}
                    </div>
                    {canBuy && (
                      <button
                        onClick={() => openBuyModal(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <ShoppingCart size={12} />
                        Buy Online
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 'cart' && (
        <div className="space-y-3">
          {loading ? <PageLoader /> : cartItems.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <ShoppingCart size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Browse products and add items to your cart</p>
                <Link to="/products">
                  <Button className="mt-4" size="sm">Browse Products</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {cartItems.map(item => {
                const product  = item.product_variant?.product
                const variant  = item.product_variant
                const price    = parseFloat(product?.selling_price || product?.online_price || 0)
                const subtotal = price * item.quantity
                return (
                  <Card key={item.id}>
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {product?.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={20} /></div>
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{product?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Size: {variant?.size}</p>
                        <p className="text-sm font-medium text-blue-600 mt-0.5">{formatCurrency(price)}</p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateCartQty(item, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Subtotal + remove */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(subtotal)}</p>
                        <button
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 mt-1 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}

              {/* Cart total + checkout */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
                </div>
                <Link to="/checkout">
                  <Button fullWidth size="lg" icon={<ShoppingCart size={16} />}>
                    Proceed to Checkout
                  </Button>
                </Link>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-3">
          {loading ? <PageLoader /> : (
            <>
              {addresses.map(addr => (
                <Card key={addr.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary" className="capitalize">{addr.label}</Badge>
                        {addr.is_default && <Badge variant="success">Default</Badge>}
                      </div>
                      <p className="text-sm text-gray-700">{addr.street_address}</p>
                      <p className="text-sm text-gray-500">{addr.city} {addr.postal_code}</p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                  </div>
                </Card>
              ))}
              <Card>
                <p className="text-sm text-gray-500 text-center py-4">Address management coming soon</p>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Buy Booking Online Modal ── */}
      <Modal
        isOpen={buyBookingModal}
        onClose={() => { setBuyBookingModal(false); setBuyDone(null) }}
        title={buyDone ? 'Order Placed!' : 'Buy Booked Product Online'}
        size="md"
        footer={buyDone ? (
          <Button fullWidth onClick={() => { setBuyBookingModal(false); setBuyDone(null) }}>Close</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setBuyBookingModal(false)}>Cancel</Button>
            <Button loading={buyLoading} onClick={handleBuyBooking}>Place Order</Button>
          </>
        )}
      >
        {buyDone ? (
          /* ── Success screen ── */
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Order Submitted!</h3>
            <p className="text-sm text-gray-500">Your payment is being verified. We'll confirm your order shortly.</p>
            <div className="p-3 bg-gray-50 rounded-xl text-sm text-left space-y-1">
              <p className="font-medium">{selectedBooking?.product_variant?.product?.name} — Size {selectedBooking?.product_variant?.size}</p>
              {buyDone.booking_fee_applied > 0 && (
                <p className="text-green-600 text-xs">✓ Booking fee of {formatCurrency(buyDone.booking_fee_applied)} deducted</p>
              )}
              <p className="font-bold text-gray-900">Total paid: {formatCurrency(buyDone.order?.total_amount)}</p>
            </div>
          </div>
        ) : selectedBooking && (
          <div className="space-y-4">
            {/* Product summary */}
            {(() => {
              const product   = selectedBooking.product_variant?.product
              const basePrice = parseFloat(product?.selling_price || product?.online_price || 0)
              const feeDeduct = selectedBooking.booking_type === 'paid' && selectedBooking.booking_fee > 0
                ? parseFloat(selectedBooking.booking_fee) : 0
              const finalPrice = Math.max(0, basePrice - feeDeduct)
              return (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm space-y-1">
                  <p className="font-semibold text-blue-900">{product?.name} — Size {selectedBooking.product_variant?.size}</p>
                  {feeDeduct > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-400 line-through text-xs">{formatCurrency(basePrice)}</span>
                      <span className="font-bold text-green-700">{formatCurrency(finalPrice)}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        -{formatCurrency(feeDeduct)} booking fee deducted
                      </span>
                    </div>
                  ) : (
                    <p className="font-bold text-blue-800">{formatCurrency(basePrice)}</p>
                  )}
                </div>
              )
            })()}

            {/* Delivery info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Name *', key: 'delivery_name' },
                { label: 'Phone *', key: 'delivery_phone' },
                { label: 'City *', key: 'delivery_city' },
                { label: 'District', key: 'delivery_district' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{f.label}</label>
                  <input
                    value={buyForm[f.key]}
                    onChange={e => setBuyForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Address *</label>
              <input
                value={buyForm.delivery_address}
                onChange={e => setBuyForm(p => ({ ...p, delivery_address: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Mobile banking accounts */}
            {mobileBankingAccounts.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-600">Send payment to:</p>
                {mobileBankingAccounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                    <div>
                      <p className="font-semibold capitalize text-gray-800">{acc.provider}</p>
                      <p className="text-xs text-gray-500">{acc.account_name}</p>
                    </div>
                    <p className="font-mono font-bold text-gray-900">{acc.account_number}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Payment fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Payment Method *</label>
                <select
                  value={buyForm.payment_method}
                  onChange={e => setBuyForm(p => ({ ...p, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select...</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Sender Number *</label>
                <input
                  value={buyForm.sender_number}
                  onChange={e => setBuyForm(p => ({ ...p, sender_number: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Transaction ID / Reference *</label>
              <input
                value={buyForm.transaction_reference}
                onChange={e => setBuyForm(p => ({ ...p, transaction_reference: e.target.value }))}
                placeholder="e.g. 8N7A2B3C4D"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Screenshot */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Payment Screenshot (optional)</label>
              <div
                onClick={() => document.getElementById('buy-screenshot').click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                {buyScreenshotPreview
                  ? <img src={buyScreenshotPreview} alt="screenshot" className="max-h-24 mx-auto rounded-lg object-contain" />
                  : <div className="text-gray-400"><Upload size={20} className="mx-auto mb-1" /><p className="text-xs">Click to upload</p></div>
                }
              </div>
              <input
                id="buy-screenshot"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  const f = e.target.files[0]
                  if (!f) return
                  setBuyScreenshot(f)
                  setBuyScreenshotPreview(URL.createObjectURL(f))
                }}
              />
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  )
}

