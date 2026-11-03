import React from 'react';
import ReactDOM from 'react-dom';
import { GetSingleSalesBillResponse } from '@/features/services/salesBillService';
import { useAppSettings } from '@/context/AppSettingsContext';

interface ViewSalesBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: GetSingleSalesBillResponse | null;
    isLoading?: boolean;
    onPrint?: (bill: GetSingleSalesBillResponse) => void;
    onDownloadPdf?: (bill: GetSingleSalesBillResponse) => void;
    onEdit?: (bill: GetSingleSalesBillResponse) => void;
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

    const paymentStatusUpper = (bill.paymentStatus || 'PAID').toUpperCase();
    const isPaid = paymentStatusUpper === 'PAID' || paymentStatusUpper === 'RECEIVED';
    const isDue = paymentStatusUpper === 'DUE' || paymentStatusUpper === 'UNPAID';

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
        }}>
            <div
                className="modal-content medium"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    maxWidth: '720px',
                    width: '100%',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                }}
            >
                {/* Modal Header */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #255DCE 0%, #021861 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0
                        }}>
                            <i className="bi bi-receipt" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                                    Sales Invoice Details
                                </h3>
                                <span style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: '#e0e7ff',
                                    color: '#3730a3'
                                }}>
                                    {bill.billNumber || 'BILL-N/A'}
                                </span>
                            </div>
                            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                                Single sales transaction record and tax breakdown
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="form-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{
                    padding: '20px 24px',
                    overflowY: 'auto',
                    flex: '1 1 auto',
                    boxSizing: 'border-box'
                }}>
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <div className="spinner-border text-primary mb-2" role="status" />
                            <div>Loading sales bill details...</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Top Details Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '12px'
                            }}>
                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Customer</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                                        {bill.customerName || 'Walk-in Customer'}
                                    </div>
                                    {bill.customerId ? (
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: #{bill.customerId}</div>
                                    ) : null}
                                </div>

                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Invoice Date</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                                        {bill.billDate ? formatDate(bill.billDate) : (bill.createdAt ? formatDate(bill.createdAt) : 'N/A')}
                                    </div>
                                    {bill.createdBy && (
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>By: {bill.createdBy}</div>
                                    )}
                                </div>

                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Payment Mode & Status</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: '#f1f5f9',
                                            color: '#334155'
                                        }}>
                                            {(bill.paymentMode || 'CASH').toUpperCase()}
                                        </span>
                                        <span style={{
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: isPaid ? '#dcfce7' : isDue ? '#fee2e2' : '#fef3c7',
                                            color: isPaid ? '#15803d' : isDue ? '#b91c1c' : '#b45309'
                                        }}>
                                            {paymentStatusUpper}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Item Information Table */}
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                                    Purchased Product / Line Item
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', background: '#fafbfc' }}>
                                                <th style={{ padding: '10px 16px' }}>Item</th>
                                                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Qty</th>
                                                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Unit Price</th>
                                                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Tax / VAT</th>
                                                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{bill.productName || 'Sales Item'}</div>
                                                    {bill.productId ? (
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Item Code: #{bill.productId}</div>
                                                    ) : null}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
                                                    {bill.quantity ?? 1}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#475569' }}>
                                                    Rs. {formatNumber(bill.unitPrice || 0)}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#475569' }}>
                                                    Rs. {formatNumber((bill.taxAmount || 0) + (bill.vatAmount || 0))}
                                                    {(bill.taxPercentage || bill.vatPercentage) ? (
                                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                            {bill.taxPercentage ? `Tax ${bill.taxPercentage}%` : ''}
                                                            {bill.vatPercentage ? ` VAT ${bill.vatPercentage}%` : ''}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                                    Rs. {formatNumber(bill.amount || ((bill.quantity || 1) * (bill.unitPrice || 0)))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Financial Summary Card */}
                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '14px 18px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Billed Amount</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                                        Rs. {formatNumber(bill.amount || 0)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                                    {bill.taxAmount ? <div>Tax: Rs. {formatNumber(bill.taxAmount)}</div> : null}
                                    {bill.vatAmount ? <div>VAT: Rs. {formatNumber(bill.vatAmount)}</div> : null}
                                </div>
                            </div>

                            {/* Remarks (if present) */}
                            {bill.remarks && (
                                <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Remarks</div>
                                    <div style={{ fontSize: '0.88rem', color: '#1e293b', marginTop: '2px' }}>{bill.remarks}</div>
                                </div>
                            )}

                            {/* Attached Photo Preview (if present) */}
                            {bill.photoPath && (
                                <div>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Attached Bill Document</div>
                                    <img
                                        src={bill.photoPath}
                                        alt="Bill Attachment"
                                        style={{
                                            maxHeight: '160px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '14px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: '#f8fafc',
                    flexWrap: 'wrap'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '8px 18px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            background: '#ffffff',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {onPrint && (
                            <button
                                type="button"
                                onClick={() => onPrint(bill)}
                                style={{
                                    padding: '8px 14px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    background: '#ffffff',
                                    color: '#0f172a',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <i className="bi bi-printer" /> Print
                            </button>
                        )}

                        {onDownloadPdf && (
                            <button
                                type="button"
                                onClick={() => onDownloadPdf(bill)}
                                style={{
                                    padding: '8px 14px',
                                    border: '1px solid #255dce',
                                    borderRadius: '8px',
                                    background: '#ffffff',
                                    color: '#255dce',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <i className="bi bi-file-earmark-pdf" /> PDF
                            </button>
                        )}

                        {canEdit && onEdit && (
                            <button
                                type="button"
                                onClick={() => onEdit(bill)}
                                style={{
                                    padding: '8px 18px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #255DCE 0%, #021861 100%)',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <i className="bi bi-pencil" /> Edit Bill
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ViewSalesBillModal;

