import { useState, useEffect } from 'react'
import {
  Save, Upload, Trash2, Globe, Home, Phone, Share2,
  Search, Image, Settings as SettingsIcon, CheckCircle,
  CreditCard, Plus, Pencil, X, Check, ToggleLeft, ToggleRight,
  GripVertical, Images, Building2
} from 'lucide-react'
import api from '../../lib/axios'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { PageLoader } from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'
import { confirmDelete, successAlert } from '../../lib/sweetalert'

const TABS = [
  { id: 'general',        label: 'General',        icon: SettingsIcon, description: 'Site name, logo, favicon' },
  { id: 'homepage',       label: 'Homepage',        icon: Home,         description: 'Hero section, featured products' },
  { id: 'contact',        label: 'Contact',         icon: Phone,        description: 'Address, phone, email' },
  { id: 'social',         label: 'Social',          icon: Share2,       description: 'Facebook, Instagram, YouTube' },
  { id: 'seo',            label: 'SEO',             icon: Search,       description: 'Meta title, description, keywords' },
  { id: 'footer',         label: 'Footer',          icon: Globe,        description: 'Footer text, copyright' },
  { id: 'mobile_banking', label: 'Mobile Banking',  icon: CreditCard,   description: 'bKash, Nagad, Rocket accounts' },
  { id: 'bank_accounts',  label: 'Bank Accounts',   icon: Building2,    description: 'Bank account details' },
]

const PROVIDER_LABELS = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', other: 'Other' }
const PROVIDER_COLORS = {
  bkash:  'bg-pink-100 text-pink-700 border-pink-200',
  nagad:  'bg-orange-100 text-orange-700 border-orange-200',
  rocket: 'bg-purple-100 text-purple-700 border-purple-200',
  other:  'bg-gray-100 text-gray-700 border-gray-200',
}

