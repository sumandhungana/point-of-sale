import React from 'react';
import ReactDOM from 'react-dom';
import { Item } from '@/features/services/productService';
import { resolveImageSrc } from '@/utils/ImageResolver';
import { useAppSettings } from '@/context/AppSettingsContext';

interface ViewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Item | null;
    onEdit: (item: Item) => void;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
    isOpen,
    onClose,
    item,
    onEdit,
}) => {
    const { formatCurrency, formatNumber } = useAppSettings();

    if (!isOpen || !item) return null;

    const qty = item.itemCount ?? 0;
    const unit = item.unit || 'pcs';
    const alertThreshold = item.lowStockAlert || 5;
    const unitPurchase = item.perUnitPurchasePrice || 0;
    const grossPurchase = item.grossPurchasePrice || 0;
    const fixedSelling = item.fixedSellingPrice || 0;
    const totalSales = item.totalSalesAmount || 0;
    const isFixedPrice = Boolean(fixedSelling > 0);
    const unitProfit = isFixedPrice && unitPurchase > 0 ? fixedSelling - unitPurchase : null;
    const imageSrc = item.imageUrl ? resolveImageSrc(item.imageUrl) : '';

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
        } catch {
            return 'N/A';
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content medium"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '680px', width: '92%' }}
            >
                {/* Modal Header */}
                <div className="modal-header">
                    <div>
                        <div className="view-modal-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                                Product Details
                            </h3>
                            <span className="role-id-badge">#ITEM-{item.id}</span>
                            {qty <= 0 ? (
                                <span className="badge-stock out-of-stock">
                                    <i className="bi bi-x-circle-fill"></i> Out of stock
                                </span>
                            ) : qty <= alertThreshold ? (
                                <span className="badge-stock low-stock">
                                    <i className="bi bi-exclamation-triangle-fill"></i> Low stock ({qty} {unit})
                                </span>
                            ) : (
                                <span className="badge-stock in-stock">
                                    <i className="bi bi-check-circle-fill"></i> In stock
                                </span>
                            )}
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                            Comprehensive view of product specifications, stock balance, and financial valuation
                        </p>
                    </div>
                    <button
                        type="button"
                        className="form-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', padding: '20px' }}>
                    {/* Product Hero Profile Card */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '18px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            marginBottom: '18px',
                        }}
                    >
                        <div
                            style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(37, 93, 206, 0.1) 0%, rgba(2, 24, 97, 0.15) 100%)',
                                border: '1px solid rgba(37, 93, 206, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden',
                                fontSize: '30px',
                                color: '#255DCE',
                            }}
                        >
                            {imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <i className="bi bi-box-seam" />
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#021861' }}>
                                    {item.name}
                                </h4>
                                <span className="badge-role">
                                    {item.category?.name || 'Uncategorized'}
                                </span>
                            </div>
                            <div style={{ marginTop: '6px', fontSize: '13px', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <span>
                                    Unit: <strong>{unit}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                    Low Stock Alert: <strong>&le; {alertThreshold} {unit}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Financial & Valuation Summary Banner */}
                    <div className="view-summary-banner" style={{ marginBottom: '20px' }}>
                        <div className="summary-item">
                            <span className="summary-label">CURRENT STOCK</span>
                            <span className="summary-value" style={{ color: qty <= alertThreshold ? '#d97706' : '#059669' }}>
                                {formatNumber(qty, 0)} {unit}
                            </span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <span className="summary-label">UNIT COST</span>
                            <span className="summary-value">{formatCurrency(unitPurchase)}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <span className="summary-label">FIXED SELLING</span>
                            <span className="summary-value highlight">
                                {isFixedPrice ? formatCurrency(fixedSelling) : 'Dynamic'}
                            </span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <span className="summary-label">UNIT MARGIN</span>
                            <span
                                className="summary-value"
                                style={{
                                    color:
                                        unitProfit === null
                                            ? '#64748b'
                                            : unitProfit >= 0
                                            ? '#059669'
                                            : '#dc2626',
                                }}
                            >
                                {unitProfit !== null ? formatCurrency(unitProfit) : 'Dynamic'}
                            </span>
                        </div>
                    </div>

                    {/* Specifications & Cost Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Section 1: Valuation Breakdown */}
                        <div
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '14px 16px',
                            }}
                        >
                            <h5
                                style={{
                                    margin: '0 0 10px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#021861',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <i className="bi bi-wallet2 text-primary"></i>
                                Financial Valuation & Revenue
                            </h5>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Unit Purchase Price:</span>
                                    <strong style={{ color: '#0f172a' }}>{formatCurrency(unitPurchase)}</strong>
                                </div>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Gross Inventory Valuation:</span>
                                    <strong style={{ color: '#0f172a' }}>{formatCurrency(grossPurchase)}</strong>
                                </div>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Fixed Selling Price:</span>
                                    <strong style={{ color: '#255DCE' }}>{isFixedPrice ? formatCurrency(fixedSelling) : 'Dynamic'}</strong>
                                </div>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Realized Sales Revenue:</span>
                                    <strong style={{ color: '#059669' }}>{formatCurrency(totalSales)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Tax & Stock Settings */}
                        <div
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '14px 16px',
                            }}
                        >
                            <h5
                                style={{
                                    margin: '0 0 10px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#021861',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <i className="bi bi-percent text-primary"></i>
                                Tax Settings & Metadata
                            </h5>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>VAT Percentage:</span>
                                    <strong style={{ color: '#0f172a' }}>{item.vatPercentage !== undefined ? `${item.vatPercentage}%` : '13%'}</strong>
                                </div>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Tax Included:</span>
                                    <strong style={{ color: '#0f172a' }}>
                                        {item.isTaxIncluded ? `Yes (${item.taxPercentage || 0}%)` : 'No'}
                                    </strong>
                                </div>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Created Date:</span>
                                    <span style={{ color: '#0f172a' }}>{formatDate(item.createdAt)}</span>
                                </div>
                                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Last Updated:</span>
                                    <span style={{ color: '#0f172a' }}>{formatDate(item.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div
                    className="modal-footer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        borderRadius: '0 0 14px 14px',
                    }}
                >
                    <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        className="btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 20px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                        onClick={() => onEdit(item)}
                    >
                        <i className="bi bi-pencil-square"></i>
                        Edit Product
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ViewProductModal;
