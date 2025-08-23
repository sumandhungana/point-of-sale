import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getSuppliers, Customer } from '../services/customerService';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { toast } from 'react-toastify';
import '../styles/Suppliers.css';

interface SupplierWithBalance extends Customer {
    balance: number;
    paymentHistory: PaymentHistory[];
}

interface OverallTotals {
    given: number;
    received: number;
    online: number;
}

export const Suppliers = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [viewReport, setViewReport] = useState(false);
    const [openCashbook, setOpenCashbook] = useState(false);
    const [suppliers, setSuppliers] = useState<SupplierWithBalance[]>([]);
    const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await getSuppliers();
                const suppliersWithBalance = await Promise.all(
                    data.map(async (supplier: Customer) => {
                        try {
                            const paymentHistory = await getPaymentHistory(supplier.id);
                            const balance = paymentHistory.reduce((acc: number, payment: PaymentHistory) => {
                                if (payment.type === 'Received') {
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

                // Calculate overall totals
                const totals = suppliersWithBalance.reduce((acc: { given: number; received: number; online: number }, supplier: SupplierWithBalance) => {
                    supplier.paymentHistory.forEach((payment: PaymentHistory) => {
                        if (payment.type === 'Given') {
                            acc.given += payment.amount;
                        } else if (payment.type === 'Received') {
                            acc.received += payment.amount;
                        }
                    });
                    return acc;
                }, { given: 0, received: 0, online: 0 });

                setOverallTotals(totals);
                setLoading(false);
            } catch (err) {
                setError('Failed to load suppliers');
                setLoading(false);
                toast.error('Failed to load suppliers');
            }
        };

        fetchSuppliers();
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

    const handleSupplierClick = (supplierId: string) => {
        navigate(`/parties/supplier/statements/${supplierId}`);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
        mainContent: {
            padding: '2rem',
            maxWidth: 'calc(100% - 500px)',
            marginRight: '500px',
            width: '100%',
        },
        searchContainer: {
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '1rem',
        },
        searchBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap' as const,
        },
        searchInput: {
            flex: 2,
            padding: '0.75rem 1rem',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '1rem',
            minWidth: '200px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:focus': {
                outline: 'none',
                borderColor: '#dc4c39',
                boxShadow: '0 0 0 2px rgba(220, 76, 57, 0.1)',
            },
        },
        filterGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: '200px',
        },
        select: {
            padding: '0.75rem 1rem',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '0.875rem',
            flex: 1,
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:focus': {
                outline: 'none',
                borderColor: '#dc4c39',
                boxShadow: '0 0 0 2px rgba(220, 76, 57, 0.1)',
            },
        },
        label: {
            fontSize: '0.875rem',
            color: '#6c757d',
            whiteSpace: 'nowrap',
        },
        actionButtons: {
            display: 'flex',
            gap: '0.75rem',
            marginLeft: 'auto',
        },
        button: {
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        primaryButton: {
            background: '#dc4c39',
            color: 'white',
        },
        secondaryButton: {
            background: '#f8f9fa',
            color: '#212529',
            border: '1px solid #dee2e6',
        },
        filterButtons: {
            display: 'flex',
            gap: '1rem',
        },
        cardsContainer: {
            display: 'flex',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            borderBottom: '1px solid #dee2e6',
        },
        card: {
            flex: 1,
            padding: '1.5rem',
            borderRight: '1px solid #dee2e6',
            '&:last-child': {
                borderRight: 'none',
            },
        },
        cardHeader: {
            fontSize: '1rem',
            color: '#6c757d',
            marginBottom: '0.5rem',
        },
        cardAmount: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
        },
        checkboxCard: {
            display: 'flex',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden',
        },
        checkboxCardItem: {
            flex: 1,
            padding: '1rem 1.5rem',
            borderRight: '1px solid #dee2e6',
            '&:last-child': {
                borderRight: 'none',
            },
        },
        checkboxGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        checkbox: {
            width: '16px',
            height: '16px',
            cursor: 'pointer',
        },
        checkboxLabel: {
            fontSize: '0.875rem',
            color: '#212529',
            cursor: 'pointer',
        },
        supplierCard: {
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '1rem',
            marginTop: '1rem',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
        },
        supplierInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
        },
        profileImage: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover' as const,
            backgroundColor: '#e9ecef',
        },
        supplierDetails: {
            flex: 1,
        },
        supplierName: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '0.25rem',
        },
        workingHours: {
            fontSize: '0.875rem',
            color: '#6c757d',
        },
        supplierAmount: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#dc4c39',
            paddingLeft: '1.5rem',
            borderLeft: '2px solid #dee2e6',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
        },
        addSupplierButton: {
            padding: '0.75rem 1.5rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            marginLeft: 'auto',
            '&:hover': {
                background: '#218838',
            },
        },
    };

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

                <div className="suppliers-stats-container">
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-given-icon">
                            <i className="bi bi-arrow-up-circle"></i>
                        </div>
                        <div className="suppliers-stat-value">
                            रु{(overallTotals.given - overallTotals.received < 0 ? 0 : overallTotals.given - overallTotals.received).toLocaleString()}
                        </div>
                        <div className="suppliers-stat-label">You Give</div>
                    </div>
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-received-icon">
                            <i className="bi bi-arrow-down-circle"></i>
                        </div>
                        <div className="suppliers-stat-value">
                            रु{(overallTotals.received - overallTotals.given < 0 ? 0 : overallTotals.received - overallTotals.given).toLocaleString()}
                        </div>
                        <div className="suppliers-stat-label">You Receive</div>
                    </div>
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-online-icon">
                            <i className="bi bi-globe"></i>
                        </div>
                        <div className="suppliers-stat-value">
                            रु{overallTotals.online.toLocaleString()}
                        </div>
                        <div className="suppliers-stat-label">Online Collection</div>
                    </div>
                </div>

                <div className="suppliers-list-container">
                    <h3 className="suppliers-list-title">
                        <i className="bi bi-people"></i>
                        Suppliers List
                    </h3>

                    {loading ? (
                        <div className="suppliers-loading">
                            <i className="bi bi-hourglass-split me-2"></i>
                            Loading suppliers...
                        </div>
                    ) : error ? (
                        <div className="suppliers-error">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    ) : suppliers.length === 0 ? (
                        <div className="suppliers-no-suppliers">
                            <i className="bi bi-inbox me-2"></i>
                            No suppliers found
                        </div>
                    ) : (
                        suppliers.map((supplier) => (
                            <div 
                                key={supplier.id}
                                className="suppliers-card"
                                onClick={() => handleSupplierClick(supplier.id.toString())}
                            >
                                {supplier.profileImage ? (
                                    <img 
                                        src={`http://localhost:5000${supplier.profileImage}`} 
                                        alt={supplier.name}
                                        className="suppliers-profile-image"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                                            if (nextSibling) {
                                                nextSibling.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="suppliers-profile-placeholder">
                                        <i className="bi bi-person"></i>
                                    </div>
                                )}
                                <div className="suppliers-info">
                                    <div className="suppliers-name">{supplier.name}</div>
                                    <div className="suppliers-details">
                                        <i className="bi bi-person-badge me-1"></i>
                                        Contact: {supplier.ContactPerson || 'N/A'}
                                    </div>
                                </div>
                                <div className={`suppliers-balance ${
                                    supplier.balance === 0 ? 'suppliers-balance-zero' : 
                                    supplier.balance > 0 ? 'suppliers-balance-positive' : 'suppliers-balance-negative'
                                }`}>
                                    रु{Math.abs(supplier.balance).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button 
                        className="suppliers-action-button suppliers-add-button"
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