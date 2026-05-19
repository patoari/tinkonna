import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../lib/axios'
import { formatDate } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
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

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users', { params: { page } }),
        api.get('/roles'),
      ])
      setUsers(usersRes.data.data)
      setMeta(usersRes.data.meta)
      setRoles(rolesRes.data)
    } catch {}
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const openModal = (user = null) => {
    setEditingUser(user)
    reset(user ? { name: user.name, email: user.email || '', phone: user.phone || '', role: user.roles?.[0]?.name || '' } : {})
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    // Convert empty strings to null so backend nullable rules work correctly
    const payload = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
    }
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload)
        toast.success('User updated')
      } else {
        await api.post('/users', payload)
        toast.success('User created')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        toast.error(Array.isArray(first) ? first[0] : first)
      } else {
        toast.error(err.response?.data?.message || 'Failed to save user')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Delete this user?',
      text: 'This user account will be permanently deleted.',
      confirmButtonText: 'Yes, delete it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/users/${id}`)
      successAlert({ title: 'Deleted!', text: 'User has been deleted.' })
      fetchData()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff and admin accounts</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => openModal()}>Add User</Button>
      </div>

      <Card padding={false}>
        {loading ? <TableSkeleton /> : users.length === 0 ? (
          <EmptyState icon={<UsersIcon size={28} />} title="No users found" action={<Button icon={<Plus size={16} />} onClick={() => openModal()}>Add User</Button>} />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>User</TableHeader>
                  <TableHeader>Contact</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Joined</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.email && <p>{user.email}</p>}
                        {user.phone && <p className="text-gray-500">{user.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles?.map(r => <Badge key={r.id} variant="primary" className="mr-1">{r.name}</Badge>)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Badge status={user.is_active ? 'active' : 'cancelled'} dot>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openModal(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600">
                          <Edit size={15} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                            <Trash2 size={15} />
                          </button>
                        )}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'} size="sm"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Save</Button></>}>
        <form className="space-y-4">
          <Input label="Full Name" required error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          {!editingUser && (
            <Input label="Password" type="password" required error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
          )}
          <Select label="Role" required {...register('role', { required: true })}>
            <option value="">Select role</option>
            {roles.filter(r => r.name !== 'customer').map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </Select>
        </form>
      </Modal>
    </div>
  )
}
