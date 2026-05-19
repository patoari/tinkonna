import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingDown, TrendingUp, Users, AlertCircle, Calendar, Phone, Edit2, Trash2, ArrowDownCircle, ArrowUpCircle, HandCoins, Wallet } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { PageLoader } from '../../components/ui/Spinner'
import { cn } from '../../lib/utils'
import { confirmDelete, successAlert } from '../../lib/sweetalert'

export default function OwnerTransactions() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [activeLoans, setActiveLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // all, withdrawals, loans, deposits
  const [showRepaymentModal, setShowRepaymentModal] = useState(null)

  const [form, setForm] = useState({
    type: 'withdrawal',
    amount: '',
    payment_source: 'shop_cash',
    recipient_name: '',
    recipient_phone: '',
    purpose: '',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
  })

  const [repaymentForm, setRepaymentForm] = useState({
    amount: '',
    payment_source: 'shop_cash',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = activeTab !== 'all' ? { type: activeTab.slice(0, -1) } : {}
      const [transRes, summaryRes, loansRes] = await Promise.all([
        api.get('/owner-transactions', { params }),
        api.get('/owner-transactions/summary'),
        api.get('/owner-transactions/active-loans'),
      ])
      setTransactions(transRes.data.data || [])
      setSummary(summaryRes.data)
      setActiveLoans(loansRes.data || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      if (editingId) {
        await api.put(`/owner-transactions/${editingId}`, form)
        toast.success('Transaction updated!')
      } else {
        await api.post('/owner-transactions', form)
        toast.success('Transaction recorded!')
      }
      fetchData()
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save')
    }
  }

  const handleRepayment = async (e) => {
    e.preventDefault()
    if (!repaymentForm.amount || parseFloat(repaymentForm.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      await api.post(`/owner-transactions/${showRepaymentModal.id}/repayment`, repaymentForm)
      toast.success('Repayment recorded!')
      setShowRepaymentModal(null)
      setRepaymentForm({ amount: '', payment_source: 'shop_cash', transaction_date: new Date().toISOString().split('T')[0], notes: '' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record repayment')
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Delete this transaction?',
      text: 'This transaction record will be permanently deleted.',
      confirmButtonText: 'Yes, delete it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/owner-transactions/${id}`)
      successAlert({ title: 'Deleted!', text: 'Transaction has been deleted.' })
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleEdit = (transaction) => {
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      payment_source: transaction.payment_source || 'shop_cash',
      recipient_name: transaction.recipient_name || '',
      recipient_phone: transaction.recipient_phone || '',
      purpose: transaction.purpose || '',
      notes: transaction.notes || '',
      transaction_date: transaction.transaction_date,
      expected_return_date: transaction.expected_return_date || '',
    })
    setEditingId(transaction.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setForm({
      type: 'withdrawal',
      amount: '',
      payment_source: 'shop_cash',
      recipient_name: '',
      recipient_phone: '',
      purpose: '',
      notes: '',
      transaction_date: new Date().toISOString().split('T')[0],
      expected_return_date: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'withdrawal': return <ArrowDownCircle className="text-red-500" size={18} />
      case 'deposit': return <ArrowUpCircle className="text-green-500" size={18} />
      case 'loan': return <HandCoins className="text-blue-500" size={18} />
      case 'loan_repayment': return <Wallet className="text-purple-500" size={18} />
      default: return <DollarSign size={18} />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'withdrawal': return 'Withdrawal'
      case 'deposit': return 'Deposit'
      case 'loan': return 'Loan Given'
      case 'loan_repayment': return 'Loan Repayment'
      default: return type
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      partial: 'bg-blue-100 text-blue-700',
      overdue: 'bg-red-100 text-red-700',
    }
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Cash Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track personal withdrawals, loans, and deposits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Transaction
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Withdrawals</p>
              <TrendingDown className="text-red-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.withdrawals)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Deposits</p>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.deposits)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Outstanding Loans</p>
              <Users className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.outstanding_loans)}</p>
            {summary.overdue_loans_count > 0 && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {summary.overdue_loans_count} overdue
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Net Cash Flow</p>
              <DollarSign className={summary.net_cash_flow >= 0 ? 'text-green-500' : 'text-red-500'} size={20} />
            </div>
            <p className={cn('text-2xl font-bold', summary.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatCurrency(summary.net_cash_flow)}
            </p>
          </div>
        </div>
      )}

      {/* Active Loans Section */}
      {activeLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HandCoins size={20} className="text-blue-500" />
            Active Loans ({activeLoans.length})
          </h2>
          <div className="space-y-3">
            {activeLoans.map(loan => (
              <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-900">{loan.recipient_name}</p>
                    {loan.is_overdue && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                        <AlertCircle size={12} />
                        Overdue
                      </span>
                    )}
                    {getStatusBadge(loan.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {loan.recipient_phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {loan.recipient_phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Due: {new Date(loan.expected_return_date).toLocaleDateString()}
                    </span>
                  </div>
                  {loan.purpose && <p className="text-xs text-gray-400 mt-1">{loan.purpose}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.remaining_amount)}</p>
                  <p className="text-xs text-gray-500">of {formatCurrency(loan.amount)}</p>
                  <button
                    onClick={() => setShowRepaymentModal(loan)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Record Repayment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Transactions' },
          { key: 'withdrawals', label: 'Withdrawals' },
          { key: 'loans', label: 'Loans' },
          { key: 'deposits', label: 'Deposits' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map(transaction => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getTypeIcon(transaction.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{getTypeLabel(transaction.type)}</p>
                        {transaction.status && transaction.type === 'loan' && getStatusBadge(transaction.status)}
                      </div>
                      {transaction.recipient_name && (
                        <p className="text-sm text-gray-600 mb-1">{transaction.recipient_name}</p>
                      )}
                      {transaction.purpose && (
                        <p className="text-sm text-gray-500 mb-1">{transaction.purpose}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                        {transaction.expected_return_date && (
                          <span>Expected: {new Date(transaction.expected_return_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={cn(
                      'text-lg font-bold',
                      transaction.type === 'withdrawal' || transaction.type === 'loan' ? 'text-red-600' : 'text-green-600'
                    )}>
                      {transaction.type === 'withdrawal' || transaction.type === 'loan' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Transaction' : 'New Transaction'}
              </h2>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form onSubmit={handleSubmit} className="space-y-3" id="transaction-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="withdrawal">Withdrawal (Personal Use)</option>
                  <option value="loan">Loan (Lend Money)</option>
                  <option value="deposit">Deposit (Add Money)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Source *</label>
                <select
                  value={form.payment_source}
                  onChange={e => setForm({ ...form, payment_source: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="shop_cash">Shop Cash (Physical)</option>
                  <option value="online">Mobile Banking (Digital)</option>
                  <option value="bank">Bank</option>
                </select>
              </div>

              {form.type === 'loan' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={form.recipient_name}
                      onChange={e => setForm({ ...form, recipient_name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={form.recipient_phone}
                      onChange={e => setForm({ ...form, recipient_phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                    <input
                      type="date"
                      value={form.expected_return_date}
                      onChange={e => setForm({ ...form, expected_return_date: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose/Reason</label>
                <textarea
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date *</label>
                <input
                  type="date"
                  value={form.transaction_date}
                  onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                  rows={2}
                />
              </div>
              </form>
            </div>
            <div className="p-4 pt-3 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="transaction-form"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {showRepaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Record Loan Repayment</h2>
            <p className="text-sm text-gray-500 mb-4">
              {showRepaymentModal.recipient_name} - Remaining: {formatCurrency(showRepaymentModal.remaining_amount)}
            </p>
            <form onSubmit={handleRepayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  max={showRepaymentModal.remaining_amount}
                  value={repaymentForm.amount}
                  onChange={e => setRepaymentForm({ ...repaymentForm, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Source *</label>
                <select
                  value={repaymentForm.payment_source}
                  onChange={e => setRepaymentForm({ ...repaymentForm, payment_source: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="shop_cash">Shop Cash (Physical)</option>
                  <option value="online">Mobile Banking (Digital)</option>
                  <option value="bank">Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={repaymentForm.transaction_date}
                  onChange={e => setRepaymentForm({ ...repaymentForm, transaction_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={repaymentForm.notes}
                  onChange={e => setRepaymentForm({ ...repaymentForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRepaymentModal(null)
                    setRepaymentForm({ amount: '', payment_source: 'shop_cash', transaction_date: new Date().toISOString().split('T')[0], notes: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
