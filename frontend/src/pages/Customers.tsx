import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getCustomers, Customer } from '../services/customerService';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { toast } from 'react-toastify';
import '../styles/Customers.css';

interface CustomerWithBalance extends Customer {
    balance: number;
    paymentHistory: PaymentHistory[];
    profileImage?: string;
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
    const [sortBy, setSortBy] = useState('mostRecent');
    const [viewReport, setViewReport] = useState(false);
    const [openCashbook, setOpenCashbook] = useState(false);
    const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
    const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });

    const [error, setError] = useState<string | null>(null);
    const [openReport, setOpenReport] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getCustomers();
                const customersWithBalance = await Promise.all(
                    data.map(async (customer) => {
                        try {
                            console.log('Fetching payment history for customer:', customer.id, customer.name);
                            const paymentHistory = await getPaymentHistory(customer.id);
                            console.log('Received payment history for', customer.name, ':', paymentHistory);
                            const balance = paymentHistory.reduce((acc, payment) => {
                                if (payment.type === 'Received') {
                                    return acc + payment.amount;
                                } else {
                                    return acc - payment.amount;
                                }
                            }, 0);
                            console.log('Calculated balance for', customer.name, ':', balance);
                            return { ...customer, balance, paymentHistory };
                        } catch (err) {
                            console.error(`Failed to fetch payment history for customer ${customer.id}:`, err);
                            return { ...customer, balance: 0, paymentHistory: [] };
                        }
                    })
                );
                setCustomers(customersWithBalance);

                // Calculate overall totals using combined balance logic
                console.log('Calculating overall totals from customers:', customersWithBalance);
                const totals = customersWithBalance.reduce((acc, customer) => {
                    console.log('Processing customer:', customer.name, 'Payment history:', customer.paymentHistory);
                    customer.paymentHistory.forEach(payment => {
                        console.log('Processing payment for', customer.name, ':', payment);
                        if (payment.type === 'Given') {
                            acc.given += payment.amount;
                            console.log('Added to given:', payment.amount, 'Total given now:', acc.given);
                        } else if (payment.type === 'Received') {
                            acc.received += payment.amount;
                            console.log('Added to received:', payment.amount, 'Total received now:', acc.received);
                        }
                    });
                    return acc;
                }, { given: 0, received: 0, online: 0 });

                // Use raw totals (no subtracting) as requested
                console.log('Final overall totals (raw):', { given: totals.given, received: totals.received, online: totals.online });
                setOverallTotals({ given: totals.given, received: totals.received, online: totals.online });
            } catch (err) {
                setError('Failed to load customers');
            }
        };

        fetchCustomers();
    }, []);

    const handleAddCustomer = () => {
        navigate('/parties/customers/add');
    };

    const handleBulkReminder = () => {

    };

    const handleCustomerClick = (customer: CustomerWithBalance) => {
        try {
            console.log('Clicking customer:', customer);
            
            // Use only the fields that are available in the Customer interface
            const customerData = {
                id: customer.id,
                name: customer.name || 'Unknown Customer',
                phone: customer.phone || customer.phoneNumber || null,
                email: customer.email || null,
                address: customer.address || null,
                company: customer.company || null,
                pan: customer.pan || null,
                contactPerson: customer.ContactPerson || null,
                isSupplier: customer.isSupplier || false,
                createdAt: customer.createdAt || new Date().toISOString(),
                updatedAt: customer.updatedAt || new Date().toISOString(),
                bankAccount: null, // Not available in Customer interface
                cashBalance: 0, // Not available in Customer interface
                profileImage: customer.profileImage || null,
                customerSmsSetting: false, // Not available in Customer interface
                smsLanguage: false, // Not available in Customer interface
                transactionHistoryCheck: false, // Not available in Customer interface
                paymentHistory: customer.paymentHistory || []
            };

            console.log('Navigating with customer data:', customerData);
            console.log('Navigating to URL:', `/parties/customers/statements/${customer.id}`);

            // Test navigation - try without state first
            console.log('Attempting navigation...');
            
            navigate(`/parties/customers/statements/${customer.id}`, { 
                state: { 
                    customer: customerData
                } 
            });
        } catch (error) {
            console.error('Error navigating to customer statements:', error);
            toast.error('Failed to open customer statements');
        }
    };

    const filteredAndSortedCustomers = customers
        .filter(customer => {
            // Search filter
            if (searchQuery && !customer.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            
            // Balance filter
            switch (filterBy) {
                case 'toReceive':
                    return customer.balance > 0;
                case 'toGive':
                    return customer.balance < 0;
                case 'settled':
                    return customer.balance === 0;
                default:
                    return true;
            }
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'mostRecent':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'highestAmount':
                    return Math.abs(b.balance) - Math.abs(a.balance);
                case 'leastAmount':
                    return Math.abs(a.balance) - Math.abs(b.balance);
                case 'byName':
                    return a.name.localeCompare(b.name);
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default:
                    return 0;
            }
        });

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
            paddingTop: '40px',
        },
        mainContent: {
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            '@media (max-width: 768px)': {
                padding: '1rem',
                maxWidth: '100%',
                margin: '0',
            },
        },
        searchContainer: {
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '1rem',
            '@media (max-width: 768px)': {
                padding: '1rem',
                marginBottom: '0.5rem',
            },
        },
        searchBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap' as const,
            '@media (max-width: 768px)': {
                flexDirection: 'column' as const,
                gap: '0.75rem',
                marginBottom: '0.5rem',
            },
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
            '@media (max-width: 768px)': {
                flex: 'none',
                width: '100%',
                minWidth: 'auto',
                fontSize: '16px', // Prevents zoom on iOS
            },
        },
        filterGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: '200px',
            '@media (max-width: 768px)': {
                flex: 'none',
                width: '100%',
                minWidth: 'auto',
            },
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
            '@media (max-width: 768px)': {
                fontSize: '16px', // Prevents zoom on iOS
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
            '@media (max-width: 768px)': {
                marginLeft: '0',
                width: '100%',
                justifyContent: 'space-between',
            },
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
            '@media (max-width: 768px)': {
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                flex: 1,
                justifyContent: 'center',
            },
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
            '@media (max-width: 768px)': {
                flexDirection: 'column' as const,
                marginBottom: '0.5rem',
            },
        },
        card: {
            flex: 1,
            padding: '1.5rem',
            borderRight: '1px solid #dee2e6',
            '&:last-child': {
                borderRight: 'none',
            },
            '@media (max-width: 768px)': {
                padding: '1rem',
                borderRight: 'none',
                borderBottom: '1px solid #dee2e6',
                '&:last-child': {
                    borderBottom: 'none',
                },
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
            '@media (max-width: 768px)': {
                fontSize: '1.25rem',
            },
        },
        checkboxCard: {
            display: 'flex',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            '@media (max-width: 768px)': {
                flexDirection: 'column' as const,
                marginBottom: '0.5rem',
            },
        },
        checkboxCardItem: {
            flex: 1,
            padding: '1rem 1.5rem',
            borderRight: '1px solid #dee2e6',
            '&:last-child': {
                borderRight: 'none',
            },
            '@media (max-width: 768px)': {
                padding: '0.75rem 1rem',
                borderRight: 'none',
                borderBottom: '1px solid #dee2e6',
                '&:last-child': {
                    borderBottom: 'none',
                },
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
            '@media (max-width: 768px)': {
                width: '20px',
                height: '20px',
            },
        },
        checkboxLabel: {
            fontSize: '0.875rem',
            color: '#212529',
            cursor: 'pointer',
            '@media (max-width: 768px)': {
                fontSize: '1rem',
                padding: '0.25rem 0',
            },
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
            '@media (max-width: 768px)': {
                padding: '1rem',
                marginBottom: '0.75rem',
                marginTop: '0.75rem',
                minHeight: '80px', // Better touch target
                display: 'flex',
                alignItems: 'center',
            },
        },
        customerInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            '@media (max-width: 768px)': {
                gap: '1rem',
                flexDirection: 'column' as const,
                alignItems: 'flex-start',
            },
        },
        profileImage: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover' as const,
            backgroundColor: '#e9ecef',
            '@media (max-width: 768px)': {
                width: '50px',
                height: '50px',
            },
        },
        customerDetails: {
            flex: 1,
            '@media (max-width: 768px)': {
                width: '100%',
            },
        },
        customerName: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '0.25rem',
            '@media (max-width: 768px)': {
                fontSize: '1.1rem',
            },
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
            '@media (max-width: 768px)': {
                fontSize: '1.25rem',
                paddingLeft: '0',
                borderLeft: 'none',
                borderTop: '1px solid #dee2e6',
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
                justifyContent: 'center',
            },
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
            '@media (max-width: 768px)': {
                width: '100%',
                marginLeft: '0',
                justifyContent: 'center',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
            },
        },
    };

    const handleListReportPdf = () => {
        navigate('/parties/customers/list-report-pdf');
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <main style={styles.mainContent} className="customers-main-content">
                <div className="customers-search-container">
                    <div className="customers-search-row">
                        <div className="customers-search-group">
                            <i className="bi bi-search customers-search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="customers-search-input"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="customers-filter-select"
                        >
                            <option value="mostRecent">Sort by Most Recent</option>
                            <option value="highestAmount">Sort by Highest Amount</option>
                            <option value="leastAmount">Sort by Least Amount</option>
                            <option value="byName">Sort by Name</option>
                            <option value="oldest">Sort by Oldest</option>
                        </select>
                        <div className="customers-action-buttons">
                            <button 
                                className="customers-action-button customers-primary-button"
                                onClick={handleBulkReminder}
                            >
                                <i className="bi bi-bell"></i>
                                Bulk Reminder
                            </button>
                            <button 
                                className="customers-action-button customers-secondary-button"
                                onClick={handleListReportPdf}
                            >
                                <i className="bi bi-file-earmark-text"></i>
                                PDF Report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="customers-cards-container">
                    <div className="customers-card">
                        <div className="customers-card-icon customers-card-give-icon">
                            <i className="bi bi-arrow-up-circle"></i>
                        </div>
                        <div className="customers-card-header">You Gave</div>
                        <div className="customers-card-amount" style={{ color: '#dc3545' }}>
                            रु{overallTotals.given.toLocaleString()}
                        </div>
                    </div>
                    <div className="customers-card">
                        <div className="customers-card-icon customers-card-receive-icon">
                            <i className="bi bi-arrow-down-circle"></i>
                        </div>
                        <div className="customers-card-header">You Received</div>
                        <div className="customers-card-amount" style={{ color: '#28a745' }}>
                            रु{overallTotals.received.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="customers-checkbox-container">
                    <div className="customers-checkbox-item">
                        <div className="customers-checkbox-group">
                            <input
                                type="checkbox"
                                id="viewReport"
                                checked={viewReport}
                                onChange={(e) => setViewReport(e.target.checked)}
                                className="customers-checkbox"
                            />
                            <label htmlFor="viewReport" className="customers-checkbox-label">
                                <i className="bi bi-eye me-1"></i>
                                View Report
                            </label>
                        </div>
                    </div>
                    <div className="customers-checkbox-item">
                        <div className="customers-checkbox-group">
                            <input
                                type="checkbox"
                                id="openCashbook"
                                checked={openCashbook}
                                onChange={(e) => setOpenCashbook(e.target.checked)}
                                className="customers-checkbox"
                            />
                            <label htmlFor="openCashbook" className="customers-checkbox-label">
                                <i className="bi bi-cash-stack me-1"></i>
                                Open Cashbook
                            </label>
                        </div>
                    </div>
                    <div className="customers-checkbox-item">
                        <div className="customers-checkbox-group">
                            <input
                                type="checkbox"
                                id="openReport"
                                checked={openReport}
                                onChange={(e) => setOpenReport(e.target.checked)}
                                className="customers-checkbox"
                            />
                            <label htmlFor="openReport" className="customers-checkbox-label">
                                <i className="bi bi-file-earmark-text me-1"></i>
                                Open Report
                            </label>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="customers-error">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}
                {filteredAndSortedCustomers.map((customer) => (
                        <div 
                            key={customer.id}
                            style={styles.customerCard}
                            className="customers-customer-card"
                            onClick={() => handleCustomerClick(customer)}
                        >
                            <div style={styles.customerInfo} className="customers-customer-info">
                                {customer.profileImage ? (
                                    <img 
                                        src={customer.profileImage} 
                                        alt={customer.name}
                                        style={styles.profileImage}
                                        className="customers-profile-image"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                                            if (nextSibling) {
                                                nextSibling.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div 
                                        style={{
                                            ...styles.profileImage,
                                            backgroundColor: '#e9ecef',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            color: '#6c757d'
                                        }}
                                        className="customers-profile-image"
                                    >
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div style={styles.customerDetails} className="customers-customer-details">
                                    <h3 style={styles.customerName} className="customers-customer-name">{customer.name}</h3>
                                    <p className="customers-working-hours">
                                        <i className="bi bi-telephone me-1"></i>
                                        {customer.phone || customer.phoneNumber || 'N/A'}
                                    </p>
                                    <p className="customers-working-hours">
                                        <i className="bi bi-clock me-1"></i>
                                        0
                                    </p>
                                </div>
                                                                 <div className={`customers-customer-amount ${
                                     customer.balance === 0 ? 'balance-zero' : 
                                     customer.balance > 0 ? 'balance-positive' : 'balance-negative'
                                 }`}>
                                     रु{Math.abs(customer.balance).toLocaleString()}
                                 </div>
                            </div>
                        </div>
                    ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        className="customers-add-button"
                        onClick={handleAddCustomer}
                    >
                        <i className="bi bi-plus-circle"></i>
                        Add Customer
                    </button>
                </div>
            </main>
        </div>
    );
}; 