import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getSuppliers, GetSupplierResponse } from '@/features/services/supplierService';
import { getPaymentList, GetPaymentResponse } from '@/features/services/paymentService';
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
                    backgroundColor: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#6c757d',
                    borderRadius: '50%',
                    width: '45px',
                    height: '45px',
                    minWidth: '45px',
                    userSelect: 'none',
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
                width: '45px',
                height: '45px',
                minWidth: '45px',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
            }}
            onError={() => setImgError(true)}
        />
    );
};

export const Suppliers = () => {
    const navigate = useNavigate();
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
                            const paymentHistory =await getPaymentList({
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
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="suppliers-filter-select"
                        >
                            <option value="all">All Suppliers</option>
                            <option value="positive">Positive Balance</option>
                            <option value="negative">Negative Balance</option>
                            <option value="zero">Zero Balance</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="suppliers-filter-select"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="balance">Sort by Balance</option>
                            <option value="recent">Sort by Recent</option>
                        </select>
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
                        <div className="suppliers-stat-label">You Gave</div>
                        <div className="suppliers-stat-value">
                            रु{overallTotals.given.toLocaleString()}
                        </div>
                    </div>
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-received-icon">
                            <i className="bi bi-arrow-down-circle"></i>
                        </div>
                        <div className="suppliers-stat-label">You Received</div>
                        <div className="suppliers-stat-value">
                            रु{overallTotals.received.toLocaleString()}
                        </div>
                    </div>
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-online-icon">
                            <i className="bi bi-globe"></i>
                        </div>
                        <div className="suppliers-stat-label">Online Collection</div>
                        <div className="suppliers-stat-value">
                            रु{overallTotals.online.toLocaleString()}
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
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                        Loading suppliers...
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                        No suppliers found.
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
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
                                    <h3 className="suppliers-customer-name">{supplier.name}</h3>
                                    <p className="suppliers-working-hours">
                                        <i className="bi bi-telephone me-1"></i>
                                        {supplier.phone || supplier.phoneNumber || 'N/A'}
                                    </p>
                                </div>
                                <div className={`suppliers-customer-amount ${
                                    supplier.balance === 0 ? 'balance-zero' :
                                        supplier.balance > 0 ? 'balance-positive' : 'balance-negative'
                                }`}>
                                    रु{Math.abs(supplier.balance).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                <div className="suppliers-actions">
                    <button
                        className="suppliers-add-button"
                        onClick={handleAddSupplier}
                    >
                        <i className="bi bi-plus-circle"></i>
                        Add Supplier
                    </button>
                </div>
            </main>
        </div>
    );
};