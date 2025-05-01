"use client"

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCustomers, Customer } from '../services/customerService';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';

interface CustomerWithBalance extends Customer {  
    balance: number;
    paymentHistory: PaymentHistory[];
}

interface OverallTotals {
    given: number;
    received: number;
    online: number;
}

export const CustomerListReportPdf = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [printLogo, setPrintLogo] = useState(false);
    const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
    const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const companyName = localStorage.getItem('companyName') || 'Admin';

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

                // Calculate overall totals using the same logic as Customers page
                const totals = customersWithBalance.reduce((acc, customer) => {
                    customer.paymentHistory.forEach(payment => {
                        if (payment.type === 'Given') {
                            acc.given += Math.abs(payment.oldBalance - payment.newBalance);
                        } else if (payment.type === 'Received') {
                            acc.received += Math.abs(payment.oldBalance - payment.newBalance);
                        }
                    });
                    return acc;
                }, { given: 0, received: 0, online: 0 });

                setOverallTotals(totals);
                setLoading(false);
            } catch (err) {
                setError('Failed to load customers');
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const handleBack = () => {
        navigate('/parties/customers');
    };

    const handleGeneratePdf = () => {
        // TODO: Implement PDF generation logic with the actual data
        console.log('Generating PDF with logo:', printLogo);
    };

    // Calculate totals using the same logic as Customers page
    const totalGave = overallTotals.given - overallTotals.received < 0 ? 0 : overallTotals.given - overallTotals.received;
    const totalReceived = overallTotals.received - overallTotals.given < 0 ? 0 : overallTotals.received - overallTotals.given;
    const netBalance = totalReceived - totalGave;

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
        mainContent: {
            padding: '2rem',
            marginTop: '64px',
            maxWidth: 'calc(100% - 500px)',
            marginRight: '500px',
            width: '100%',
        },
        contentContainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            '&:hover': {
                background: '#5a6268',
            },
        },
        generateButton: {
            padding: '0.75rem 1.5rem',
            background: '#dc4c39',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            '&:hover': {
                background: '#c82333',
            },
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
        },
        logoSection: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        logoImage: {
            width: '50px',
            height: '50px',
            borderRadius: '4px',
            backgroundColor: '#dc4c39',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.5rem',
            color: 'white',
        },
        companyName: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#dc4c39',
        },
        printOption: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        reportTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
            textAlign: 'center' as const,
            marginBottom: '0.5rem',
            borderBottom: '2px solid #dc4c39',
            paddingBottom: '0.5rem',
        },
        reportDate: {
            color: '#6c757d',
            textAlign: 'center' as const,
            marginBottom: '1.5rem',
        },
        summarySection: {
            display: 'flex',
            justifyContent: 'space-around',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            border: '1px solid #dee2e6',
        },
        summaryItem: {
            textAlign: 'center' as const,
        },
        summaryItemTitle: {
            color: '#6c757d',
            marginBottom: '0.5rem',
        },
        summaryItemValue: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
        },
        gaveValue: {
            color: '#dc3545',
        },
        receivedValue: {
            color: '#28a745',
        },
        netValue: {
            color: '#17a2b8',
        },
        summaryDivider: {
            width: '1px',
            background: '#dee2e6',
        },
        customerCount: {
            color: '#6c757d',
            marginBottom: '1rem',
            padding: '0.5rem',
            background: '#f8f9fa',
            borderRadius: '4px',
            textAlign: 'center' as const,
        },
        tableContainer: {
            overflowX: 'auto' as const,
        },
        customerTable: {
            width: '100%',
            borderCollapse: 'collapse' as const,
        },
        tableHeader: {
            background: '#f8f9fa',
            padding: '0.75rem',
            textAlign: 'left' as const,
            borderBottom: '1px solid #dee2e6',
            color: '#212529',
            fontWeight: 'bold',
        },
        tableCell: {
            padding: '0.75rem',
            borderBottom: '1px solid #dee2e6',
        },
        gaveCell: {
            color: '#dc3545',
        },
        receivedCell: {
            color: '#28a745',
        },
        reportFooter: {
            textAlign: 'center' as const,
            color: '#6c757d',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #dee2e6',
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <Sidebar />
                <main style={styles.mainContent}>
                    <div style={styles.contentContainer}>
                        <div>Loading report data...</div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <Sidebar />
                <main style={styles.mainContent}>
                    <div style={styles.contentContainer}>
                        <div style={{ color: 'red' }}>{error}</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Sidebar />
            
            <main style={styles.mainContent}>
                <div style={styles.contentContainer}>
                    <div style={styles.logoSection}>
                        <div style={styles.logoContainer}>
                            <div style={styles.logoImage}>🏢</div>
                            <div style={styles.companyName}>{companyName}</div>
                        </div>
                        <div style={styles.printOption}>
                            <input 
                                type="checkbox" 
                                id="printLogo" 
                                checked={printLogo} 
                                onChange={() => setPrintLogo(!printLogo)} 
                            />
                            <label htmlFor="printLogo">Print/book logo</label>
                        </div>
                    </div>

                    <h1 style={styles.reportTitle}>Customer List Report</h1>
                    <p style={styles.reportDate}>
                        (generated: {new Date().toLocaleDateString()})
                    </p>

                    <div style={styles.summarySection}>
                        <div style={styles.summaryItem}>
                            <p style={styles.summaryItemTitle}>You Gave</p>
                            <p style={{...styles.summaryItemValue, ...styles.gaveValue}}>रू {totalGave.toLocaleString()}</p>
                        </div>
                        <div style={styles.summaryDivider}></div>
                        <div style={styles.summaryItem}>
                            <p style={styles.summaryItemTitle}>You Received</p>
                            <p style={{...styles.summaryItemValue, ...styles.receivedValue}}>रू {totalReceived.toLocaleString()}</p>
                        </div>
                        <div style={styles.summaryDivider}></div>
                        <div style={styles.summaryItem}>
                            <p style={styles.summaryItemTitle}>Net Balance</p>
                            <p style={{...styles.summaryItemValue, ...styles.netValue}}>रू {netBalance.toLocaleString()}</p>
                        </div>
                    </div>

                    <div style={styles.customerCount}>
                        No of Customer: {customers.length} (All)
                    </div>

                    <div style={styles.tableContainer}>
                        <table style={styles.customerTable}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Name</th>
                                    <th style={styles.tableHeader}>Phone</th>
                                    <th style={styles.tableHeader}>You Gave</th>
                                    <th style={styles.tableHeader}>You Received</th>
                                    <th style={styles.tableHeader}>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td style={styles.tableCell}>{customer.name}</td>
                                        <td style={styles.tableCell}>{customer.phone}</td>
                                        <td style={{...styles.tableCell, ...styles.gaveCell}}>
                                            {customer.balance < 0 ? `रू ${Math.abs(customer.balance).toLocaleString()}` : ""}
                                        </td>
                                        <td style={{...styles.tableCell, ...styles.receivedCell}}>
                                            {customer.balance > 0 ? `रू ${customer.balance.toLocaleString()}` : ""}
                                        </td>
                                        <td style={styles.tableCell}>
                                            {customer.balance !== 0 ? `रू ${Math.abs(customer.balance).toLocaleString()}` : "Settled"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.reportFooter}>
                        Company Details and Helpline Number
                    </div>
                </div>
            </main>
        </div>
    );
};

