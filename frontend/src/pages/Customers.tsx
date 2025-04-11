import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

export const Customers = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [viewReport, setViewReport] = useState(false);
    const [openCashbook, setOpenCashbook] = useState(false);

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
                        <div style={styles.cardAmount}>रू25,000</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>You Receive</div>
                        <div style={styles.cardAmount}>रू15,000</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>Online Collection</div>
                        <div style={styles.cardAmount}>रू10,000</div>
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

                <div 
                    style={styles.customerCard}
                    onClick={() => handleCustomerClick('1')}
                >
                    <div style={styles.customerInfo}>
                        <div style={styles.profileImage} />
                        <div style={styles.customerDetails}>
                            <h3 style={styles.customerName}>John Doe</h3>
                            <p style={styles.workingHours}>Working Hours: 9 AM - 6 PM</p>
                        </div>
                        <div style={styles.customerAmount}>Rs. 15,000</div>
                    </div>
                </div>

                <div 
                    style={styles.customerCard}
                    onClick={() => handleCustomerClick('2')}
                >
                    <div style={styles.customerInfo}>
                        <div style={styles.profileImage} />
                        <div style={styles.customerDetails}>
                            <div style={styles.customerName}>Sarah Smith</div>
                            <div style={styles.workingHours}>Working Hours: 6 hours / day</div>
                        </div>
                        <div style={styles.customerAmount}>रू 3,500</div>
                    </div>
                </div>

                <div 
                    style={styles.customerCard}
                    onClick={() => handleCustomerClick('3')}
                >
                    <div style={styles.customerInfo}>
                        <div style={styles.profileImage} />
                        <div style={styles.customerDetails}>
                            <div style={styles.customerName}>Michael Johnson</div>
                            <div style={styles.workingHours}>Working Hours: 7 hours / day</div>
                        </div>
                        <div style={styles.customerAmount}>रू 4,200</div>
                    </div>
                </div>

                <div 
                    style={styles.customerCard}
                    onClick={() => handleCustomerClick('4')}
                >
                    <div style={styles.customerInfo}>
                        <div style={styles.profileImage} />
                        <div style={styles.customerDetails}>
                            <div style={styles.customerName}>Emma Wilson</div>
                            <div style={styles.workingHours}>Working Hours: 5 hours / day</div>
                        </div>
                        <div style={styles.customerAmount}>रू 2,800</div>
                    </div>
                </div>

                <div 
                    style={styles.customerCard}
                    onClick={() => handleCustomerClick('5')}
                >
                    <div style={styles.customerInfo}>
                        <div style={styles.profileImage} />
                        <div style={styles.customerDetails}>
                            <div style={styles.customerName}>David Brown</div>
                            <div style={styles.workingHours}>Working Hours: 9 hours / day</div>
                        </div>
                        <div style={styles.customerAmount}>रू 6,500</div>
                    </div>
                </div>

                <button 
                    style={styles.addCustomerButton}
                    onClick={handleAddCustomer}
                >
                    + Add Customer
                </button>

                <div>
                    <h2>Customer List</h2>
                    {/* Add your customer table or list here */}
                </div>
            </main>
        </div>
    );
}; 