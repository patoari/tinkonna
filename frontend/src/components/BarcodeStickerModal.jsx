import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, CheckCircle, CheckSquare, Square } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function BarcodeStickerModal({ isOpen, onClose, product, variants, title }) {
  const previewRef = useRef()
  const { settings } = useSiteSettings()
  const shopName     = (settings.site_name || 'Shop').toUpperCase()
  const modalTitle   = title || 'Product Created!'
  const modalSubtitle = title
    ? 'Select stickers to print or print all'
    : 'Stickers auto-matched to stock quantity per size'

  // 'all' | 'selected'
  const [printMode, setPrintMode] = useState('all')
  // Set of sticker _keys that are checked
  const [selected, setSelected] = useState(new Set())

  // Each variant gets stickers equal to its quantity (min 1)
  const stickerList = variants?.flatMap(v =>
    Array.from({ length: Math.max(1, v.quantity || 1) }, (_, i) => ({
      ...v,
      _key: `${v.id}-${i}`,
    }))
  ) || []

  const totalStickers = stickerList.length

  // Reset selection when modal opens / variants change
  useEffect(() => {
    if (isOpen) {
      setPrintMode('all')
      setSelected(new Set())
    }
  }, [isOpen, variants])

  // Render preview barcodes
  useEffect(() => {
    if (!isOpen || !variants?.length) return
    const timer = setTimeout(() => {
      stickerList.forEach((sticker) => {
        const el = document.getElementById(`bsv-prev-${sticker._key}`)
        if (el && sticker.barcode) {
          try {
            JsBarcode(el, sticker.barcode, {
              format: 'CODE128',
              width: 1.5,
              height: 36,
              displayValue: true,
              fontSize: 9,
              margin: 2,
              background: '#ffffff',
              lineColor: '#000000',
            })
          } catch (e) {}
        }
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [isOpen, variants])

  const toggleSelect = (key) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const selectAll  = () => setSelected(new Set(stickerList.map(s => s._key)))
  const clearAll   = () => setSelected(new Set())
  const allChecked = selected.size === stickerList.length

  // Which stickers to actually print
  const printList = printMode === 'selected'
    ? stickerList.filter(s => selected.has(s._key))
    : stickerList

  const printCount = printList.length

  // ── Build print window ────────────────────────────────────────────────────
  const buildAndPrint = (list) => {
    if (!list.length) return

    const isFixed      = product?.has_fixed_price === true || product?.has_fixed_price === 1
    const sellingPrice = parseFloat(product?.selling_price) || 0

    const labelsHtml = list.map((sticker) => {
      const priceDisplay = isFixed && sellingPrice > 0
        ? `&#2547;${sellingPrice.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`
        : 'Variable Price'
      const priceBadge = isFixed && sellingPrice > 0
        ? `<span class="price-badge fixed">FIXED PRICE</span>`
        : `<span class="price-badge variable">VARIABLE PRICE</span>`

      return `
        <div class="label">
          <div class="shop-name">${shopName}</div>
          <div class="product-row">
            <span class="product-name">${product?.name || ''}${product?.name_bn ? ' / ' + product.name_bn : ''}</span>
            ${priceBadge}
          </div>
          <div class="size-price-row">
            <span class="size-text">Size: <strong>${sticker.size}</strong></span>
            <span class="price-text ${isFixed && sellingPrice > 0 ? 'price-fixed' : 'price-variable'}">${priceDisplay}</span>
          </div>
          <div class="barcode-wrap">
            <svg id="bc-${sticker._key}"></svg>
          </div>
          <div class="id-row">
            <span>${product?.base_product_id || ''}</span>
            <span>${sticker.product_variant_id || ''}</span>
          </div>
        </div>`
    }).join('')

    const barcodeData = JSON.stringify(
      list.reduce((acc, s) => { acc[`bc-${s._key}`] = s.barcode; return acc }, {})
    )

    const printWindow = window.open('', '_blank', 'width=700,height=500')
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Labels — ${shopName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; }
    .label {
      width: 100mm; height: 50mm;
      padding: 4mm 5mm 3mm;
      border: 1px solid #000;
      display: flex; flex-direction: column;
      justify-content: space-between;
      background: #fff; overflow: hidden;
    }
    .shop-name {
      text-align: center; font-size: 14pt; font-weight: 900;
      letter-spacing: 4px; border-bottom: 1.5px solid #000;
      padding-bottom: 2mm; margin-bottom: 1mm;
    }
    .product-row { display: flex; justify-content: space-between; align-items: center; font-size: 9pt; font-weight: 700; }
    .product-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 3mm; }
    .price-badge { font-size: 6pt; font-weight: 800; letter-spacing: 0.5px; padding: 1px 4px; border-radius: 2px; white-space: nowrap; text-transform: uppercase; }
    .price-badge.fixed    { background: #000; color: #fff; }
    .price-badge.variable { background: #fff; color: #000; border: 1px solid #000; }
    .size-price-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 9pt; font-weight: 700; }
    .size-text { font-size: 9pt; font-weight: 700; }
    .price-text { font-size: 11pt; font-weight: 900; white-space: nowrap; }
    .price-fixed    { color: #000; }
    .price-variable { font-size: 8pt; font-style: italic; color: #555; }
    .barcode-wrap { text-align: center; flex: 1; display: flex; align-items: center; justify-content: center; }
    .barcode-wrap svg { width: 100%; max-height: 18mm; }
    .id-row { display: flex; justify-content: space-between; font-size: 7pt; color: #333; border-top: 1px solid #ccc; padding-top: 1mm; margin-top: 1mm; }
    @media print {
      @page { size: 100mm 50mm; margin: 0; }
      body { margin: 0; background: #fff; }
      .label { width: 100mm; height: 50mm; border: none; page-break-after: always; break-after: page; }
      .label:last-child { page-break-after: avoid; break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="label-grid">${labelsHtml}</div>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
  <script>
    var data = ${barcodeData};
    function renderBarcodes() {
      Object.keys(data).forEach(function(id) {
        var el = document.getElementById(id);
        if (el && data[id]) {
          try { JsBarcode(el, data[id], { format:'CODE128', width:2, height:50, displayValue:true, fontSize:10, margin:2, background:'#ffffff', lineColor:'#000000' }); } catch(e) {}
        }
      });
    }
    if (typeof JsBarcode !== 'undefined') {
      renderBarcodes();
      setTimeout(function() { window.print(); window.close(); }, 500);
    } else {
      document.querySelector('script[src*="jsbarcode"]').addEventListener('load', function() {
        renderBarcodes();
        setTimeout(function() { window.print(); window.close(); }, 500);
      });
    }
  <\/script>
</body>
</html>`)
    printWindow.document.close()
  }

  if (!isOpen) return null

  const isFixed      = product?.has_fixed_price === true || product?.has_fixed_price === 1
  const sellingPrice = parseFloat(product?.selling_price) || 0
  const showPrice    = isFixed && sellingPrice > 0

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{modalTitle}</h2>
              <p className="text-xs text-gray-500">{modalSubtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Controls bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0 space-y-3">

          {/* Print mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-600">Print:</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setPrintMode('all')}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                  printMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                All ({totalStickers})
              </button>
              <button
                onClick={() => setPrintMode('selected')}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                  printMode === 'selected'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Selected ({selected.size})
              </button>
            </div>

            {/* Select all / clear when in selected mode */}
            {printMode === 'selected' && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={allChecked ? clearAll : selectAll}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {allChecked
                    ? <><Square size={13} /> Deselect All</>
                    : <><CheckSquare size={13} /> Select All</>
                  }
                </button>
              </div>
            )}
          </div>

          {/* Size summary chips */}
          <div className="flex flex-wrap gap-2">
            {variants?.map(v => (
              <div key={v.id} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-xs font-semibold text-gray-700">Size {v.size}</span>
                <span className="text-xs text-gray-400">→</span>
                <span className="text-xs font-bold text-blue-600">
                  {Math.max(1, v.quantity || 1)} sticker{Math.max(1, v.quantity || 1) !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {printMode === 'selected'
                ? selected.size === 0
                  ? <span className="text-amber-600 font-medium">No stickers selected</span>
                  : <><strong className="text-gray-800">{selected.size}</strong> of {totalStickers} stickers selected</>
                : <><strong className="text-gray-800">{totalStickers} stickers</strong> across {variants?.length} size{variants?.length !== 1 ? 's' : ''}</>
              }
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => buildAndPrint(printList)}
                disabled={printCount === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Printer size={15} />
                Print {printCount} Sticker{printCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Sticker preview grid */}
        <div className="flex-1 overflow-y-auto p-6" ref={previewRef}>
          <div className="flex flex-wrap gap-4">
            {stickerList.map((sticker) => {
              const isChecked = selected.has(sticker._key)
              return (
                <div
                  key={sticker._key}
                  onClick={() => printMode === 'selected' && toggleSelect(sticker._key)}
                  className={`min-w-[340px] border rounded-xl bg-white flex flex-col gap-1.5 p-3 transition duration-150 ${printMode === 'selected' ? 'cursor-pointer' : 'cursor-default'} ${printMode === 'selected' && isChecked ? 'border-blue-600 bg-blue-50' : printMode === 'selected' ? 'border-gray-300' : 'border-slate-900'}`}
                >
                  {/* Checkbox overlay in selected mode */}
                  {printMode === 'selected' && (
                    <div className="absolute top-2 right-2">
                      {isChecked
                        ? <CheckSquare size={18} color="#2563eb" />
                        : <Square size={18} color="#9ca3af" />
                      }
                    </div>
                  )}

                  {/* Shop name */}
                  <div className="text-center text-[13px] font-black tracking-[4px] border-b border-black pb-1 mb-0.5">
                    {shopName}
                  </div>

                  {/* Product name + price badge */}
                  <div className="flex justify-between items-center text-[10px] font-semibold">
                    <span className="flex-1 overflow-hidden whitespace-nowrap truncate pr-2">
                      {product?.name}{product?.name_bn ? ` / ${product.name_bn}` : ''}
                    </span>
                    {showPrice
                      ? <span className="text-[6px] font-black bg-black text-white px-1.5 py-[1px] rounded-sm tracking-[0.5px] uppercase">FIXED PRICE</span>
                      : <span className="text-[6px] font-black bg-white text-black border border-black px-1.5 py-[1px] rounded-sm tracking-[0.5px] uppercase">VARIABLE PRICE</span>
                    }
                  </div>

                  {/* Size + price */}
                  <div className="flex justify-between items-baseline text-[10px] font-semibold">
                    <span className="text-[11px]">Size: <span className="font-semibold">{sticker.size}</span></span>
                    {showPrice
                      ? <span className="text-[12px] font-black text-black">৳{sellingPrice.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                      : <span className="text-[8px] italic text-slate-500">Variable Price</span>
                    }
                  </div>

                  {/* Barcode */}
                  <div className="text-center my-0.5">
                    <svg id={`bsv-prev-${sticker._key}`} className="w-full" />
                  </div>

                  {/* IDs */}
                  <div className="flex justify-between text-[8px] text-slate-700 border-t border-slate-300 pt-1 mt-1">
                    <span>{product?.base_product_id}</span>
                    <span>{sticker.product_variant_id}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
