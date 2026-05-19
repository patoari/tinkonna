import { useState, useEffect, useCallback } from 'react'
import { Search, Users } from 'lucide-react'
import api from '../../lib/axios'
import { formatDate, formatCurrency, debounce } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/customers', { params: { page, search: search || undefined } })
      setCustomers(res.data.data)
      setMeta(res.data.meta)
    } catch {}
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const debouncedSearch = useCallback(
    debounce((val) => { setSearch(val); setPage(1) }, 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage customer accounts</p>
      </div>

      <Card>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search customers..." onChange={e => debouncedSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </Card>

      <Card padding={false}>
        {loading ? <TableSkeleton /> : customers.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="No customers found" />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Contact</TableHeader>
                  <TableHeader>Total Orders</TableHeader>
                  <TableHeader>Total Spent</TableHeader>
                  <TableHeader>Joined</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {customer.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.email && <p className="text-gray-700">{customer.email}</p>}
                        {customer.phone && <p className="text-gray-500">{customer.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{customer.sales_transactions_count || 0}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(customer.total_spent || 0)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(customer.created_at)}</TableCell>
                    <TableCell>
                      <Badge status={customer.is_active ? 'active' : 'cancelled'} dot>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  )
}
