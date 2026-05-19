import { forwardRef } from 'react'
import { formatDate, formatTime } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

const translations = {
  english: {
    receipt: 'SALES RECEIPT',
    date: 'Date',
    time: 'Time',
    receiptNo: 'Receipt No',
    item: 'Item',
    qty: 'Qty',
    price: 'Price',
    subtotal: 'Subtotal',
    discount: 'Discount',
    total: 'TOTAL',
    paymentMethod: 'Payment Source',
    thankYou: 'Thank you for shopping with us!',
    visitAgain: 'Please visit again',
    shopCash: 'Shop Cash',
    mobileBanking: 'Mobile Banking',
    bank: 'Bank',
  },
  bangla: {
    receipt: 'বিক্রয় রসিদ',
    date: 'তারিখ',
    time: 'সময়',
    receiptNo: 'রসিদ নং',
    item: 'পণ্য',
    qty: 'পরিমাণ',
    price: 'মূল্য',
    subtotal: 'উপমোট',
    discount: 'ছাড়',
    total: 'মোট',
    paymentMethod: 'পেমেন্ট সোর্স',
    thankYou: 'আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!',
    visitAgain: 'আবার আসবেন',
    shopCash: 'দোকানের নগদ',
    mobileBanking: 'মোবাইল ব্যাংকিং',
    bank: 'ব্যাংক',
  }
}

const styles = {
  container: {
    width: '58mm',
    padding: '5px 6px',
    fontFamily: "'Hind Siliguri', sans-serif",
    fontSize: '11px',
    color: '#000',
    backgroundColor: '#fff',
    position: 'relative',
  },
  watermark: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-35deg)',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.07,
    width: '50mm',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { position: 'relative', zIndex: 1 },
  center: { textAlign: 'center', marginBottom: '6px' },
  headerTitle: { fontSize: '15px', fontWeight: 'bold', letterSpacing: '1.5px' },
  subText: { fontSize: '9px', marginTop: '2px' },
  divider: { borderTop: '1px dashed #000', margin: '5px 0' },
  transactionInfo: { marginBottom: '6px', fontSize: '10px' },
  row: { display: 'flex', justifyContent: 'space-between' },
  detailText: { textTransform: 'capitalize' },
  discountRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '2px' },
  receiptNumber: { fontFamily: "'Noto Sans Bengali', sans-serif" },
  paymentValue: { textTransform: 'capitalize' },
  itemsHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold', marginBottom: '3px' },
  itemLabel: { flex: 2 },
  lineSeparator: { borderTop: '1px solid #000', marginBottom: '3px' },
  watermarkImage: { width: '44mm', objectFit: 'contain' },
  receiptLabel: { fontSize: '10px', fontWeight: 'bold' },
  itemColumn: { textAlign: 'center', width: '24px' },
  itemPrice: { textAlign: 'right', width: '40px' },
  itemSubtotal: { textAlign: 'right', width: '44px' },
  itemSize: { fontSize: '9px', color: '#555' },
  itemRow: { marginBottom: '3px', fontSize: '10px' },
  itemContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { flex: 2, paddingRight: '3px', lineHeight: 1.2 },
  totals: { fontSize: '10px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '3px' },
  footer: { textAlign: 'center', fontSize: '9px' },
  footerTitle: { fontWeight: 'bold', marginBottom: '2px' },
}

const SalesReceipt = forwardRef(function SalesReceipt({ transaction, language = 'english' }, ref) {
  const { settings } = useSiteSettings()

  if (!transaction) return null

  const t = translations[language] || translations.english
  const isBangla = language === 'bangla'

  // Dynamic values from site settings
  const shopName    = isBangla
    ? (settings.site_name_bn || settings.site_name || 'Shop')
    : (settings.site_name || 'Shop')
  const address     = settings.contact_address || ''
  const phone       = settings.contact_phone   || ''
  const thankYouMsg = settings.receipt_thank_you || t.thankYou
  const visitAgain  = settings.receipt_visit_again || t.visitAgain
  const logoUrl     = settings.site_logo_url || null

  return (
    <div ref={ref} className="receipt-text" style={styles.container}>
      {/* Watermark */}
      {logoUrl && (
        <div style={styles.watermark}>
          <img src={logoUrl} alt="" style={styles.watermarkImage} />
        </div>
      )}

      {/* All receipt content sits above watermark */}
      <div style={styles.content}>
      {/* Header */}
      <div style={styles.center}>
            <div style={styles.headerTitle}>
          {shopName.toUpperCase()}
        </div>
        {address && (
          <div style={styles.subText}>{address}</div>
        )}
        {phone && (
          <div style={styles.subText}>Tel: {phone}</div>
        )}
        <div style={styles.divider} />
        <div style={styles.receiptLabel}>{t.receipt}</div>
      </div>

      {/* Transaction Info */}
      <div style={styles.transactionInfo}>
            <div style={styles.row}>
          <span>{t.receiptNo}:</span>
          <span className="receipt-number" style={styles.receiptNumber}>
            {transaction.transaction_number}
          </span>
        </div>
            <div style={styles.row}>
          <span>{t.date}:</span>
          <span className="receipt-number">{formatDate(transaction.transaction_date)}</span>
        </div>
            <div style={styles.row}>
          <span>{t.time}:</span>
          <span className="receipt-number">{formatTime(transaction.transaction_date)}</span>
        </div>
            <div style={styles.row}>
          <span>{t.paymentMethod}:</span>
              <span style={styles.paymentValue}>
            {transaction.payment_source === 'shop_cash' ? t.shopCash : 
             transaction.payment_source === 'online' ? t.mobileBanking : 
             transaction.payment_source === 'bank' ? t.bank : 
             transaction.payment_source}
          </span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Items Header */}
      <div style={styles.itemsHeader}>
        <span style={styles.itemLabel}>{t.item}</span>
        <span style={styles.itemColumn}>{t.qty}</span>
        <span style={styles.itemPrice}>{t.price}</span>
        <span style={styles.itemSubtotal}>{t.subtotal}</span>
      </div>

      <div style={styles.lineSeparator} />

      {/* Items */}
      {transaction.items?.map((item, i) => (
        <div key={i} style={styles.itemRow}>
          <div style={styles.itemContent}>
            <span style={styles.itemName}>
              {isBangla && item.product_name_bn ? item.product_name_bn : item.product_name}
              <span style={styles.itemSize}> ({item.size})</span>
            </span>
            <span className="receipt-number" style={styles.itemColumn}>{item.quantity}</span>
            <span className="receipt-number" style={styles.itemPrice}>৳{Number(item.unit_price).toFixed(2)}</span>
            <span className="receipt-number" style={styles.itemSubtotal}>৳{Number(item.subtotal).toFixed(2)}</span>
          </div>
        </div>
      ))}

      <div style={styles.divider} />

      {/* Totals */}
      <div style={styles.totals}>
            {transaction.discount_amount > 0 && (
              <div style={styles.discountRow}>
            <span>{t.discount}:</span>
            <span className="receipt-number">-৳{Number(transaction.discount_amount).toFixed(2)}</span>
          </div>
        )}
        <div style={styles.totalRow}>
          <span>{t.total}:</span>
          <span className="receipt-number">৳{Number(transaction.net_amount).toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerTitle}>{thankYouMsg}</div>
        <div>{visitAgain}</div>
      </div>

      </div>{/* end z-index:1 content wrapper */}
    </div>
  )
})

export default SalesReceipt
