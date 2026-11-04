import React from 'react';
import ReactDOM from 'react-dom';
import logo from '@/assets/logo.png';
import { useAppSettings } from '@/context/AppSettingsContext';
import '@/styles/InvoicePdf.css';

interface ViewPurchaseBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: any | null;
    isLoading?: boolean;
    onPrint?: (purchase: any) => void;
    onDownloadPdf?: (purchase: any) => void;
    onEdit?: (purchase: any) => void;
    canEdit?: boolean;
}

export const ViewPurchaseBillModal: React.FC<ViewPurchaseBillModalProps> = ({
    isOpen,
    onClose,
    purchase,
    isLoading = false,
    onPrint,
    onDownloadPdf,
    onEdit,
    canEdit = true,
}) => {
    const { formatNumber, formatDate } = useAppSettings();

    if (!isOpen || !purchase) return null;

    const companyName =
        localStorage.getItem('organizationName') ||
        localStorage.getItem('companyName') ||
        'Point of Sale Store';

    // Handle whether purchase is an array, has an items array, or is a single object
    const itemsList: any[] = Array.isArray(purchase)
        ? purchase
        : (Array.isArray(purchase.items) ? purchase.items : [purchase]);

    const primaryPurchase = itemsList[0] || purchase;

    const paymentStatusUpper = (
        primaryPurchase.paymentStatus ||
        (primaryPurchase.paymentMode?.toLowerCase() === 'credit' ? 'DUE' : 'PAID')
    ).toUpperCase();
    const isPaid = paymentStatusUpper === 'PAID' || paymentStatusUpper === 'RECEIVED';
    const isDue = paymentStatusUpper === 'DUE' || paymentStatusUpper === 'UNPAID';

    const rawDate = primaryPurchase.date || primaryPurchase.createdAt || primaryPurchase.billDate;
    const formattedDate = rawDate ? formatDate(rawDate) : 'N/A';

    const supplierName =
        primaryPurchase.supplierName ||
        (primaryPurchase.category?.name ? `${primaryPurchase.category.name} Vendor` : 'Walk-In Supplier');

    // Calculate totals
    const totalAmount = purchase.amount ?? itemsList.reduce(
        (sum, item) => sum + (item.amount || ((item.quantity || 1) * (item.unitPrice || item.rate || 0))),
        0
    );
    const totalTaxAmount = itemsList.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const totalVatAmount = itemsList.reduce((sum, item) => sum + (item.vatAmount || 0), 0);
    const rawSubtotal = itemsList.reduce((sum, item) => {
        const q = item.quantity ?? 1;
        const u = item.unitPrice ?? item.rate ?? 0;
        return sum + (q * u);
    }, 0);
    const subtotal = rawSubtotal > 0 ? rawSubtotal : (totalAmount - totalTaxAmount - totalVatAmount);

    return ReactDOM.createPortal(
        <div className="invoice-modal-backdrop" onClick={onClose}>
            <div
                className="invoice-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Action Bar Header */}
                <div className="invoice-modal-header">
                    <div className="invoice-modal-title">
                        <span className="invoice-modal-badge purchase">Purchase Invoice</span>
                        <h3>#{primaryPurchase.purchaseNo || 'PUR-N/A'}</h3>
                    </div>

                    <div className="invoice-modal-actions">
                        {onDownloadPdf && (
                            <button
                                type="button"
                                className="btn-invoice-download"
                                onClick={() => onDownloadPdf(purchase)}
                                title="Download Purchase Invoice as PDF"
                            >
                                <i className="bi bi-file-earmark-arrow-down" />
                                <span>Download PDF</span>
                            </button>
                        )}

                        {onPrint && (
                            <button
                                type="button"
                                className="btn-invoice-print"
                                onClick={() => onPrint(purchase)}
                                title="Print Purchase Invoice"
                            >
                                <i className="bi bi-printer" />
                                <span>Print</span>
                            </button>
                        )}

                        {canEdit && onEdit && (
                            <button
                                type="button"
                                className="btn-invoice-edit"
                                onClick={() => onEdit(purchase)}
                                title="Edit Purchase Bill"
                            >
                                <i className="bi bi-pencil" />
                                <span>Edit Bill</span>
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn-invoice-close"
                            onClick={onClose}
                            title="Close Invoice"
                            aria-label="Close"
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                {/* Invoice Body / Desk Viewport */}
                <div className="invoice-modal-body">
                    {isLoading ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                            <div className="spinner-border text-primary mb-3" role="status" />
                            <div style={{ fontWeight: 600 }}>Loading purchase bill details...</div>
                        </div>
                    ) : (
                        <div className="invoice-paper" id="view-purchase-bill-paper">
                            {/* 1. Header & Store Branding */}
                            <div className="invoice-paper-header">
                                <div className="invoice-brand">
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        className="invoice-logo-img"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                    <div>
                                        <h1 className="invoice-brand-title">{companyName}</h1>
                                        <p className="invoice-brand-subtitle">
                                            Point of Sale & Inventory Billing System
                                        </p>
                                    </div>
                                </div>

                                <div className="invoice-type-banner">
                                    <h2 className="invoice-type-name" style={{ color: '#1d4ed8' }}>
                                        PURCHASE INVOICE
                                    </h2>
                                    <div className="invoice-number-tag">
                                        #{primaryPurchase.purchaseNo || 'PUR-N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Metadata & Parties Grid */}
                            <div className="invoice-meta-grid">
                                <div className="invoice-party-col">
                                    <h4>Vendor / Supplier Information</h4>
                                    <div
                                        className="invoice-party-name"
                                        style={{ color: '#1d4ed8', fontWeight: 700 }}
                                    >
                                        {supplierName}
                                    </div>
                                    <p className="invoice-party-detail">
                                        {primaryPurchase.supplierId
                                            ? `Supplier ID: #${primaryPurchase.supplierId}`
                                            : 'Registered Vendor / Supplier'}
                                    </p>
                                    {primaryPurchase.category?.name && (
                                        <p className="invoice-party-detail">
                                            Category: {primaryPurchase.category.name}
                                        </p>
                                    )}
                                    {primaryPurchase.remarks && (
                                        <p className="invoice-party-detail" style={{ marginTop: '4px' }}>
                                            <strong>Note:</strong> {primaryPurchase.remarks}
                                        </p>
                                    )}
                                </div>

                                <div className="invoice-dates-col">
                                    <div className="invoice-info-row">
                                        <span className="invoice-info-label">Purchase Date:</span>
                                        <span className="invoice-info-val">{formattedDate}</span>
                                    </div>
                                    <div className="invoice-info-row">
                                        <span className="invoice-info-label">Payment Mode:</span>
                                        <span className="invoice-info-val" style={{ textTransform: 'uppercase' }}>
                                            {primaryPurchase.paymentMode || 'CASH'}
                                        </span>
                                    </div>
                                    <div className="invoice-info-row">
                                        <span className="invoice-info-label">Payment Status:</span>
                                        <span
                                            className="badge-paid-status"
                                            style={{
                                                background: isPaid ? '#dcfce7' : isDue ? '#fee2e2' : '#fef3c7',
                                                color: isPaid ? '#15803d' : isDue ? '#b91c1c' : '#b45309',
                                            }}
                                        >
                                            {paymentStatusUpper}
                                        </span>
                                    </div>
                                    {primaryPurchase.createdBy && (
                                        <div className="invoice-info-row">
                                            <span className="invoice-info-label">Recorded By:</span>
                                            <span className="invoice-info-val">{primaryPurchase.createdBy}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Items Table */}
                            <div className="invoice-table-container">
                                <table className="invoice-paper-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                                            <th>Item & Description</th>
                                            <th className="text-center" style={{ width: '70px' }}>Qty</th>
                                            <th className="text-end" style={{ width: '120px' }}>Unit Rate</th>
                                            <th className="text-end" style={{ width: '120px' }}>Tax / VAT</th>
                                            <th className="text-end" style={{ width: '130px' }}>Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsList.map((item, index) => {
                                            const qty = item.quantity ?? item.itemCount ?? 1;
                                            const lineAmt = item.amount ?? item.totalPrice ?? 0;
                                            const unitPrice = item.unitPrice ?? item.rate ?? (qty > 0 && lineAmt > 0 ? (lineAmt / qty) : 0);
                                            const taxVal = (item.taxAmount || 0) + (item.vatAmount || 0);
                                            const itemTotal = item.amount ?? (qty * unitPrice);
                                            const itemName = item.item?.name || item.name || item.itemName || item.productName || (typeof item.item === 'string' ? item.item : '') || 'Purchase Item';
                                            const categoryName = item.category?.name || item.categoryName || (primaryPurchase.category?.name || '');
                                            const code = item.itemId || item.productId || item.item?.id || item.id;

                                            return (
                                                <tr key={item.id || index}>
                                                    <td className="text-center" style={{ color: '#64748b', fontWeight: 600 }}>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <div className="item-name-cell">{itemName}</div>
                                                        <div className="item-category-sub">
                                                            {categoryName ? `${categoryName}` : ''}
                                                            {code ? ` • Code: #${code}` : ''}
                                                        </div>
                                                    </td>
                                                    <td className="text-center" style={{ fontWeight: 600 }}>
                                                        {qty}
                                                    </td>
                                                    <td className="text-end" style={{ color: '#475569' }}>
                                                        Rs. {formatNumber(unitPrice)}
                                                    </td>
                                                    <td className="text-end" style={{ color: '#475569' }}>
                                                        Rs. {formatNumber(taxVal)}
                                                        {(item.taxPercentage || item.vatPercentage) ? (
                                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                                {item.taxPercentage ? `Tax ${item.taxPercentage}%` : ''}
                                                                {item.vatPercentage ? ` VAT ${item.vatPercentage}%` : ''}
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="text-end" style={{ fontWeight: 700, color: '#0f172a' }}>
                                                        Rs. {formatNumber(itemTotal)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* 4. Financial Summary & Notes Grid */}
                            <div className="invoice-bottom-grid">
                                <div className="invoice-notes-box">
                                    <h5>Terms & Remarks</h5>
                                    {primaryPurchase.remarks && (
                                        <p style={{ marginBottom: '6px' }}>
                                            <strong>Remarks:</strong> {primaryPurchase.remarks}
                                        </p>
                                    )}
                                    <p>
                                        1. Stock items received in good order and verified against supplier bill.<br />
                                        2. Recorded for official accounting and inventory ledger audit.
                                    </p>
                                </div>

                                <div className="invoice-totals-box">
                                    <div className="total-summary-line">
                                        <span>Items Subtotal:</span>
                                        <span>Rs. {formatNumber(subtotal)}</span>
                                    </div>
                                    {totalTaxAmount > 0 && (
                                        <div className="total-summary-line">
                                            <span>Tax Amount:</span>
                                            <span>Rs. {formatNumber(totalTaxAmount)}</span>
                                        </div>
                                    )}
                                    {totalVatAmount > 0 && (
                                        <div className="total-summary-line">
                                            <span>VAT Amount:</span>
                                            <span>Rs. {formatNumber(totalVatAmount)}</span>
                                        </div>
                                    )}
                                    <div className="total-summary-line grand">
                                        <span>Grand Total:</span>
                                        <span className="grand-amount-val">
                                            Rs. {formatNumber(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Signatures & Footer Disclaimer */}
                            <div className="invoice-signatures">
                                <div className="sig-box">
                                    <div className="sig-line" />
                                    <div className="sig-title">Received By</div>
                                </div>
                                <div className="sig-box">
                                    <div className="sig-line" />
                                    <div className="sig-title">Authorized Signatory</div>
                                </div>
                            </div>

                            <div className="invoice-disclaimer">
                                Inventory and supplier invoice recorded successfully.
                            </div>

                            {/* Attached Bill Document / Photo (if present) */}
                            {primaryPurchase.photoPath && (
                                <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                                        Attached Supplier Bill / Receipt
                                    </div>
                                    <img
                                        src={primaryPurchase.photoPath}
                                        alt="Purchase Attachment"
                                        style={{
                                            maxHeight: '180px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
