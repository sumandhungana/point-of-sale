"use client"

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCustomers, Customer } from '../services/customerService';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import '../styles/CustomerListReportPdf.css';

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

    if (loading) {
        return (
            <div className="customer-report-container">
                <Sidebar />
                <main className="customer-report-main-content">
                    <div className="customer-report-content-container">
                        <div className="customer-report-loading">
                            <i className="bi bi-arrow-clockwise spin"></i>
                            Loading report data...
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="customer-report-container">
                <Sidebar />
                <main className="customer-report-main-content">
                    <div className="customer-report-content-container">
                        <div className="customer-report-error">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="customer-report-container">
            <Sidebar />
            
            <main className="customer-report-main-content">
                <div className="customer-report-content-container">
                    <div className="customer-report-button-container">
                        <button 
                            onClick={handleBack}
                            className="customer-report-back-button"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back to Customers
                        </button>
                        <button 
                            onClick={handleGeneratePdf}
                            className="customer-report-generate-button"
                        >
                            <i className="bi bi-file-earmark-pdf"></i>
                            Generate PDF
                        </button>
                    </div>

                    <div className="customer-report-logo-section">
                        <div className="customer-report-logo-container">
                            <div className="customer-report-logo-image">
                                <i className="bi bi-building"></i>
                            </div>
                            <div className="customer-report-company-name">{companyName}</div>
                        </div>
                        <div className="customer-report-print-option">
                            <input 
                                type="checkbox" 
                                id="printLogo" 
                                checked={printLogo} 
                                onChange={() => setPrintLogo(!printLogo)} 
                            />
                            <label htmlFor="printLogo">
                                <i className="bi bi-printer me-1"></i>
                                Print/book logo
                            </label>
                        </div>
                    </div>

                    <h1 className="customer-report-title">
                        <i className="bi bi-people-fill me-2"></i>
                        Customer List Report
                    </h1>
                    <p className="customer-report-date">
                        <i className="bi bi-calendar-event me-1"></i>
                        (generated: {new Date().toLocaleDateString()})
                    </p>

                    <div className="customer-report-summary-section">
                        <div className="customer-report-summary-item">
                            <p className="customer-report-summary-item-title">
                                <i className="bi bi-arrow-up-circle me-1"></i>
                                You Gave
                            </p>
                            <p className={`customer-report-summary-item-value customer-report-gave-value`}>
                                रू {totalGave.toLocaleString()}
                            </p>
                        </div>
                        <div className="customer-report-summary-divider"></div>
                        <div className="customer-report-summary-item">
                            <p className="customer-report-summary-item-title">
                                <i className="bi bi-arrow-down-circle me-1"></i>
                                You Received
                            </p>
                            <p className={`customer-report-summary-item-value customer-report-received-value`}>
                                रू {totalReceived.toLocaleString()}
                            </p>
                        </div>
                        <div className="customer-report-summary-divider"></div>
                        <div className="customer-report-summary-item">
                            <p className="customer-report-summary-item-title">
                                <i className="bi bi-calculator me-1"></i>
                                Net Balance
                            </p>
                            <p className={`customer-report-summary-item-value customer-report-net-value`}>
                                रू {netBalance.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="customer-report-customer-count">
                        <i className="bi bi-people me-1"></i>
                        No of Customer: {customers.length} (All)
                    </div>

                    <div className="customer-report-table-container">
                        <table className="customer-report-table">
                            <thead>
                                <tr>
                                    <th className="customer-report-table-header">
                                        <i className="bi bi-person me-1"></i>
                                        Name
                                    </th>
                                    <th className="customer-report-table-header">
                                        <i className="bi bi-telephone me-1"></i>
                                        Phone
                                    </th>
                                    <th className="customer-report-table-header">
                                        <i className="bi bi-arrow-up-circle me-1"></i>
                                        You Gave
                                    </th>
                                    <th className="customer-report-table-header">
                                        <i className="bi bi-arrow-down-circle me-1"></i>
                                        You Received
                                    </th>
                                    <th className="customer-report-table-header">
                                        <i className="bi bi-calculator me-1"></i>
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="customer-report-table-cell">{customer.name}</td>
                                        <td className="customer-report-table-cell">{customer.phone}</td>
                                        <td className={`customer-report-table-cell customer-report-gave-cell`}>
                                            {customer.balance < 0 ? `रू ${Math.abs(customer.balance).toLocaleString()}` : ""}
                                        </td>
                                        <td className={`customer-report-table-cell customer-report-received-cell`}>
                                            {customer.balance > 0 ? `रू ${customer.balance.toLocaleString()}` : ""}
                                        </td>
                                        <td className="customer-report-table-cell">
                                            {customer.balance !== 0 ? `रू ${Math.abs(customer.balance).toLocaleString()}` : "Settled"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="customer-report-footer">
                        <i className="bi bi-info-circle me-1"></i>
                        Company Details and Helpline Number
                    </div>
                </div>
            </main>
        </div>
    );
};

