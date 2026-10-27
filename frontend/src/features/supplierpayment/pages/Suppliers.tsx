import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getSuppliers, GetSupplierResponse } from '@/features/services/supplierService';
import { getPaymentList, GetPaymentResponse } from '@/features/services/paymentService';
import { useAppSettings } from '@/context/AppSettingsContext';
import { toast } from 'react-toastify';
import '../../../styles/Suppliers.css';

interface SupplierWithBalance extends GetSupplierResponse {
    balance: number;
    paymentHistory: GetPaymentResponse[];
    phoneNumber?: string;
}

interface OverallTotals {
    given: number;
    received: number;
    online: number;
}

// Helper to handle double Base64 encoding and ensure valid Data URI scheme
const formatImageSrc = (src?: string | null): string => {
    if (!src) return '';
    let clean = src.trim().replace(/(\r\n|\n|\r)/gm, '');

    // Check and decode Double-Base64 encoding ("ZGF0YT" is Base64 for "data:")
    if (clean.startsWith('ZGF0YT')) {
        try {
            clean = atob(clean).trim().replace(/(\r\n|\n|\r)/gm, '');
        } catch (e) {
            console.error('Failed to decode double-base64 string:', e);
        }
    }

    // If it already has the data URI scheme or is an HTTP/HTTPS URL, return directly
    if (clean.startsWith('data:image/') || clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
    }

    // Inspect Base64 magic headers to pick the exact MIME type if raw
    let mimeType = 'image/png';
    if (clean.startsWith('/9j/')) {
        mimeType = 'image/jpeg';
    } else if (clean.startsWith('iVBORw0KGgo')) {
        mimeType = 'image/png';
    } else if (clean.startsWith('R0lGOD')) {
        mimeType = 'image/gif';
    } else if (clean.startsWith('UklGR')) {
        mimeType = 'image/webp';
    }

    return `data:${mimeType};base64,${clean}`;
};

