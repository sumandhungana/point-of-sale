import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getCustomers, Customer } from '../services/customerService';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { toast } from 'react-toastify';

interface CustomerWithBalance extends Customer {
    balance: number;
    paymentHistory: PaymentHistory[];
}

interface OverallTotals {
    given: number;
    received: number;
    online: number;
}

export const Customers = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [viewReport, setViewReport] = useState(false);
    const [openCashbook, setOpenCashbook] = useState(false);
    const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
    const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getCustomers();
                const customersWithBalance = await Promise.all(
                    data.map(async (customer) => {
                        try {
                            const paymentHistory = await getPaymentHistory(customer.id);
                            const balance = paymentHistory.reduce((acc, payment) => {
                                if (payment.type === 'Received') {
                                    return acc + payment.amount;
                                } else {
                                    return acc - payment.amount;
                                }
                            }, 0);
                            return { ...customer, balance, paymentHistory };
                        } catch (err) {
                            console.error(`Failed to fetch payment history for customer ${customer.id}:`, err);
                            return { ...customer, balance: 0, paymentHistory: [] };
                        }
                    })
                );
                setCustomers(customersWithBalance);
                setLoading(false);
            } catch (err) {
                setError('Failed to load customers');
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const handleAddCustomer = () => {
        navigate('/parties/customers/add');
    };

    const handleBulkReminder = () => {
        navigate('/parties/customers/list-report-pdf');
    };

    const handleCustomerClick = (customerId: string) => {
        navigate(`/parties/customers/statements/${customerId}`);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
        mainContent: {
            padding: '2rem',
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
        },
        searchInput: {
            flex: 1,
            padding: '0.5rem 1rem',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '1rem',
        },
        filterContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
        },
        filterGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
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
        select: {
            padding: '0.5rem',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '0.875rem',
        },
        label: {
            fontSize: '0.875rem',
            color: '#6c757d',
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
        customerCard: {
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
        customerInfo: {
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
        customerDetails: {
            flex: 1,
        },
        customerName: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '0.25rem',
        },
        workingHours: {
            fontSize: '0.875rem',
            color: '#6c757d',
        },
        customerAmount: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#dc4c39',
            paddingLeft: '1.5rem',
            borderLeft: '2px solid #dee2e6',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
        },
        addCustomerButton: {
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
        <div style={styles.container}>
            <Sidebar />
            <main style={styles.mainContent}>
                <div style={styles.searchContainer}>
                    <div style={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        <button 
                            style={{ ...styles.button, ...styles.primaryButton }}
                            onClick={handleBulkReminder}
                        >
                            Bulk Reminder
                        </button>
                    </div>

                    <div style={styles.filterContainer}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={styles.filterGroup}>
                                <label style={styles.label}>Filter by:</label>
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div style={styles.filterGroup}>
                                <label style={styles.label}>Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="name">Name</option>
                                    <option value="date">Date Added</option>
                                    <option value="balance">Balance</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.filterButtons}>
                            <button style={{ ...styles.button, ...styles.secondaryButton }}>
                                Filter
                            </button>
                            <button style={{ ...styles.button, ...styles.secondaryButton }}>
                                PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div style={styles.cardsContainer}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>You Give</div>
                        <div style={styles.cardAmount}>₹{overallTotals.given.toLocaleString()}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>You Receive</div>
                        <div style={styles.cardAmount}>₹{overallTotals.received.toLocaleString()}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>Online Collection</div>
                        <div style={styles.cardAmount}>₹{overallTotals.online.toLocaleString()}</div>
                    </div>
                </div>

                <div style={styles.checkboxCard}>
                    <div style={styles.checkboxCardItem}>
                        <div style={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="viewReport"
                                checked={viewReport}
                                onChange={(e) => setViewReport(e.target.checked)}
                                style={styles.checkbox}
                            />
                            <label htmlFor="viewReport" style={styles.checkboxLabel}>
                                View Report
                            </label>
                        </div>
                    </div>
                    <div style={styles.checkboxCardItem}>
                        <div style={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="openCashbook"
                                checked={openCashbook}
                                onChange={(e) => setOpenCashbook(e.target.checked)}
                                style={styles.checkbox}
                            />
                            <label htmlFor="openCashbook" style={styles.checkboxLabel}>
                                Open Cashbook
                            </label>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading customers...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
                ) : (
                    customers.map((customer) => (
                        <div 
                            key={customer.id}
                            style={styles.customerCard}
                            onClick={() => handleCustomerClick(customer.id.toString())}
                        >
                            <div style={styles.customerInfo}>
                                <div style={styles.profileImage} />
                                <div style={styles.customerDetails}>
                                    <h3 style={styles.customerName}>{customer.name}</h3>
                                    <p style={styles.workingHours}>Working Hours: 0</p>
                                </div>
                                <div style={{
                                    ...styles.customerAmount,
                                    color: customer.balance >= 0 ? '#28a745' : '#dc3545'
                                }}>
                                    ₹{Math.abs(customer.balance).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                <button 
                    style={styles.addCustomerButton}
                    onClick={handleAddCustomer}
                >
                    + Add Customer
                </button>
            </main>
        </div>
    );
}; 