import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../lib/axios'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { confirmDelete, successAlert } from '../../lib/sweetalert'

const ALL_PERMISSIONS = [
  'view_dashboard', 'view_products', 'create_products', 'edit_products', 'delete_products',
  'view_sales', 'create_sales', 'view_reports', 'view_expenses', 'create_expenses', 'edit_expenses', 'delete_expenses',
  'view_bookings', 'manage_bookings', 'verify_payments', 'view_customers', 'view_users', 'manage_users',
  'view_roles', 'manage_roles', 'view_announcements', 'manage_announcements', 'manage_themes', 'manage_settings',
]

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await api.get('/roles')
      setRoles(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRoles() }, [])

  const openModal = (role = null) => {
    setEditingRole(role)
    reset(role ? { name: role.name, description: role.description || '' } : {})
    setSelectedPermissions(role?.permissions?.map(p => p.name) || [])
    setModalOpen(true)
  }

  const togglePermission = (perm) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = { ...data, permissions: selectedPermissions }
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, payload)
        toast.success('Role updated')
      } else {
        await api.post('/roles', payload)
        toast.success('Role created')
      }
      setModalOpen(false)
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Delete this role?',
      text: 'Users with this role will lose their permissions.',
      confirmButtonText: 'Yes, delete it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/roles/${id}`)
      successAlert({ title: 'Deleted!', text: 'Role has been deleted.' })
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete role')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user roles and access control</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => openModal()}>Add Role</Button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <Card key={role.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{role.name}</p>
                    <p className="text-xs text-gray-500">{role.permissions?.length || 0} permissions</p>
                  </div>
                </div>
                {!['admin', 'customer'].includes(role.name) && (
                  <div className="flex gap-1">
                    <button onClick={() => openModal(role)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(role.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              {role.description && <p className="text-xs text-gray-500 mb-3">{role.description}</p>}
              <div className="flex flex-wrap gap-1">
                {role.permissions?.slice(0, 5).map(p => (
                  <Badge key={p.id} variant="default" className="text-xs">{p.name.replace(/_/g, ' ')}</Badge>
                ))}
                {role.permissions?.length > 5 && (
                  <Badge variant="default" className="text-xs">+{role.permissions.length - 5} more</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingRole ? 'Edit Role' : 'Create Role'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Save Role</Button></>}>
        <form className="space-y-4">
          <Input label="Role Name" required error={errors.name?.message} {...register('name', { required: 'Role name is required' })} />
          <Input label="Description" {...register('description')} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Permissions</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{perm.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
