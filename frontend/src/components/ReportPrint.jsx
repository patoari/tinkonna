import { forwardRef } from 'react'
import { formatCurrency, formatDate } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

const translations = {
  english: {
    daily:            'Daily Sales Report',
    weekly:           'Weekly Sales Report',
    monthly:          'Monthly Sales Report',
    yearly:           'Yearly Sales Report',
    cashflow:         'Cash Flow Report',
    custom:           'Sales Report',
    period:           'Period',
    totalRevenue:     'Total Revenue',
    totalCogs:        'Cost of Goods Sold',
    grossProfit:      'Gross Profit',
    totalExpenses:    'Total Expenses',
    netProfit:        'Net Profit',
    cashOnHand:       'Cash on Hand',
    transactions:     'Total Transactions',
    expenseBreakdown: 'Expense Breakdown',
    topProducts:      'Top Selling Products',
    dailyBreakdown:   'Daily Breakdown',
    monthlyBreakdown: 'Monthly Breakdown',
    date:             'Date',
    month:            'Month',
    txnCount:         'Txn',
    revenue:          'Revenue',
    expenses:         'Expenses',
    category:         'Category',
    amount:           'Amount',
    product:          'Product',
    units:            'Units',
    summary:          'Summary',
    generatedOn:      'Generated on',
    shopCash:         'Shop Cash',
    mobileBanking:    'Mobile Banking',
    bank:             'Bank',
    netCash:          'Net Cash',
    ownerCashManagement: 'Owner Cash Management',
    withdrawal:       'Withdrawal',
    deposit:          'Deposit',
    loanGiven:        'Loan Given',
    loanRepayment:    'Loan Repayment',
  },
  bangla: {
    daily:            'দৈনিক বিক্রয় প্রতিবেদন',
    weekly:           'সাপ্তাহিক বিক্রয় প্রতিবেদন',
    monthly:          'মাসিক বিক্রয় প্রতিবেদন',
    yearly:           'বার্ষিক বিক্রয় প্রতিবেদন',
    cashflow:         'নগদ প্রবাহ প্রতিবেদন',
    custom:           'বিক্রয় প্রতিবেদন',
    period:           'সময়কাল',
    totalRevenue:     'মোট আয়',
    totalCogs:        'পণ্যের ক্রয় মূল্য',
    grossProfit:      'মোট মুনাফা',
    totalExpenses:    'মোট ব্যয়',
    netProfit:        'নিট মুনাফা',
    cashOnHand:       'হাতে নগদ',
    transactions:     'মোট লেনদেন',
    expenseBreakdown: 'ব্যয়ের বিবরণ',
    topProducts:      'সেরা বিক্রীত পণ্য',
    dailyBreakdown:   'দৈনিক বিবরণ',
    monthlyBreakdown: 'মাসিক বিবরণ',
    date:             'তারিখ',
    month:            'মাস',
    txnCount:         'লেনদেন',
    revenue:          'আয়',
    expenses:         'ব্যয়',
    category:         'বিভাগ',
    amount:           'পরিমাণ',
    product:          'পণ্য',
    units:            'একক',
    summary:          'সারসংক্ষেপ',
    generatedOn:      'তৈরি হয়েছে',
    shopCash:         'দোকানের নগদ',
    mobileBanking:    'মোবাইল ব্যাংকিং',
    bank:             'ব্যাংক',
    netCash:          'নিট নগদ',
    ownerCashManagement: 'মালিক নগদ ব্যবস্থাপনা',
    withdrawal:       'উত্তোলন',
    deposit:          'জমা',
    loanGiven:        'ঋণ প্রদান',
    loanRepayment:    'ঋণ পরিশোধ',
  },
}

