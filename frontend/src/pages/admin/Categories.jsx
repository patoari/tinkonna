import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, GripVertical, ImageOff, ToggleLeft, ToggleRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../lib/axios'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/ui/Spinner'
import { TableSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'
import { confirmDelete, successAlert } from '../../lib/sweetalert'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver]     = useState(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm()

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  // ── open modal ─────────────────────────────────────────────────────────────
  const openModal = (cat = null) => {
    setEditing(cat)
    setImageFile(null)
    setImagePreview(cat?.image_url || null)
    reset(cat ? {
      name:        cat.name,
      name_bn:     cat.name_bn || '',
      slug:        cat.slug,
      icon:        cat.icon || '',
      description: cat.description || '',
      sort_order:  cat.sort_order,
      is_active:   cat.is_active,
    } : {
      name: '', name_bn: '', slug: '', icon: '', description: '',
      sort_order: categories.length, is_active: true,
    })
    setModalOpen(true)
  }

  // ── auto-generate slug from name ───────────────────────────────────────────
  const nameVal = watch('name')
  useEffect(() => {
    if (!editing) {
      setValue('slug', nameVal?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '')
    }
  }, [nameVal, editing, setValue])

  // ── image pick ─────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Removed file size limit - backend will handle compression
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── save ───────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'is_active') {
          formData.append(k, v ? '1' : '0')
        } else if (k === 'sort_order') {
          // Always send a number — empty string fails backend integer validation
          formData.append(k, v === '' || v === null || v === undefined ? '0' : String(parseInt(v) || 0))
        } else if (v !== null && v !== undefined && v !== '') {
          formData.append(k, v)
        }
      })
      if (imageFile) formData.append('image', imageFile)

      if (editing) {
        formData.append('_method', 'PUT')
        await api.post(`/categories/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Category updated')
      } else {
        await api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Category created')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        // Show the first validation error message specifically
        const firstError = Object.values(errors)[0]?.[0]
        toast.error(firstError || 'Validation failed')
      } else {
        toast.error(err.response?.data?.message || 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── toggle active ──────────────────────────────────────────────────────────
  const handleToggle = async (cat) => {
    try {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      formData.append('name', cat.name)
      formData.append('is_active', cat.is_active ? '0' : '1')
      await api.post(`/categories/${cat.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
    } catch {
      toast.error('Failed to update')
    }
  }

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (cat) => {
    const result = await confirmDelete({
      title: `Delete "${cat.name}"?`,
      text: 'This category will be permanently deleted.',
      confirmButtonText: 'Yes, delete it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/categories/${cat.id}`)
      successAlert({ title: 'Deleted!', text: 'Category has been deleted.' })
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  // ── drag-to-reorder ────────────────────────────────────────────────────────
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index)
  }

  const handleDrop = async (e, dropIndex) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'))
    if (dragIndex === dropIndex) return

    const reordered = [...categories]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    setCategories(reordered)
    setDragOver(null)

    try {
      await api.post('/categories/reorder', { order: reordered.map(c => c.id) })
    } catch {
      toast.error('Failed to save order')
      fetchCategories()
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage product categories — drag to reorder</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => openModal()}>
          Add Category
        </Button>
      </div>

      {/* List */}
      <Card padding={false}>
        {loading ? <TableSkeleton /> : categories.length === 0 ? (
          <EmptyState
            icon={<Plus size={28} />}
            title="No categories yet"
            description="Add your first product category"
            action={<Button icon={<Plus size={16} />} onClick={() => openModal()}>Add Category</Button>}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-1" />
              <div className="col-span-1">Icon</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Slug</div>
              <div className="col-span-2">Products</div>
              <div className="col-span-1">Order</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {categories.map((cat, index) => (
              <div
                key={cat.id}
                draggable
                onDragStart={e => handleDragStart(e, index)}
                onDragOver={e => { e.preventDefault(); setDragOver(index) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => handleDrop(e, index)}
                className={cn(
                  'grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors',
                  dragOver === index ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                )}
              >
                {/* Drag handle */}
                <div className="col-span-1 cursor-grab text-gray-300 hover:text-gray-500">
                  <GripVertical size={16} />
                </div>

                {/* Icon / Image */}
                <div className="col-span-1">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {cat.icon || <ImageOff size={16} className="text-gray-300" />}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="col-span-3">
                  <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                  {cat.name_bn && <p className="text-xs text-gray-400">{cat.name_bn}</p>}
                </div>

                {/* Slug */}
                <div className="col-span-2">
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{cat.slug}</code>
                </div>

                {/* Products count */}
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">{cat.products_count ?? 0} products</span>
                </div>

                {/* Sort order */}
                <div className="col-span-1">
                  <span className="text-sm text-gray-500">{cat.sort_order}</span>
                </div>

                {/* Status toggle */}
                <div className="col-span-1">
                  <button onClick={() => handleToggle(cat)} className="focus:outline-none">
                    {cat.is_active
                      ? <ToggleRight size={24} className="text-blue-600" />
                      : <ToggleLeft size={24} className="text-gray-300" />
                    }
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openModal(cat)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit: ${editing.name}` : 'Add New Category'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>
              {editing ? 'Update' : 'Create'} Category
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category Name (English)"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Category Name (Bangla)"
              placeholder="বাংলা নাম"
              {...register('name_bn')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Slug"
              hint="Auto-generated from name"
              error={errors.slug?.message}
              {...register('slug')}
            />
            <Input
              label="Icon (emoji)"
              placeholder="e.g. 👔"
              hint="Paste any emoji"
              {...register('icon')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea
              rows={2}
              placeholder="Optional description..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort Order"
              type="number"
              min="0"
              hint="Lower = appears first"
              {...register('sort_order', { valueAsNumber: true })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setValue('is_active', !watch('is_active'))}
                  className={cn(
                    'relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                    watch('is_active') ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                >
                  <span className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200',
                    watch('is_active') ? 'translate-x-5' : 'translate-x-0'
                  )} />
                </button>
                <span className="text-sm text-gray-600">{watch('is_active') ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Category Image <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  : <ImageOff size={20} className="text-gray-300" />
                }
              </div>
              <div>
                <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Plus size={14} />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WebP · Any size (auto-compressed)</p>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
