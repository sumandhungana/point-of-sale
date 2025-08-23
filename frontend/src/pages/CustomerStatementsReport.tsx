"use client"

import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PaymentHistory } from '../services/paymentService';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'react-toastify';
import CustomerStatementsPDFTemplate from '../components/CustomerStatementsPDFTemplate';
import '../styles/CustomerStatementsReport.css';

interface CustomerData {
    name: string;
    phoneNumber: string;
    profileImage: string | null;
    balance: number;
    paymentHistory: PaymentHistory[];
}

interface ReportData {
    customer: CustomerData;
    paymentHistory: PaymentHistory[];
    totals: {
        given: number;
        received: number;
    };
}

export const CustomerStatementsReport = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const contentRef = useRef<HTMLDivElement>(null);
    const { customer, paymentHistory, totals } = location.state as ReportData || {
        customer: {
            name: '',
            phoneNumber: '',
            profileImage: null,
            balance: 0,
            paymentHistory: []
        },
        paymentHistory: [],
        totals: { given: 0, received: 0 }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortOption, setSortOption] = useState("date-desc");
    const [filterOption, setFilterOption] = useState("all");
    const [printLogo, setPrintLogo] = useState(false);

    const handleBack = () => {
        navigate(`/parties/customers/statements/${id}`);
    };

    const handleGeneratePdf = async () => {
        try {
            const blob = await pdf(
                <CustomerStatementsPDFTemplate data={{
                    customer,
                    paymentHistory: filteredTransactions,
                    totals: {
                        given: totalGave,
                        received: totalReceived
                    }
                }} />
            ).toBlob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `customer-statement-${customer.name}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    // Calculate totals
    const totalGave = totals.given;
    const totalReceived = totals.received;
    const netBalance = totalReceived - totalGave;

    // Filter and sort transactions
    const filteredTransactions = paymentHistory
        .filter(transaction => {
            const matchesSearch = transaction.remarks.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterOption === 'all' || 
                (filterOption === 'gave' && transaction.type === 'Given') ||
                (filterOption === 'received' && transaction.type === 'Received');
            const matchesDate = (!startDate || new Date(transaction.createdAt) >= new Date(startDate)) &&
                (!endDate || new Date(transaction.createdAt) <= new Date(endDate));
            return matchesSearch && matchesFilter && matchesDate;
        })
        .sort((a, b) => {
            switch (sortOption) {
                case 'date-desc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'date-asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'amount-desc':
                    return Math.abs(b.amount) - Math.abs(a.amount);
                case 'amount-asc':
                    return Math.abs(a.amount) - Math.abs(b.amount);
                default:
                    return 0;
            }
        });

    return (
        <div className="customer-statements-report-page">
            <Sidebar />
         
            <main className="customer-statements-report-main-content">
                <div ref={contentRef} className="customer-statements-report-content-container">
                    <div className="customer-statements-report-header">
                        <button className="customer-statements-report-back-button" onClick={handleBack}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="customer-statements-report-title">
                            <i className="bi bi-file-earmark-text me-2"></i>
                            Report of {customer.name}
                        </h1>
                    </div>

                    <div className="customer-statements-report-controls-card">
                        <div className="customer-statements-report-controls-row">
                            <div className="customer-statements-report-search-container">
                                <i className="bi bi-search customer-statements-report-search-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Search remarks"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="customer-statements-report-search-input"
                                />
                            </div>
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="customer-statements-report-dropdown">
                                <option value="date-desc">Sort: Date (Newest)</option>
                                <option value="date-asc">Sort: Date (Oldest)</option>
                                <option value="amount-desc">Sort: Amount (High to Low)</option>
                                <option value="amount-asc">Sort: Amount (Low to High)</option>
                            </select>
                            <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} className="customer-statements-report-dropdown">
                                <option value="all">Filter: All</option>
                                <option value="gave">Filter: You Gave</option>
                                <option value="received">Filter: You Received</option>
                            </select>
                        </div>

                        <div className="customer-statements-report-date-controls">
                            <div className="customer-statements-report-date-input">
                                <label className="customer-statements-report-date-label">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="customer-statements-report-date-select"
                                />
                            </div>
                            <div className="customer-statements-report-date-input">
                                <label className="customer-statements-report-date-label">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    End Date
                                </label>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="customer-statements-report-date-select"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="customer-statements-report-summary-section">
                        <div className="customer-statements-report-summary-item">
                            <div className="customer-statements-report-summary-title">Total Given</div>
                            <div className="customer-statements-report-summary-value customer-statements-report-gave-value">
                                रु{totalGave.toLocaleString()}
                            </div>
                        </div>
                        <div className="customer-statements-report-summary-divider"></div>
                        <div className="customer-statements-report-summary-item">
                            <div className="customer-statements-report-summary-title">Total Received</div>
                            <div className="customer-statements-report-summary-value customer-statements-report-received-value">
                                रु{totalReceived.toLocaleString()}
                            </div>
                        </div>
                        <div className="customer-statements-report-summary-divider"></div>
                        <div className="customer-statements-report-summary-item">
                            <div className="customer-statements-report-summary-title">Net Balance</div>
                            <div className="customer-statements-report-summary-value customer-statements-report-net-value">
                                रु{netBalance.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="customer-statements-report-table-container">
                        <table className="customer-statements-report-table">
                            <thead>
                                <tr>
                                    <th className="customer-statements-report-table-header">
                                        <i className="bi bi-calendar3 me-1"></i>
                                        Date
                                    </th>
                                    <th className="customer-statements-report-table-header">
                                        <i className="bi bi-arrow-left-right me-1"></i>
                                        Type
                                    </th>
                                    <th className="customer-statements-report-table-header">
                                        <i className="bi bi-currency-rupee me-1"></i>
                                        Amount
                                    </th>
                                    <th className="customer-statements-report-table-header">
                                        <i className="bi bi-chat-text me-1"></i>
                                        Remarks
                                    </th>
                                    <th className="customer-statements-report-table-header">
                                        <i className="bi bi-wallet2 me-1"></i>
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="customer-statements-report-table-row">
                                        <td className="customer-statements-report-table-cell">
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="customer-statements-report-table-cell">
                                            <span className={`customer-statements-report-transaction-type ${
                                                transaction.type === 'Given' ? 'customer-statements-report-type-gave' : 'customer-statements-report-type-received'
                                            }`}>
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="customer-statements-report-table-cell">
                                            रु{Math.abs(transaction.amount).toLocaleString()}
                                        </td>
                                        <td className="customer-statements-report-table-cell">
                                            {transaction.remarks}
                                        </td>
                                        <td className="customer-statements-report-table-cell">
                                            रु{transaction.newBalance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="customer-statements-report-action-buttons">
                        <button 
                            className="customer-statements-report-download-button"
                            onClick={handleGeneratePdf}
                        >
                            <i className="bi bi-download me-1"></i>
                            Download PDF
                        </button>
                        <button 
                            className="customer-statements-report-share-button"
                            onClick={() => console.log('Share functionality to be implemented')}
                        >
                            <i className="bi bi-share me-1"></i>
                            Share
                        </button>
                    </div>

                    <div className="customer-statements-report-footer">
                        <div className="customer-statements-report-footer-item">
                            <i className="bi bi-telephone me-1"></i>
                            Phone: {customer.phoneNumber}
                        </div>
                        <div className="customer-statements-report-footer-item">
                            <i className="bi bi-list-ul me-1"></i>
                            Total Transactions: {paymentHistory.length}
                        </div>
                        <div className="customer-statements-report-footer-item">
                            <i className="bi bi-arrow-up-circle me-1"></i>
                            Total Given: रु{totalGave.toLocaleString()}
                        </div>
                        <div className="customer-statements-report-footer-item">
                            <i className="bi bi-arrow-down-circle me-1"></i>
                            Total Received: रु{totalReceived.toLocaleString()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}; 

