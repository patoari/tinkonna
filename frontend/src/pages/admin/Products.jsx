import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Tag, ImageOff, Printer } from 'lucide-react'
import api from '../../lib/axios'
import { formatCurrency, getCategoryLabel, debounce } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import { ProductsTableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import BarcodeStickerModal from '../../components/BarcodeStickerModal'
import toast from 'react-hot-toast'
import { confirmDelete, successAlert } from '../../lib/sweetalert'

const categories = ['', 'shirts', 'pants', 't-shirts', 'panjabi', 'accessories']

export default function Products() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [labelProduct, setLabelProduct] = useState(null) // product selected for label printing
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get('/products', {
      params: { search, category, page, per_page: 15, include_out_of_stock: true }
    }).then(res => {
      if (!cancelled) {
        setProducts(res.data.data)
        setMeta(res.data.meta)
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [search, category, page])

  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearch(val)
      setPage(1)
    }, 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: 'Delete this product?',
      text: 'This product and all its variants will be permanently deleted.',
      confirmButtonText: 'Yes, delete it'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/products/${id}`)
      successAlert({ title: 'Deleted!', text: 'Product has been deleted.' })
      // Re-trigger fetch by resetting page (causes useEffect to re-run)
      setPage(p => p)
      setSearch(s => s)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your product catalog</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/admin/products/new')}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or product ID..."
              onChange={e => debouncedSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1) }}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.slice(1).map(c => (
              <option key={c} value={c}>{getCategoryLabel(c)}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <ProductsTableSkeleton />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Tag size={28} />}
            title="No products found"
            description="Add your first product to get started"
            action={<Button icon={<Plus size={16} />} onClick={() => navigate('/admin/products/new')}>Add Product</Button>}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Buying Price</TableHeader>
                  <TableHeader>Selling Price</TableHeader>
                  <TableHeader>Sizes / Stock</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageOff size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          {product.name_bn && <p className="text-xs text-gray-500">{product.name_bn}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{product.base_product_id}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary">{getCategoryLabel(product.category)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(product.buying_price)}</TableCell>
                    <TableCell>
                      {product.has_fixed_price
                        ? <span className="font-medium text-green-700">{formatCurrency(product.selling_price)}</span>
                        : <span className="text-xs text-gray-500 italic">Variable</span>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.variants?.map(v => (
                          <span
                            key={v.id}
                            className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                              v.quantity > 0 ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-200 text-red-400 bg-red-50'
                            }`}
                          >
                            {v.size}: {v.quantity}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge status={product.is_active ? 'active' : 'cancelled'} dot>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setLabelProduct(product)}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
                          title="Print Labels"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
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
      {/* Label reprint modal */}
      <BarcodeStickerModal
        isOpen={!!labelProduct}
        onClose={() => setLabelProduct(null)}
        product={labelProduct}
        variants={labelProduct?.variants || []}
        title="Print Barcode Labels"
      />
    </div>
  )
}
