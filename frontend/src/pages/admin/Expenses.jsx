import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../lib/axios'
import { formatCurrency, formatDate, getExpenseCategoryLabel } from '../../lib/utils'
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
import toast from 'react-hot-toast'
import { confirmDelete, successAlert } from '../../lib/sweetalert'

const CATEGORIES = [
  { value: 'staff_salary', label: 'Staff Salary' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'utility_bills', label: 'Utility Bills' },
  { value: 'shipping_cost', label: 'Shipping Cost' },
  { value: 'other', label: 'Other' },
]

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState(null)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const category = watch('category')

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const [expRes, summaryRes] = await Promise.all([
        api.get('/expenses', { params: { page, date: dateFilter || undefined } }),
        api.get('/reports/daily', { params: { date: dateFilter || new Date().toISOString().split('T')[0] } }),
      ])
      setExpenses(expRes.data.data)
      setMeta(expRes.data.meta)
      setSummary(summaryRes.data.summary)
    } catch (err) {
      console.error('Failed to fetch expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [page, dateFilter])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const openModal = (expense = null) => {
    setEditingExpense(expense)
    if (expense) {
      reset({
        category: expense.category,
        category_other: expense.category_other || '',
        amount: expense.amount,
        payment_source: expense.payment_source || 'shop_cash',
        description: expense.description || '',
        expense_date: expense.expense_date,
      })
    } else {
      reset({ category: 'breakfast', amount: '', payment_source: 'shop_cash', description: '', expense_date: dateFilter || new Date().toISOString().split('T')[0] })
    }
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, data)
        toast.success('Expense updated')
      } else {
        await api.post('/expenses', data)
        toast.success('Expense added')
      }
      setModalOpen(false)
      fetchExpenses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Delete this expense?',
      text: 'This expense record will be permanently deleted.',
      confirmButtonText: 'Yes, delete it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/expenses/${id}`)
      successAlert({ title: 'Deleted!', text: 'Expense has been deleted.' })
      fetchExpenses()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track daily expenses and cash flow</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => openModal()}>Add Expense</Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(summary.total_revenue), color: 'text-green-600' },
              { label: 'Total Expenses', value: formatCurrency(summary.total_expenses), color: 'text-red-600' },
              { label: 'Gross Profit', value: formatCurrency(summary.gross_profit), color: 'text-blue-600' },
              { label: 'Net Profit', value: formatCurrency(summary.net_profit), color: 'text-indigo-600' },
            ].map(item => (
              <Card key={item.label}>
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              </Card>
            ))}
          </div>

          {/* Cash Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-gray-500 font-medium">Shop Cash</p>
              <p className="text-xl font-bold mt-1 text-amber-600">{formatCurrency(summary.shop_cash)}</p>
              <p className="text-xs text-gray-400 mt-1">Physical cash in shop</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 font-medium">Mobile Banking</p>
              <p className="text-xl font-bold mt-1 text-emerald-600">{formatCurrency(summary.online_cash)}</p>
              <p className="text-xs text-gray-400 mt-1">Digital payments</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 font-medium">Bank</p>
              <p className="text-xl font-bold mt-1 text-blue-600">{formatCurrency(summary.bank_cash)}</p>
              <p className="text-xs text-gray-400 mt-1">Bank transfers</p>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <p className="text-xs text-gray-600 font-medium">Net Cash (Total)</p>
              <p className="text-2xl font-bold mt-1 text-blue-700">{formatCurrency(summary.net_cash)}</p>
              <p className="text-xs text-gray-500 mt-1">Shop + Mobile Banking + Bank</p>
            </Card>
          </div>
        </>
      )}

      {/* Filter */}
      <Card>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {dateFilter && <button onClick={() => setDateFilter('')} className="text-sm text-red-600">Clear</button>}
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {loading ? <TableSkeleton /> : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Added By</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <Badge variant="default">{getExpenseCategoryLabel(exp.category, exp.category_other)}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">{formatCurrency(exp.amount)}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{exp.description || '-'}</TableCell>
                    <TableCell>{formatDate(exp.expense_date)}</TableCell>
                    <TableCell className="text-sm">{exp.user?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openModal(exp)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select label="Category" required error={errors.category?.message} {...register('category', { required: true })}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          {category === 'other' && (
            <Input
              label="Specify Category"
              required
              error={errors.category_other?.message}
              {...register('category_other', { required: 'Please specify the category' })}
            />
          )}
          <Input
            label="Amount (৳)"
            type="number"
            step="0.01"
            min="0.01"
            required
            prefix="৳"
            error={errors.amount?.message}
            {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })}
          />
          <Select label="Payment Source" required error={errors.payment_source?.message} {...register('payment_source', { required: true })}>
            <option value="shop_cash">Shop Cash (Physical)</option>
            <option value="online">Mobile Banking (Digital)</option>
            <option value="bank">Bank</option>
          </Select>
          <Input
            label="Description"
            placeholder="Optional description"
            {...register('description')}
          />
          <Input
            label="Date"
            type="date"
            required
            error={errors.expense_date?.message}
            {...register('expense_date', { required: 'Date is required' })}
          />
        </form>
      </Modal>
    </div>
  )
}
