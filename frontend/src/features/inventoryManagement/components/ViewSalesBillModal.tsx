import React from 'react';
import ReactDOM from 'react-dom';
import logo from '@/assets/logo.png';
import { useAppSettings } from '@/context/AppSettingsContext';
import '@/styles/InvoicePdf.css';

interface ViewSalesBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    // bill can be a single object, an array of responses, or an object containing an items array
    bill: any | null;
    isLoading?: boolean;
    onPrint?: (bill: any) => void;
    onDownloadPdf?: (bill: any) => void;
    onEdit?: (bill: any) => void;
    canEdit?: boolean;
}

export const ViewSalesBillModal: React.FC<ViewSalesBillModalProps> = ({
    isOpen,
    onClose,
    bill,
    isLoading = false,
    onPrint,
    onDownloadPdf,
    onEdit,
    canEdit = true,
}) => {
    const { formatNumber, formatDate } = useAppSettings();

    if (!isOpen || !bill) return null;

    const companyName =
        localStorage.getItem('organizationName') ||
        localStorage.getItem('companyName') ||
        'Point of Sale Store';

    // Handle whether bill is an array, has an items array, or is a single object
    const itemsList: any[] = Array.isArray(bill)
        ? bill
        : (Array.isArray(bill.items) ? bill.items : [bill]);

    // Metadata from first item for invoice header info
    const primaryBill = itemsList[0] || bill;

    const paymentStatusUpper = (primaryBill.paymentStatus || 'PAID').toUpperCase();
    const isPaid = paymentStatusUpper === 'PAID' || paymentStatusUpper === 'RECEIVED';
    const isDue = paymentStatusUpper === 'DUE' || paymentStatusUpper === 'UNPAID';

    const rawDate = primaryBill.billDate || primaryBill.createdAt || primaryBill.date;
    const formattedDate = rawDate ? formatDate(rawDate) : 'N/A';

    // Calculate totals
    const totalBilledAmount = bill.amount ?? itemsList.reduce(
        (sum, item) => sum + (item.amount || ((item.quantity || 1) * (item.unitPrice || 0))),
        0
    );
    const totalTaxAmount = itemsList.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const totalVatAmount = itemsList.reduce((sum, item) => sum + (item.vatAmount || 0), 0);
    const rawSubtotal = itemsList.reduce((sum, item) => {
        const q = item.quantity ?? 1;
        const u = item.unitPrice ?? 0;
        return sum + (q * u);
    }, 0);
    const subtotal = rawSubtotal > 0 ? rawSubtotal : (totalBilledAmount - totalTaxAmount - totalVatAmount);

    return ReactDOM.createPortal(
        <div className="invoice-modal-backdrop" onClick={onClose}>
            <div
                className="invoice-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Action Bar Header */}
                <div className="invoice-modal-header">
                    <div className="invoice-modal-title">
                        <span className="invoice-modal-badge sales">Sales Invoice</span>
                        <h3>#{primaryBill.billNumber || 'BILL-N/A'}</h3>
                    </div>

                    <div className="invoice-modal-actions">
                        {onDownloadPdf && (
                            <button
                                type="button"
                                className="btn-invoice-download"
                                onClick={() => onDownloadPdf(bill)}
                                title="Download Invoice as PDF"
                            >
                                <i className="bi bi-file-earmark-arrow-down" />
                                <span>Download PDF</span>
                            </button>
                        )}

                        {onPrint && (
                            <button
                                type="button"
                                className="btn-invoice-print"
                                onClick={() => onPrint(bill)}
                                title="Print Invoice"
                            >
                                <i className="bi bi-printer" />
                                <span>Print</span>
                            </button>
                        )}

                        {canEdit && onEdit && (
                            <button
                                type="button"
                                className="btn-invoice-edit"
                                onClick={() => onEdit(bill)}
                                title="Edit Sales Bill"
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
                            <div style={{ fontWeight: 600 }}>Loading sales invoice details...</div>
                        </div>
                    ) : (
                        <div className="invoice-paper" id="view-sales-bill-paper">
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
                                    <h2 className="invoice-type-name">TAX INVOICE</h2>
                                    <div className="invoice-number-tag">
                                        #{primaryBill.billNumber || 'BILL-N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Metadata & Parties Grid */}
                            <div className="invoice-meta-grid">
                                <div className="invoice-party-col">
                                    <h4>Customer / Billed To</h4>
                                    <div
                                        className="invoice-party-name"
                                        style={{ color: '#dc2626', fontWeight: 700 }}
                                    >
                                        {primaryBill.customerName || 'Walk-in Customer'}
                                    </div>
                                    <p className="invoice-party-detail">
                                        {primaryBill.customerId
                                            ? `Customer ID: #${primaryBill.customerId}`
                                            : 'Direct Retail Customer'}
                                    </p>
                                    {primaryBill.remarks && (
                                        <p className="invoice-party-detail" style={{ marginTop: '4px' }}>
                                            <strong>Note:</strong> {primaryBill.remarks}
                                        </p>
                                    )}
                                </div>

                                <div className="invoice-dates-col">
                                    <div className="invoice-info-row">
                                        <span className="invoice-info-label">Invoice Date:</span>
                                        <span className="invoice-info-val">{formattedDate}</span>
                                    </div>
                                    <div className="invoice-info-row">
                                        <span className="invoice-info-label">Payment Mode:</span>
                                        <span className="invoice-info-val" style={{ textTransform: 'uppercase' }}>
                                            {primaryBill.paymentMode || 'CASH'}
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
                                    {primaryBill.createdBy && (
                                        <div className="invoice-info-row">
                                            <span className="invoice-info-label">Issued By:</span>
                                            <span className="invoice-info-val">{primaryBill.createdBy}</span>
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
                                            <th>Item Description</th>
                                            <th className="text-center" style={{ width: '70px' }}>Qty</th>
                                            <th className="text-end" style={{ width: '120px' }}>Unit Rate</th>
                                            <th className="text-end" style={{ width: '120px' }}>Tax / VAT</th>
                                            <th className="text-end" style={{ width: '130px' }}>Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsList.map((item, index) => {
                                            const qty = item.quantity ?? 1;
                                            const unitPrice = item.unitPrice ?? 0;
                                            const taxVal = (item.taxAmount || 0) + (item.vatAmount || 0);
                                            const itemTotal = item.amount ?? (qty * unitPrice);

                                            return (
                                                <tr key={item.id || index}>
                                                    <td className="text-center" style={{ color: '#64748b', fontWeight: 600 }}>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <div className="item-name-cell">
                                                            {item.productName || 'Sales Item'}
                                                        </div>
                                                        {item.productId ? (
                                                            <div className="item-category-sub">
                                                                Code: #{item.productId}
                                                            </div>
                                                        ) : null}
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
                                    {primaryBill.remarks && (
                                        <p style={{ marginBottom: '6px' }}>
                                            <strong>Remarks:</strong> {primaryBill.remarks}
                                        </p>
                                    )}
                                    <p>
                                        1. Goods once sold are subject to company policy.<br />
                                        2. This is a computer-generated tax invoice and requires no physical seal.
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
                                            Rs. {formatNumber(totalBilledAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Signatures & Footer Disclaimer */}
                            <div className="invoice-signatures">
                                <div className="sig-box">
                                    <div className="sig-line" />
                                    <div className="sig-title">Customer Signature</div>
                                </div>
                                <div className="sig-box">
                                    <div className="sig-line" />
                                    <div className="sig-title">Authorized Signatory</div>
                                </div>
                            </div>

                            <div className="invoice-disclaimer">
                                Thank you for your business! Have a great day.
                            </div>

                            {/* Attached Bill Document / Photo (if present) */}
                            {primaryBill.photoPath && (
                                <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                                        Attached Receipt / Document
                                    </div>
                                    <img
                                        src={primaryBill.photoPath}
                                        alt="Bill Attachment"
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
