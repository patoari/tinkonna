import { forwardRef } from 'react'

/**
 * Print-ready barcode sticker sheet.
 * Renders one sticker per variant — 80mm × 40mm thermal label size.
 */
const BarcodeStickerPrint = forwardRef(function BarcodeStickerPrint({ product, variants }, ref) {
  if (!product || !variants?.length) return null

  return (
    <div ref={ref} style={{ fontFamily: "'Hind Siliguri', Arial, sans-serif" }}>
      {variants.map((variant) => (
        <div
          key={variant.id}
          style={{
            width: '80mm',
            minHeight: '40mm',
            padding: '4mm 5mm',
            marginBottom: '4mm',
            border: '1px solid #000',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            boxSizing: 'border-box',
            backgroundColor: '#fff',
          }}
        >
          {/* Shop name */}
          <div style={{ textAlign: 'center', fontSize: '9pt', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1mm' }}>
            GENTS SHOP
          </div>

          {/* Product name */}
          <div style={{ textAlign: 'center', fontSize: '8pt', fontWeight: '600', marginBottom: '1mm', lineHeight: 1.2 }}>
            {product.name}
            {product.name_bn ? ` / ${product.name_bn}` : ''}
          </div>

          {/* Size & Price row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', marginBottom: '2mm' }}>
            <span><strong>Size:</strong> {variant.size}</span>
            {product.has_fixed_price && product.selling_price
              ? <span><strong>৳{Number(product.selling_price).toLocaleString('en-BD', { minimumFractionDigits: 2 })}</strong></span>
              : <span style={{ fontStyle: 'italic', color: '#555' }}>Variable Price</span>
            }
          </div>

          {/* SVG Barcode */}
          <div style={{ textAlign: 'center', marginBottom: '1.5mm' }}>
            <svg id={`barcode-${variant.id}`} />
          </div>

          {/* IDs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6.5pt', color: '#333', marginTop: '1mm' }}>
            <span>Base: {product.base_product_id}</span>
            <span>Variant: {variant.product_variant_id}</span>
          </div>
        </div>
      ))}
    </div>
  )
})

export default BarcodeStickerPrint