// Isolated avatar component with robust error fallback
const SupplierAvatar = ({ imageSrc, name }: { imageSrc?: string; name: string }) => {
    const [imgError, setImgError] = useState(false);
    const formattedSrc = React.useMemo(() => formatImageSrc(imageSrc), [imageSrc]);

    if (!formattedSrc || imgError) {
        return (
            <div
                className="suppliers-profile-image"
                style={{
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#021861',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    userSelect: 'none',
                    boxShadow: '0 2px 8px rgba(2, 24, 97, 0.08)',
                }}
            >
                {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
        );
    }

    return (
        <img
            src={formattedSrc}
            alt={name || 'Supplier'}
            className="suppliers-profile-image"
            style={{
                width: '48px',
                height: '48px',
                minWidth: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 2px 8px rgba(2, 24, 97, 0.08)',
            }}
            onError={() => setImgError(true)}
        />
    );
};

export const Suppliers = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useAppSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [suppliers, setSuppliers] = useState<SupplierWithBalance[]>([]);
    const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                setLoading(true);
                const data = await getSuppliers();

                const suppliersWithBalance = await Promise.all(
                    data.map(async (supplier: GetSupplierResponse) => {
                        try {
                            const paymentHistory = await getPaymentList({
                                paymentParty: 'SUPPLIER',
                                partyId: supplier.id
                            });
                            const balance = paymentHistory.reduce((acc: number, payment: GetPaymentResponse) => {
                                if (payment.paymentCategory === 'RECEIVED') {
                                    return acc + payment.amount;
                                } else {
                                    return acc - payment.amount;
                                }
                            }, 0);
                            return { ...supplier, balance, paymentHistory };
                        } catch (err) {
                            console.error(`Failed to fetch payment history for supplier ${supplier.id}:`, err);
                            return { ...supplier, balance: 0, paymentHistory: [] };
                        }
                    })
                );

                setSuppliers(suppliersWithBalance);

                const totals = suppliersWithBalance.reduce(
                    (acc: { given: number; received: number; online: number }, supplier: SupplierWithBalance) => {
                        const bal = Number(supplier.balance) || 0;
                        if (bal > 0) {
                            acc.received += bal;
                        } else if (bal < 0) {
                            acc.given += Math.abs(bal);
                        }
                        return acc;
                    },
                    { given: 0, received: 0, online: 0 }
                );

                setOverallTotals({ given: totals.given, received: totals.received, online: totals.online });
            } catch (err: any) {
                const errorMsg = err?.message || 'Failed to load suppliers';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        loadSuppliers();
    }, []);

    const handleAddSupplier = () => {
        navigate('/parties/suppliers/add');
    };

    const handleBulkReminder = () => {
        navigate('/parties/suppliers/list-report-pdf');
    };

    const handleListReportPdf = () => {
        navigate('/parties/suppliers/list-report-pdf');
    };

    const handleSupplierClick = (supplierId: string | number) => {
        navigate(`/parties/supplier/statements/${supplierId}`);
    };

    const getRelativeTime = (date?: string) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Recently';
        const diffMs = Date.now() - d.getTime();

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 60) return `${Math.max(0, seconds)} sec ago`;
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hr ago`;
        if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
        return d.toLocaleDateString();
    };

    const getLatestUpdatedAt = (supplier: SupplierWithBalance) => {
        const dates: number[] = [];
        if (supplier.updatedAt && !isNaN(new Date(supplier.updatedAt).getTime())) {
            dates.push(new Date(supplier.updatedAt).getTime());
        }
        if (Array.isArray(supplier.paymentHistory)) {
            supplier.paymentHistory.forEach(p => {
                const ts = p?.updatedAt || p?.createdAt;
                if (ts && !isNaN(new Date(ts).getTime())) {
                    dates.push(new Date(ts).getTime());
                }
            });
        }
        return dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : supplier.createdAt || '';
    };

    const filteredSuppliers = suppliers
        .filter((supplier) => {
            const matchesSearch =
                supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (supplier.phone || supplier.phoneNumber || '').includes(searchQuery);

            if (!matchesSearch) return false;

            if (filterBy === 'positive') return supplier.balance > 0;
            if (filterBy === 'negative') return supplier.balance < 0;
            if (filterBy === 'zero') return supplier.balance === 0;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'balance') return b.balance - a.balance;
            if (sortBy === 'recent') return Number(b.id) - Number(a.id);
            return 0;
        });

    return (
        <div className="suppliers-page-wrapper">
            <Sidebar />
            <main className="suppliers-main-content">
                <div className="suppliers-search-container">
                    <div className="suppliers-search-row">
                        <div className="suppliers-search-group">
                            <i className="bi bi-search suppliers-search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search suppliers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="suppliers-search-input"
                            />
                        </div>
                        <div className="suppliers-filter-sort-controls">
                            <div className="suppliers-filter-group">
                                <i className="bi bi-funnel suppliers-select-icon"></i>
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="suppliers-filter-select"
                                >
                                    <option value="all">All Suppliers</option>
                                    <option value="positive">You'll Receive</option>
                                    <option value="negative">You'll Give</option>
                                    <option value="zero">Settled</option>
                                </select>
                            </div>
                            <div className="suppliers-sort-group">
                                <i className="bi bi-sort-down suppliers-select-icon"></i>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="suppliers-sort-select"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="name">Name (A-Z)</option>
                                    <option value="balance">Highest Balance</option>
                                </select>
                            </div>
                        </div>
                        <div className="suppliers-action-buttons">
                            <button onClick={handleBulkReminder} className="suppliers-action-button suppliers-reminder-button">
                                <i className="bi bi-bell"></i>
                                Bulk Reminder
                            </button>
                            <button onClick={handleListReportPdf} className="suppliers-action-button suppliers-report-button">
                                <i className="bi bi-file-earmark-text"></i>
                                List Report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="suppliers-stats-container">
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-given-icon">
                            <i className="bi bi-arrow-up-circle"></i>
                        </div>
                        <div className="suppliers-stat-content">
                            <div className="suppliers-stat-label">You Gave</div>
                            <div className="suppliers-stat-value" style={{ color: '#DE1110' }}>
                                {formatCurrency(overallTotals.given)}
                            </div>
                        </div>
                    </div>
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-received-icon">
                            <i className="bi bi-arrow-down-circle"></i>
                        </div>
                        <div className="suppliers-stat-content">
                            <div className="suppliers-stat-label">You Received</div>
                            <div className="suppliers-stat-value" style={{ color: '#10b981' }}>
                                {formatCurrency(overallTotals.received)}
                            </div>
                        </div>
                    </div>
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-online-icon">
                            <i className="bi bi-globe"></i>
                        </div>
                        <div className="suppliers-stat-content">
                            <div className="suppliers-stat-label">Online Collection</div>
                            <div className="suppliers-stat-value" style={{ color: '#021861' }}>
                                {formatCurrency(overallTotals.online)}
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="suppliers-error">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="suppliers-loading-state">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Loading suppliers...
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="suppliers-empty-state">
                        <div className="empty-icon">🏭</div>
                        <h4>No Suppliers Found</h4>
                        <p>Try adjusting your search criteria or click below to add your first supplier.</p>
                    </div>
                ) : (
                    <div className="suppliers-list-container">
                        {filteredSuppliers.map((supplier) => (
                            <div
                                key={supplier.id}
                                className="suppliers-customer-card"
                                onClick={() => handleSupplierClick(supplier.id)}
                            >
                                <div className="suppliers-customer-info">
                                    <SupplierAvatar
                                        imageSrc={supplier.profileImage}
                                        name={supplier.name}
                                    />
                                    <div className="suppliers-customer-details">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <h3 className="suppliers-customer-name">{supplier.name}</h3>
                                            {supplier.id ? (
                                                <span className="supplier-id-badge">#SUPP-{supplier.id}</span>
                                            ) : null}
                                        </div>
                                        <p className="suppliers-working-hours">
                                            <i className="bi bi-telephone me-1"></i>
                                            {supplier.phone || supplier.phoneNumber || 'N/A'}
                                        </p>
                                        <p className="suppliers-working-hours">
                                            <i className="bi bi-clock me-1"></i>
                                            {getRelativeTime(getLatestUpdatedAt(supplier))}
                                        </p>
                                    </div>
                                </div>
                                <div className={`suppliers-customer-amount ${
                                    supplier.balance === 0 ? 'balance-zero' :
                                        supplier.balance > 0 ? 'balance-positive' : 'balance-negative'
                                }`}>
                                    {supplier.balance < 0 ? '- ' : ''}
                                    {formatCurrency(Math.abs(supplier.balance))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sticky Bottom-Right Add Supplier Button */}
                <button
                    type="button"
                    className="suppliers-add-button"
                    onClick={handleAddSupplier}
                    title="Add Supplier"
                >
                    <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                    <span>Add Supplier</span>
                </button>
            </main>
        </div>
    );
};