function HeroImagesSection() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchImages = () => {
    setLoading(true)
    api.get('/hero-images')
      .then(res => setImages(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchImages() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await api.post('/hero-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImages(prev => [...prev, res.data])
      toast.success('Image uploaded!')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed'
      toast.error(errorMsg)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Remove this image?',
      text: 'This hero background image will be permanently deleted.',
      confirmButtonText: 'Yes, remove it'
    })
    if (!result.isConfirmed) return
    try {
      await api.delete(`/hero-images/${id}`)
      setImages(prev => prev.filter(i => i.id !== id))
      successAlert({ title: 'Removed!', text: 'Hero image has been removed.' })
    } catch {
      toast.error('Failed to remove')
    }
  }

  const handleToggle = async (img) => {
    try {
      const res = await api.post(`/hero-images/${img.id}/toggle`)
      setImages(prev => prev.map(i => i.id === img.id ? res.data : i))
    } catch { toast.error('Failed to update') }
  }

  const handleToggleMobile = async (img) => {
    try {
      const res = await api.post(`/hero-images/${img.id}/toggle-mobile`)
      setImages(prev => prev.map(i => i.id === img.id ? res.data : i))
    } catch { toast.error('Failed to update') }
  }

  const handleToggleTablet = async (img) => {
    try {
      const res = await api.post(`/hero-images/${img.id}/toggle-tablet`)
      setImages(prev => prev.map(i => i.id === img.id ? res.data : i))
    } catch { toast.error('Failed to update') }
  }

  const handleToggleDesktop = async (img) => {
    try {
      const res = await api.post(`/hero-images/${img.id}/toggle-desktop`)
      setImages(prev => prev.map(i => i.id === img.id ? res.data : i))
    } catch { toast.error('Failed to update') }
  }

  const handleDragStart = (e, index) => e.dataTransfer.setData('dragIndex', index)
  const handleDrop = async (e, dropIndex) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'))
    if (dragIndex === dropIndex) return
    const reordered = [...images]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    setImages(reordered)
    try {
      await api.post('/hero-images/reorder', { order: reordered.map(i => i.id) })
    } catch { toast.error('Failed to save order'); fetchImages() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Images size={15} className="text-blue-500" />
            Hero Background Images
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Upload images for the homepage carousel. Use the 🖥 / 📟 / 📱 toggles to control which images show on desktop, tablet, or mobile. Drag to reorder.
          </p>
        </div>
        <label className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border cursor-pointer transition-colors',
          uploading
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
        )}>
          {uploading
            ? <><span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Uploading...</>
            : <><Upload size={14} /> Add Image</>
          }
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">🖥</span>
          Desktop (≥1024px)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">📟</span>
          Tablet (768–1023px)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">📱</span>
          Mobile (&lt;768px)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">Loading...</div>
      ) : images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
          <Image size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">No hero images yet. Upload your first image.</p>
          <p className="text-xs text-gray-300 mt-1">JPEG, PNG, WebP, GIF, SVG · Any size (GIFs preserved, others compressed)</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, index)}
              className={cn(
                'relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab',
                img.is_active ? 'border-blue-300' : 'border-gray-200 opacity-60'
              )}
              style={{ aspectRatio: '16/7' }}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />

              {/* Hover overlay — action buttons */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Active toggle */}
                <button
                  onClick={() => handleToggle(img)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-white transition-colors text-xs',
                    img.is_active ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
                  )}
                  title={img.is_active ? 'Active — click to hide' : 'Hidden — click to show'}
                >
                  {img.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                  <span>All</span>
                </button>

                {/* Desktop toggle */}
                <button
                  onClick={() => handleToggleDesktop(img)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-white transition-colors text-xs',
                    img.show_on_desktop !== false ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'
                  )}
                  title={img.show_on_desktop !== false ? 'Shown on Desktop — click to hide' : 'Hidden on Desktop — click to show'}
                >
                  <span className="text-sm leading-none">🖥</span>
                  <span>{img.show_on_desktop !== false ? 'On' : 'Off'}</span>
                </button>

                {/* Tablet toggle */}
                <button
                  onClick={() => handleToggleTablet(img)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-white transition-colors text-xs',
                    img.show_on_tablet !== false ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'
                  )}
                  title={img.show_on_tablet !== false ? 'Shown on Tablet — click to hide' : 'Hidden on Tablet — click to show'}
                >
                  <span className="text-sm leading-none">📟</span>
                  <span>{img.show_on_tablet !== false ? 'On' : 'Off'}</span>
                </button>

                {/* Mobile toggle */}
                <button
                  onClick={() => handleToggleMobile(img)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-white transition-colors text-xs',
                    img.show_on_mobile ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-500 hover:bg-gray-600'
                  )}
                  title={img.show_on_mobile ? 'Shown on Mobile — click to hide' : 'Hidden on Mobile — click to show'}
                >
                  <span className="text-sm leading-none">📱</span>
                  <span>{img.show_on_mobile ? 'On' : 'Off'}</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-xs"
                  title="Delete"
                >
                  <Trash2 size={15} />
                  <span>Del</span>
                </button>
              </div>

              {/* Drag handle */}
              <div className="absolute top-1.5 right-1.5 text-white/70">
                <GripVertical size={14} />
              </div>

              {/* Status badges — always visible */}
              <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                {!img.is_active && (
                  <span className="bg-gray-800/80 text-white text-xs px-1.5 py-0.5 rounded">
                    Hidden
                  </span>
                )}
                {img.show_on_desktop === false && (
                  <span className="bg-blue-800/80 text-white text-xs px-1.5 py-0.5 rounded">
                    🖥 Off
                  </span>
                )}
                {img.show_on_tablet === false && (
                  <span className="bg-orange-700/80 text-white text-xs px-1.5 py-0.5 rounded">
                    📟 Off
                  </span>
                )}
                {!img.show_on_mobile && (
                  <span className="bg-purple-800/80 text-white text-xs px-1.5 py-0.5 rounded">
                    📱 Off
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MobileBankingTab() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ provider: 'bkash', account_name: '', account_number: '', is_active: true })

  const fetchAccounts = () => {
    setLoading(true)
    api.get('/mobile-banking-accounts')
      .then(res => setAccounts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAccounts() }, [])

  const resetForm = () => {
    setForm({ provider: 'bkash', account_name: '', account_number: '', is_active: true })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (acc) => {
    setForm({ provider: acc.provider, account_name: acc.account_name, account_number: acc.account_number, is_active: acc.is_active })
    setEditingId(acc.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.account_name.trim() || !form.account_number.trim()) {
      toast.error('Account name and number are required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/mobile-banking-accounts/${editingId}`, form)
        toast.success('Account updated!')
      } else {
        await api.post('/mobile-banking-accounts', form)
        toast.success('Account added!')
      }
      fetchAccounts()
      resetForm()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Remove this account?',
      text: 'This mobile banking account will be removed from checkout.',
      confirmButtonText: 'Yes, remove it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/mobile-banking-accounts/${id}`)
      setAccounts(prev => prev.filter(a => a.id !== id))
      successAlert({ title: 'Removed!', text: 'Account has been removed.' })
    } catch {
      toast.error('Failed to remove')
    }
  }

  const handleToggle = async (acc) => {
    try {
      await api.put(`/mobile-banking-accounts/${acc.id}`, { ...acc, is_active: !acc.is_active })
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, is_active: !a.is_active } : a))
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mobile Banking Accounts</CardTitle>
            <CardDescription>Payment accounts shown to customers at checkout</CardDescription>
          </div>
          {!showForm && (
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>
              Add Account
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Add / Edit form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <p className="text-sm font-semibold text-gray-800">{editingId ? 'Edit Account' : 'New Account'}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Provider */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Provider</label>
              <select
                value={form.provider}
                onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Account name */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Account Name</label>
              <input
                type="text"
                value={form.account_name}
                onChange={e => setForm(p => ({ ...p, account_name: e.target.value }))}
                placeholder="e.g. Shop bKash"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Account number */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Account Number</label>
              <input
                type="text"
                value={form.account_number}
                onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="rounded text-blue-600"
              />
              Active (visible to customers)
            </label>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} loading={saving} icon={<Check size={13} />}>
              {editingId ? 'Update' : 'Add Account'}
            </Button>
            <Button size="sm" variant="secondary" onClick={resetForm} icon={<X size={13} />}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Accounts list */}
      {loading ? (
        <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : accounts.length === 0 ? (
        <div className="py-10 text-center">
          <CreditCard size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No accounts yet. Add bKash, Nagad, or Rocket accounts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(acc => (
            <div key={acc.id} className={cn(
              'flex items-center justify-between p-4 rounded-xl border',
              acc.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
            )}>
              <div className="flex items-center gap-3">
                <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', PROVIDER_COLORS[acc.provider] || PROVIDER_COLORS.other)}>
                  {PROVIDER_LABELS[acc.provider] || acc.provider}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{acc.account_number}</p>
                  <p className="text-xs text-gray-500">{acc.account_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(acc)}
                  className={cn('p-1.5 rounded-lg transition-colors', acc.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100')}
                  title={acc.is_active ? 'Deactivate' : 'Activate'}
                >
                  {acc.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
                <button
                  onClick={() => handleEdit(acc)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Only active accounts are shown to customers at checkout. Add your real bKash/Nagad/Rocket merchant numbers here.
      </p>
    </Card>
  )
}

function BankAccountsTab() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '', branch: '', is_active: true })

  const fetchAccounts = () => {
    setLoading(true)
    api.get('/bank-accounts')
      .then(res => setAccounts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAccounts() }, [])

  const resetForm = () => {
    setForm({ bank_name: '', account_name: '', account_number: '', branch: '', is_active: true })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (acc) => {
    setForm({ bank_name: acc.bank_name, account_name: acc.account_name, account_number: acc.account_number, branch: acc.branch || '', is_active: acc.is_active })
    setEditingId(acc.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.bank_name.trim() || !form.account_name.trim() || !form.account_number.trim()) {
      toast.error('Bank name, account name and number are required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/bank-accounts/${editingId}`, form)
        toast.success('Bank account updated!')
      } else {
        await api.post('/bank-accounts', form)
        toast.success('Bank account added!')
      }
      fetchAccounts()
      resetForm()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Remove this bank account?',
      text: 'This bank account will be removed from checkout.',
      confirmButtonText: 'Yes, remove it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/bank-accounts/${id}`)
      setAccounts(prev => prev.filter(a => a.id !== id))
      successAlert({ title: 'Removed!', text: 'Bank account has been removed.' })
    } catch {
      toast.error('Failed to remove')
    }
  }

  const handleToggle = async (acc) => {
    try {
      await api.put(`/bank-accounts/${acc.id}`, { ...acc, is_active: !acc.is_active })
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, is_active: !a.is_active } : a))
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bank Accounts</CardTitle>
            <CardDescription>Bank accounts shown to customers at checkout</CardDescription>
          </div>
          {!showForm && (
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>
              Add Account
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Add / Edit form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <p className="text-sm font-semibold text-gray-800">{editingId ? 'Edit Bank Account' : 'New Bank Account'}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bank name */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Bank Name</label>
              <input
                type="text"
                value={form.bank_name}
                onChange={e => setForm(p => ({ ...p, bank_name: e.target.value }))}
                placeholder="e.g. Dutch-Bangla Bank"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Account name */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Account Name</label>
              <input
                type="text"
                value={form.account_name}
                onChange={e => setForm(p => ({ ...p, account_name: e.target.value }))}
                placeholder="e.g. Shop Account"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Account number */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Account Number</label>
              <input
                type="text"
                value={form.account_number}
                onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))}
                placeholder="e.g. 1234567890"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Branch (Optional)</label>
              <input
                type="text"
                value={form.branch}
                onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                placeholder="e.g. Dhaka Main Branch"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="rounded text-blue-600"
              />
              Active (visible to customers)
            </label>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} loading={saving} icon={<Check size={13} />}>
              {editingId ? 'Update' : 'Add Account'}
            </Button>
            <Button size="sm" variant="secondary" onClick={resetForm} icon={<X size={13} />}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Accounts list */}
      {loading ? (
        <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : accounts.length === 0 ? (
        <div className="py-10 text-center">
          <Building2 size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No bank accounts yet. Add your bank account details.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(acc => (
            <div key={acc.id} className={cn(
              'flex items-center justify-between p-4 rounded-xl border',
              acc.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building2 size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{acc.bank_name}</p>
                  <p className="text-xs text-gray-500">{acc.account_name} • {acc.account_number}</p>
                  {acc.branch && <p className="text-xs text-gray-400">{acc.branch}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(acc)}
                  className={cn('p-1.5 rounded-lg transition-colors', acc.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100')}
                  title={acc.is_active ? 'Deactivate' : 'Activate'}
                >
                  {acc.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
                <button
                  onClick={() => handleEdit(acc)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Only active accounts are shown to customers at checkout. Add your real bank account details here.
      </p>
    </Card>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab]   = useState('general')
  const [grouped, setGrouped]       = useState({})
  const [values, setValues]         = useState({})
  const [previews, setPreviews]     = useState({})
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [uploadingKey, setUploadingKey] = useState(null)
  const [saved, setSaved]           = useState(false)

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/site-settings')
      .then(res => {
        setGrouped(res.data)
        // flatten into values map
        const flat = {}
        Object.values(res.data).forEach(group =>
          group.forEach(s => { flat[s.key] = s.value ?? '' })
        )
        setValues(flat)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── helpers ────────────────────────────────────────────────────────────────
  const currentGroup = grouped[activeTab] || []

  const handleChange = (key, val) =>
    setValues(prev => ({ ...prev, [key]: val }))

  // ── save text/color/boolean settings ──────────────────────────────────────
  const handleSave = async () => {
    // Don't save on mobile_banking or bank_accounts tabs (they have their own save)
    if (activeTab === 'mobile_banking' || activeTab === 'bank_accounts') {
      return
    }

    setSaving(true)
    try {
      // only send non-image settings for the current tab
      const payload = {}
      currentGroup
        .filter(s => s.type !== 'image')
        .forEach(s => { payload[s.key] = values[s.key] })

      await api.post('/site-settings', { settings: payload })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // ── image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (key, file) => {
    if (!file) return
    // Removed file size limit - backend will handle compression

    setUploadingKey(key)
    const formData = new FormData()
    formData.append('key', key)
    formData.append('image', file)

    try {
      const res = await api.post('/site-settings/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setValues(prev => ({ ...prev, [key]: res.data.path }))
      setPreviews(prev => ({ ...prev, [key]: res.data.url }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingKey(null)
    }
  }

  const handleImageDelete = async (key) => {
    try {
      await api.post('/site-settings/delete-image', { key })
      setValues(prev => ({ ...prev, [key]: '' }))
      setPreviews(prev => ({ ...prev, [key]: null }))
      toast.success('Image removed')
    } catch {
      toast.error('Failed to remove image')
    }
  }

  const getImageUrl = (key) => {
    if (previews[key]) return previews[key]
    if (values[key])   return `/storage/${values[key]}`
    return null
  }

  // ── render a single field ──────────────────────────────────────────────────
  const renderField = (setting) => {
    const { key, type, label, description } = setting
    const val = values[key] ?? ''

    if (type === 'image') {
      const url = getImageUrl(key)
      const isUploading = uploadingKey === key
      return (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {description && <p className="text-xs text-gray-400">{description}</p>}

          <div className="flex items-start gap-4 mt-1">
            {/* Preview */}
            <div className={cn(
              'shrink-0 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden',
              key === 'favicon' ? 'w-16 h-16' : 'w-32 h-20'
            )}>
              {url ? (
                <img src={url} alt={label} className="w-full h-full object-contain p-1" />
              ) : (
                <Image size={24} className="text-gray-300" />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <label className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border cursor-pointer transition-colors',
                isUploading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
              )}>
                {isUploading
                  ? <><span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  : <><Upload size={14} /> {url ? 'Change Image' : 'Upload Image'}</>
                }
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  disabled={isUploading}
                  onChange={e => handleImageUpload(key, e.target.files[0])}
                />
              </label>
              {url && (
                <button
                  onClick={() => handleImageDelete(key)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
              <p className="text-xs text-gray-400">PNG, JPG, SVG · Any size (auto-compressed)</p>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'textarea') {
      return (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {description && <p className="text-xs text-gray-400">{description}</p>}
          <textarea
            rows={3}
            value={val}
            onChange={e => handleChange(key, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
          />
        </div>
      )
    }

    if (type === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => handleChange(key, val === '1' ? '0' : '1')}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              val === '1' ? 'bg-blue-600' : 'bg-gray-200'
            )}
          >
            <span className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
              val === '1' ? 'translate-x-5' : 'translate-x-0'
            )} />
          </button>
        </div>
      )
    }

    if (type === 'color') {
      return (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {description && <p className="text-xs text-gray-400">{description}</p>}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={val || '#3b82f6'}
              onChange={e => handleChange(key, e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={val}
              onChange={e => handleChange(key, e.target.value)}
              placeholder="#3b82f6"
              className="w-36 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div
              className="w-10 h-10 rounded-lg border border-gray-200 shadow-inner"
              style={{ backgroundColor: val || '#3b82f6' }}
            />
          </div>
        </div>
      )
    }

    if (type === 'number') {
      return (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {description && <p className="text-xs text-gray-400">{description}</p>}
          <input
            type="number"
            value={val}
            onChange={e => handleChange(key, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      )
    }

    if (type === 'select') {
      // Import transition options for hero carousel
      const options = key === 'hero_carousel_transition' 
        ? [
            { value: 'slide', label: 'Slide' },
            { value: 'fade', label: 'Fade' },
            { value: 'zoom', label: 'Zoom In' },
            { value: 'zoomOut', label: 'Zoom Out' },
            { value: 'slideUp', label: 'Slide Up' },
            { value: 'slideDown', label: 'Slide Down' },
            { value: 'flip', label: 'Flip' },
            { value: 'rotate', label: 'Rotate' },
            { value: 'blur', label: 'Blur' },
            { value: 'scale', label: 'Scale Bounce' },
            { value: 'kenburns', label: 'Ken Burns' },
            { value: 'crossfade', label: 'Cross Fade' },
          ]
        : []

      return (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {description && <p className="text-xs text-gray-400">{description}</p>}
          <select
            value={val}
            onChange={e => handleChange(key, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )
    }

    // default: text
    return (
      <Input
        key={key}
        label={label}
        hint={description}
        value={val}
        onChange={e => handleChange(key, e.target.value)}
      />
    )
  }

  // ── main render ────────────────────────────────────────────────────────────
  if (loading) return <PageLoader />

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your shop's appearance and information</p>
        </div>
        {activeTab !== 'mobile_banking' && activeTab !== 'bank_accounts' && (
          <Button
            onClick={handleSave}
            loading={saving}
            icon={saved ? <CheckCircle size={16} /> : <Save size={16} />}
            className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <aside className="lg:w-52 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-0',
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <tab.icon size={16} className="shrink-0" />
                <div>
                  <p className={cn('text-sm font-medium', activeTab === tab.id ? 'text-blue-700' : 'text-gray-800')}>
                    {tab.label}
                  </p>
                  <p className="text-xs text-gray-400 leading-tight">{tab.description}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Fields */}
        <div className="flex-1">
          {activeTab === 'mobile_banking' ? (
            <MobileBankingTab />
          ) : activeTab === 'bank_accounts' ? (
            <BankAccountsTab />
          ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{TABS.find(t => t.id === activeTab)?.label} Settings</CardTitle>
                <CardDescription>{TABS.find(t => t.id === activeTab)?.description}</CardDescription>
              </div>
            </CardHeader>

            {currentGroup.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No settings in this group.</p>
            ) : (
              <div className="space-y-6">
                {currentGroup
                  // Hide the old single hero_background_image — replaced by the carousel section below
                  // Hide hero visibility keys — rendered in their own dedicated section below
                  .filter(s => s.key !== 'hero_background_image')
                  .filter(s => !['hero_show_title', 'hero_show_search', 'hero_show_buttons'].includes(s.key))
                  .map(setting => renderField(setting))}

                {/* Hero Content Visibility — shown only on homepage tab */}
                {activeTab === 'homepage' && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-800">Hero Content Visibility</p>
                      <p className="text-xs text-gray-400 mt-0.5">Control which elements are shown on the hero section of the homepage.</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { key: 'hero_show_title',   icon: '✏️', label: 'Title & Subtitle',  desc: 'The main heading and subtitle text' },
                        { key: 'hero_show_search',  icon: '🔍', label: 'Search Bar',         desc: 'The product search input field' },
                        { key: 'hero_show_buttons', icon: '🛍️', label: 'Shop Now Button',    desc: 'The Shop Now call-to-action button' },
                      ].map(({ key, icon, label, desc }) => {
                        const val = values[key] ?? '1'
                        const isOn = val === '1'
                        return (
                          <div key={key} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="text-lg leading-none">{icon}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-700">{label}</p>
                                <p className="text-xs text-gray-400">{desc}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleChange(key, isOn ? '0' : '1')}
                              className={cn(
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                isOn ? 'bg-blue-600' : 'bg-gray-200'
                              )}
                              title={isOn ? `Hide ${label}` : `Show ${label}`}
                            >
                              <span className={cn(
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
                                isOn ? 'translate-x-5' : 'translate-x-0'
                              )} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Hero carousel images — shown only on homepage tab */}
                {activeTab === 'homepage' && (
                  <div className="pt-4 border-t border-gray-100">
                    <HeroImagesSection />
                  </div>
                )}
              </div>
            )}

            {/* Save button inside card too - only show for non-account tabs */}
            {activeTab !== 'mobile_banking' && activeTab !== 'bank_accounts' && (
              <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end">
                <Button
                  onClick={handleSave}
                  loading={saving}
                  icon={saved ? <CheckCircle size={16} /> : <Save size={16} />}
                  className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            )}
          </Card>
          )}
        </div>
      </div>
    </div>
  )
}
