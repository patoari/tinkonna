import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Bell } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../lib/axios'
import { formatDate } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { confirmDelete, successAlert } from '../../lib/sweetalert'

const TYPES = [
  { value: 'joy_occasion', label: 'Joy Occasion' },
  { value: 'sorrow_occasion', label: 'Sorrow Occasion' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'general_message', label: 'General Message' },
]

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAnn, setEditingAnn] = useState(null)
  const [saving, setSaving] = useState(false)
  const [bannerFile, setBannerFile] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/announcements', { params: { page } })
      setAnnouncements(res.data.data)
      setMeta(res.data.meta)
    } catch {}
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const openModal = (ann = null) => {
    setEditingAnn(ann)
    setBannerFile(null)
    reset(ann ? {
      title: ann.title, content: ann.content, type: ann.type,
      display_start_date: ann.display_start_date, display_end_date: ann.display_end_date || '',
    } : { type: 'general_message', display_start_date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v) })
      if (bannerFile) formData.append('banner_image', bannerFile)

      if (editingAnn) {
        formData.append('_method', 'PUT')
        await api.post(`/announcements/${editingAnn.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Announcement updated')
      } else {
        await api.post('/announcements', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Announcement created')
      }
      setModalOpen(false)
      fetchAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleHide = async (ann) => {
    try {
      await api.post(`/announcements/${ann.id}/toggle-hide`)
      toast.success(ann.is_hidden ? 'Announcement shown' : 'Announcement hidden')
      fetchAnnouncements()
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Delete this announcement?',
      text: 'This announcement will be permanently deleted.',
      confirmButtonText: 'Yes, delete it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/announcements/${id}`)
      successAlert({ title: 'Deleted!', text: 'Announcement has been deleted.' })
      fetchAnnouncements()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const typeColors = {
    joy_occasion: 'warning', sorrow_occasion: 'default', achievement: 'success',
    promotional: 'danger', general_message: 'primary',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage public announcements and advertisements</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => openModal()}>New Announcement</Button>
      </div>

      <Card padding={false}>
        {loading ? <TableSkeleton /> : announcements.length === 0 ? (
          <EmptyState icon={<Bell size={28} />} title="No announcements" action={<Button icon={<Plus size={16} />} onClick={() => openModal()}>Create Announcement</Button>} />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Start Date</TableHeader>
                  <TableHeader>End Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {announcements.map(ann => (
                  <TableRow key={ann.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {ann.banner_url && <img src={ann.banner_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <p className="font-medium text-sm">{ann.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{ann.content}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={typeColors[ann.type] || 'default'}>{ann.type.replace(/_/g, ' ')}</Badge></TableCell>
                    <TableCell className="text-sm">{formatDate(ann.display_start_date)}</TableCell>
                    <TableCell className="text-sm">{ann.display_end_date ? formatDate(ann.display_end_date) : 'Indefinite'}</TableCell>
                    <TableCell><Badge status={ann.status} dot>{ann.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleHide(ann)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title={ann.is_hidden ? 'Show' : 'Hide'}>
                          {ann.is_hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button onClick={() => openModal(ann)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAnn ? 'Edit Announcement' : 'New Announcement'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Save</Button></>}>
        <form className="space-y-4">
          <Input label="Title" required error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Content <span className="text-red-500">*</span></label>
            <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('content', { required: true })} />
          </div>
          <Select label="Type" required {...register('type', { required: true })}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" required error={errors.display_start_date?.message}
              {...register('display_start_date', { required: 'Start date is required' })} />
            <Input label="End Date (optional)" type="date" {...register('display_end_date')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Banner Image (optional)</label>
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" onChange={e => setBannerFile(e.target.files[0])}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
