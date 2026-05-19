import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Upload, ImageOff, ArrowLeft } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import api from '../../lib/axios'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Toggle from '../../components/ui/Toggle'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import BarcodeStickerModal from '../../components/BarcodeStickerModal'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/Spinner'
import { useCategories } from '../../hooks/useCategories'

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { categories } = useCategories({ adminAll: true })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [featuredImageId, setFeaturedImageId] = useState(null)
  // Sticker modal state
  const [stickerModal, setStickerModal] = useState(false)
  const [createdProduct, setCreatedProduct] = useState(null)
  const [createdVariants, setCreatedVariants] = useState([])

  const { register, handleSubmit, watch, setValue, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      name_bn: '',
      category: 'shirts',
      description: '',
      description_bn: '',
      buying_price: '',
      has_fixed_price: true,
      selling_price: '',
      online_price: '',
      size_type: 'standard',
      is_active: true,
      variants: [{ size: 'M', quantity: 0 }],
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const hasFixedPrice = watch('has_fixed_price')
  const sizeType = watch('size_type')

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(res => {
          const p = res.data
          reset({
            name: p.name,
            name_bn: p.name_bn || '',
            category: p.category,
            description: p.description || '',
            description_bn: p.description_bn || '',
            buying_price: p.buying_price,
            has_fixed_price: p.has_fixed_price,
            selling_price: p.selling_price || '',
            online_price: p.online_price || '',
            size_type: p.size_type,
            is_active: p.is_active,
            variants: p.variants?.map(v => ({ id: v.id, size: v.size, quantity: v.quantity })) || [],
          })
          if (p.image_url) setImagePreview(p.image_url)
          setExistingImages(p.images || [])
          setFeaturedImageId(p.featured_image?.id || p.images?.[0]?.id || null)
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEdit, reset])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = []
    const previews = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each image must be less than 5MB')
        continue
      }
      validFiles.push(file)
      previews.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      })
    }

    if (validFiles.length === 0) return

    setNewImages(prev => [...prev, ...validFiles])
    setNewImagePreviews(prev => [...prev, ...previews])
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, val]) => {
        if (key === 'variants') return
        if (key === 'has_fixed_price' || key === 'is_active') {
          formData.append(key, val ? '1' : '0')
        } else if (val !== '' && val !== null && val !== undefined) {
          formData.append(key, val)
        }
      })

      data.variants.forEach((v, i) => {
        formData.append(`variants[${i}][size]`, v.size)
        formData.append(`variants[${i}][quantity]`, v.quantity)
        if (v.id) formData.append(`variants[${i}][id]`, v.id)
      })

      if (newImages.length > 0) {
        newImages.forEach((file) => {
          formData.append('images[]', file)
        })
      }

      if (removedImageIds.length > 0) {
        removedImageIds.forEach((idToRemove) => {
          formData.append('remove_image_ids[]', idToRemove)
        })
      }

      if (featuredImageId) {
        formData.append('featured_image_id', featuredImageId)
      }

      if (isEdit) {
        formData.append('_method', 'PUT')
        await api.post(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated successfully')
        navigate('/admin/products')
      } else {
        const res = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created successfully')
        // Show barcode sticker modal
        setCreatedProduct(res.data)
        setCreatedVariants(res.data.variants || [])
        setStickerModal(true)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isEdit ? 'Update product information' : 'Create a new product in your catalog'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Product Name (English)"
                    required
                    error={errors.name?.message}
                    {...register('name', { required: 'Name is required' })}
                  />
                  <Input
                    label="Product Name (Bangla)"
                    {...register('name_bn')}
                  />
                </div>
                <Select label="Category" required {...register('category', { required: true })}>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.icon ? c.icon + ' ' : ''}{c.name}</option>
                  ))}
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Description (English)</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      {...register('description')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Description (Bangla)</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      {...register('description_bn')}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <div className="space-y-4">
                <Input
                  label="Buying Price (৳)"
                  type="number"
                  step="0.01"
                  required
                  prefix="৳"
                  error={errors.buying_price?.message}
                  {...register('buying_price', { required: 'Buying price is required', min: { value: 0, message: 'Must be positive' } })}
                />
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Toggle
                    checked={hasFixedPrice}
                    onChange={val => setValue('has_fixed_price', val)}
                    label="Fixed Price"
                    description="Enable to set a fixed selling price. Disable for variable/negotiable pricing."
                  />
                </div>
                {hasFixedPrice && (
                  <Input
                    label="Selling Price (৳)"
                    type="number"
                    step="0.01"
                    required
                    prefix="৳"
                    error={errors.selling_price?.message}
                    {...register('selling_price', {
                      required: hasFixedPrice ? 'Selling price is required for fixed price products' : false,
                      min: { value: 0, message: 'Must be positive' }
                    })}
                  />
                )}
                {/* Online price — shown for variable-price products so they can still sell online */}
                {!hasFixedPrice && (
                  <div className="p-4 bg-blue-50 rounded-xl space-y-3 border border-blue-100">
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Online Store Price</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        This product has variable in-store pricing. Set a fixed price for the online storefront so customers can purchase it online. Leave empty to hide it from online purchase.
                      </p>
                    </div>
                    <Input
                      label="Online Selling Price (৳)"
                      type="number"
                      step="0.01"
                      prefix="৳"
                      placeholder="e.g. 850.00"
                      error={errors.online_price?.message}
                      {...register('online_price', {
                        min: { value: 0, message: 'Must be positive' }
                      })}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Sizes & Stock</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-3">Size Type</p>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="standard" {...register('size_type')} className="text-blue-600" />
                      <span className="text-sm text-gray-700">Standard (S/M/L/XL/XXL)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="measurement" {...register('size_type')} className="text-blue-600" />
                      <span className="text-sm text-gray-700">Measurement (inches)</span>
                    </label>
                  </div>
                </div>

                {sizeType === 'standard' && !isEdit && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Quick add standard sizes:</p>
                    <div className="flex flex-wrap gap-2">
                      {STANDARD_SIZES.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (!fields.find(f => f.size === size)) {
                              append({ size, quantity: 0 })
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                          + {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Input
                        placeholder={sizeType === 'standard' ? 'e.g. M' : 'e.g. 38'}
                        className="w-28"
                        {...register(`variants.${index}.size`, { required: true })}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        min="0"
                        className="w-24"
                        {...register(`variants.${index}.quantity`, { required: true, min: 0, valueAsNumber: true })}
                      />
                      <span className="text-xs text-gray-500 flex-1">
                        {sizeType === 'standard' ? 'Standard size' : 'Measurement in inches'}
                      </span>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => append({ size: '', quantity: 0 })}
                >
                  Add Size
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Image */}
            <Card>
              <CardHeader><CardTitle>Product Photos</CardTitle></CardHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {existingImages.map(image => (
                    <div key={image.id} className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
                      <img src={image.image_url} alt="Product" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setRemovedImageIds(prev => [...prev, image.id])
                          setExistingImages(prev => prev.filter(i => i.id !== image.id))
                          if (featuredImageId === image.id) {
                            setFeaturedImageId(existingImages.filter(i => i.id !== image.id)[0]?.id || newImagePreviews[0]?.id || null)
                          }
                        }}
                        className="absolute top-2 right-2 rounded-full bg-white/90 p-1 text-red-600 shadow-sm hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedImageId(image.id)}
                        className={`absolute left-2 bottom-2 rounded-full px-2 py-1 text-[11px] font-semibold ${featuredImageId === image.id ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700 hover:bg-blue-50'}`}
                      >
                        {featuredImageId === image.id ? 'Featured' : 'Set featured'}
                      </button>
                    </div>
                  ))}

                  {newImagePreviews.map((item) => (
                    <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
                      <img src={item.url} alt="New upload" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setNewImages(prev => prev.filter(file => file !== item.file))
                          setNewImagePreviews(prev => prev.filter(image => image.id !== item.id))
                        }}
                        className="absolute top-2 right-2 rounded-full bg-white/90 p-1 text-red-600 shadow-sm hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span className="absolute left-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-gray-700">New</span>
                    </div>
                  ))}

                  {(existingImages.length + newImagePreviews.length === 0) && (
                    <div
                      className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => document.getElementById('product-images').click()}
                    >
                      <div className="text-center p-4">
                        <ImageOff size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-500">Click to upload one or more photos</p>
                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP • Any size (auto-compressed)</p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  id="product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  multiple
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon={<Upload size={14} />}
                  onClick={() => document.getElementById('product-images').click()}
                >
                  Upload photos
                </Button>
                <p className="text-xs text-gray-500">
                  Select a featured photo to show in product listings and cards. The first uploaded image will be used by default.
                </p>
              </div>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader><CardTitle>Status</CardTitle></CardHeader>
              <Toggle
                checked={watch('is_active')}
                onChange={val => setValue('is_active', val)}
                label="Active"
                description="Product will be visible in catalog"
              />
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button type="submit" loading={saving} fullWidth>
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/admin/products')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>

    {/* Barcode Sticker Modal — shown after product creation */}
    <BarcodeStickerModal
      isOpen={stickerModal}
      onClose={() => { setStickerModal(false); navigate('/admin/products') }}
      product={createdProduct}
      variants={createdVariants}
    />
    </>
  )
}