// ── Shared styles ────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: '18mm 16mm',
    fontFamily: 'Arial, sans-serif',
    fontSize: '11px',
    color: '#000',
    backgroundColor: '#fff',
    width: '210mm',          // A4
    minHeight: '297mm',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: '8px',
    marginBottom: '14px',
  },
  shopName:   { fontSize: '18px', fontWeight: '900', letterSpacing: '2px', margin: 0 },
  subText:    { fontSize: '10px', color: '#555', margin: '2px 0 0' },
  reportTitle:{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0 0' },
  periodText: { fontSize: '10px', color: '#555', margin: '3px 0 0' },
  sectionHead:{
    fontSize: '11px', fontWeight: 'bold',
    borderBottom: '1px solid #999', paddingBottom: '3px',
    marginBottom: '6px', marginTop: '14px',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '10px' },
  th: { textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f5f5f5' },
  thR:{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f5f5f5' },
  td: { padding: '3px 6px', borderBottom: '1px solid #eee' },
  tdR:{ padding: '3px 6px', borderBottom: '1px solid #eee', textAlign: 'right' },
  summaryRow:  { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' },
  summaryLabel:{ color: '#444' },
  summaryValue:{ fontWeight: 'bold' },
  totalRow:    { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', fontWeight: 'bold', borderTop: '1.5px solid #000', marginTop: '4px' },
  footer: { marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '8px', textAlign: 'center', fontSize: '9px', color: '#888' },
}

const ReportPrint = forwardRef(function ReportPrint({ report, type = 'daily', language = 'english' }, ref) {
  const { settings } = useSiteSettings()
  if (!report) return null

  const t = translations[language] || translations.english
  const isBangla = language === 'bangla'
  const shopName = isBangla
    ? (settings.site_name_bn || settings.site_name || 'জেন্টস শপ')
    : (settings.site_name || 'GENTS SHOP')
  const address = settings.contact_address || ''
  const phone   = settings.contact_phone   || ''
  const logoUrl = settings.site_logo_url   || null

  const isYearly = type === 'yearly'

  return (
    <div ref={ref} style={{ ...s.page, position: 'relative', fontFamily: isBangla ? "'Hind Siliguri', Arial, sans-serif" : 'Arial, sans-serif' }}>

      {/* ── Watermark ── */}
      {logoUrl && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-35deg)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.07,
          width: '180mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src={logoUrl}
            alt=""
            style={{ width: '140mm', maxHeight: '140mm', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={s.header}>
        <h1 style={s.shopName}>{shopName.toUpperCase()}</h1>
        {address && <p style={s.subText}>{address}</p>}
        {phone   && <p style={s.subText}>Tel: {phone}</p>}
        <h2 style={s.reportTitle}>{t[type] || t.custom}</h2>
        <p style={s.periodText}>
          {t.period}: {isYearly
            ? report.year
            : `${formatDate(report.start_date)} – ${formatDate(report.end_date)}`
          }
        </p>
      </div>

      {/* ── Summary ── */}
      <div style={s.sectionHead}>{t.summary}</div>
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }}>
        {[
          [t.totalRevenue,  formatCurrency(report.summary?.total_revenue),  '#166534'],
          [t.totalCogs,     formatCurrency(report.summary?.total_cogs),     '#92400e'],
          [t.grossProfit,   formatCurrency(report.summary?.gross_profit),   '#1e40af'],
          [t.totalExpenses, formatCurrency(report.summary?.total_expenses), '#991b1b'],
          [t.netProfit,     formatCurrency(report.summary?.net_profit),     '#5b21b6'],
          [t.transactions,  report.summary?.transaction_count,              '#374151'],
        ].map(([label, value, color]) => (
          <div key={label} style={s.summaryRow}>
            <span style={s.summaryLabel}>{label}</span>
            <span style={{ ...s.summaryValue, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Cash Summary ── */}
      <div style={{ ...s.sectionHead, marginTop: '10px' }}>Cash Summary</div>
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }}>
        {[
          [t.shopCash,       formatCurrency(report.summary?.shop_cash),      '#d97706'],
          [t.mobileBanking,  formatCurrency(report.summary?.online_cash),    '#059669'],
          [t.bank,           formatCurrency(report.summary?.bank_cash),      '#0284c7'],
          [t.netCash,        formatCurrency(report.summary?.net_cash),       '#0f766e'],
        ].map(([label, value, color]) => (
          <div key={label} style={s.summaryRow}>
            <span style={s.summaryLabel}>{label}</span>
            <span style={{ ...s.summaryValue, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Monthly breakdown (yearly only) ── */}
      {isYearly && report.by_month?.length > 0 && (
        <>
          <div style={s.sectionHead}>{t.monthlyBreakdown}</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t.month}</th>
                <th style={s.thR}>{t.txnCount}</th>
                <th style={s.thR}>{t.revenue}</th>
                <th style={s.thR}>{t.expenses}</th>
                <th style={s.thR}>{t.netProfit}</th>
              </tr>
            </thead>
            <tbody>
              {report.by_month.map(row => (
                <tr key={row.month}>
                  <td style={s.td}>{MONTHS[row.month - 1]}</td>
                  <td style={s.tdR}>{row.transaction_count}</td>
                  <td style={{ ...s.tdR, color: '#166534' }}>{formatCurrency(row.revenue)}</td>
                  <td style={{ ...s.tdR, color: '#991b1b' }}>{formatCurrency(row.expenses)}</td>
                  <td style={{ ...s.tdR, color: row.net_profit >= 0 ? '#5b21b6' : '#991b1b' }}>{formatCurrency(row.net_profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Daily breakdown (daily / weekly / cashflow) ── */}
      {!isYearly && report.by_date?.length > 1 && (
        <>
          <div style={s.sectionHead}>{t.dailyBreakdown}</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t.date}</th>
                <th style={s.thR}>{t.txnCount}</th>
                <th style={s.thR}>{t.revenue}</th>
                <th style={s.thR}>{t.expenses}</th>
              </tr>
            </thead>
            <tbody>
              {report.by_date.map(day => (
                <tr key={day.date}>
                  <td style={s.td}>{formatDate(day.date)}</td>
                  <td style={s.tdR}>{day.transaction_count}</td>
                  <td style={{ ...s.tdR, color: '#166534' }}>{formatCurrency(day.revenue)}</td>
                  <td style={{ ...s.tdR, color: '#991b1b' }}>{formatCurrency(day.expenses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Expense breakdown ── */}
      {report.expense_by_category?.length > 0 && (
        <>
          <div style={s.sectionHead}>{t.expenseBreakdown}</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t.category}</th>
                <th style={s.thR}>{t.amount}</th>
              </tr>
            </thead>
            <tbody>
              {report.expense_by_category.map(cat => (
                <tr key={cat.category}>
                  <td style={s.td}>{cat.category}</td>
                  <td style={{ ...s.tdR, color: '#991b1b' }}>{formatCurrency(cat.total)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...s.td, fontWeight: 'bold' }}>Total</td>
                <td style={{ ...s.tdR, fontWeight: 'bold', color: '#991b1b' }}>{formatCurrency(report.summary?.total_expenses)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* ── Top products ── */}
      {report.top_products?.length > 0 && (
        <>
          <div style={s.sectionHead}>{t.topProducts}</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '24px' }}>#</th>
                <th style={s.th}>{t.product}</th>
                <th style={s.thR}>{t.units}</th>
                <th style={s.thR}>{t.revenue}</th>
              </tr>
            </thead>
            <tbody>
              {report.top_products.map((p, i) => (
                <tr key={i}>
                  <td style={{ ...s.td, color: '#888' }}>{i + 1}</td>
                  <td style={s.td}>{p.product_name}</td>
                  <td style={s.tdR}>{p.total_quantity}</td>
                  <td style={{ ...s.tdR, color: '#166534' }}>{formatCurrency(p.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Owner Transactions ── */}
      {report.owner_transactions?.length > 0 && (
        <>
          <div style={s.sectionHead}>{t.ownerCashManagement}</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Type</th>
                <th style={s.th}>Payment Source</th>
                <th style={s.th}>Recipient/Purpose</th>
                <th style={s.thR}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.owner_transactions.map((txn) => (
                <tr key={txn.id}>
                  <td style={s.td}>
                    {txn.type === 'withdrawal' ? t.withdrawal :
                    txn.type === 'deposit' ? t.deposit :
                    txn.type === 'loan' ? t.loanGiven : t.loanRepayment}
                  </td>
                  <td style={s.td}>
                    {txn.payment_source === 'shop_cash' ? t.shopCash : 
                    txn.payment_source === 'online' ? t.mobileBanking : t.bank}
                  </td>
                  <td style={s.td}>
                    {txn.recipient_name && <div style={{ fontWeight: 'bold' }}>{txn.recipient_name}</div>}
                    {txn.purpose && <div style={{ fontSize: '9px', color: '#666' }}>{txn.purpose}</div>}
                  </td>
                  <td style={{ 
                    ...s.tdR, 
                    color: (txn.type === 'withdrawal' || txn.type === 'loan') ? '#991b1b' : '#166534',
                    fontWeight: 'bold'
                  }}>
                    {(txn.type === 'withdrawal' || txn.type === 'loan') ? '-' : '+'}
                    {formatCurrency(txn.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Footer ── */}
      <div style={s.footer}>
        {t.generatedOn} {new Date().toLocaleString('en-GB')} &nbsp;•&nbsp; {shopName}
      </div>
      </div>{/* end z-index wrapper */}
    </div>
  )
})

export default ReportPrint
