"use client"

import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PaymentHistory } from '../services/paymentService';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-toastify';

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
        if (!contentRef.current) return;

        const element = contentRef.current;
        const opt = {
            margin: 10,
            filename: `customer-statement-${customer.name}-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
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
            '@media print': {
                boxShadow: 'none',
                padding: '0',
                maxWidth: '100%',
                pageBreakAfter: 'always',
            },
        },
        backButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#dc4c39',
            padding: '0.5rem',
            '&:hover': {
                color: '#c23321',
            },
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
        controlsCard: {
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '2rem',
            '@media print': {
                display: 'none',
            },
        },
        controlsRow: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap' as const,
        },
        searchInput: {
            padding: '0.5rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            flex: 1,
            minWidth: '200px',
        },
        dropdownSelect: {
            padding: '0.5rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            background: 'white',
            color: '#212529',
            minWidth: '150px',
        },
        dateControls: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap' as const,
        },
        dateLabel: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#6c757d',
            fontSize: '0.875rem',
        },
        dateInput: {
            display: 'flex',
            flexDirection: 'column' as const,
            minWidth: '150px',
        },
        dateSelect: {
            padding: '0.5rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            background: 'white',
            minWidth: '150px',
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
            marginTop: '2rem',
            overflowX: 'auto' as const,
            '@media print': {
                overflowX: 'visible',
                pageBreakInside: 'avoid',
            },
        },
        customerTable: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            marginTop: '1rem',
            '@media print': {
                pageBreakInside: 'avoid',
            },
        },
        tableHeader: {
            background: '#f8f9fa',
            padding: '0.75rem',
            textAlign: 'left' as const,
            borderBottom: '2px solid #dee2e6',
            color: '#212529',
            fontWeight: 'bold',
        },
        tableCell: {
            padding: '0.75rem',
            borderBottom: '1px solid #dee2e6',
        },
        totalBalance: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '1rem',
            textAlign: 'right' as const,
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
        actionButtons: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem',
            '@media print': {
                display: 'none',
            },
        },
        actionButton: {
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        downloadButton: {
            background: '#dc4c39',
            color: 'white',
            '&:hover': {
                background: '#c23321',
            },
        },
        shareButton: {
            background: '#28a745',
            color: 'white',
            '&:hover': {
                background: '#218838',
            },
        },
    };

    return (
        <div style={styles.container}>
            <Sidebar />
         
            <main style={styles.mainContent}>
                <div ref={contentRef} style={styles.contentContainer}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <button style={styles.backButton} onClick={handleBack}>
                            ←
                        </button>
                        <h1 style={styles.reportTitle}>Report of {customer.name}</h1>
                </div>

                    <div style={styles.controlsCard}>
                        <div style={styles.controlsRow}>
                            <input
                                type="text"
                                placeholder="Search remarks"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={styles.dropdownSelect}>
                                <option value="date-desc">Sort: Date (Newest)</option>
                                <option value="date-asc">Sort: Date (Oldest)</option>
                                <option value="amount-desc">Sort: Amount (High to Low)</option>
                                <option value="amount-asc">Sort: Amount (Low to High)</option>
                            </select>
                            <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} style={styles.dropdownSelect}>
                                <option value="all">Filter: All</option>
                                <option value="gave">Filter: You Gave</option>
                                <option value="received">Filter: You Received</option>
                            </select>
                        </div>

                        <div style={styles.dateControls}>
                            <div style={styles.dateInput}>
                                <label style={styles.dateLabel}>Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={styles.dateSelect}
                                />
                        </div>
                            <div style={styles.dateInput}>
                                <label style={styles.dateLabel}>End Date</label>
                            <input 
                                type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={styles.dateSelect}
                                />
                        </div>
                    </div>
                </div>

                    <div style={styles.totalBalance}>
                        Total Net Balance: ₹{netBalance.toLocaleString()}
                </div>

                    <div style={styles.tableContainer}>
                        <table style={styles.customerTable}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Date</th>
                                    <th style={styles.tableHeader}>Type</th>
                                    <th style={styles.tableHeader}>Amount</th>
                                    <th style={styles.tableHeader}>Remarks</th>
                                    <th style={styles.tableHeader}>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td style={styles.tableCell}>
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={styles.tableCell}>
                                            {transaction.type}
                                        </td>
                                        <td style={styles.tableCell}>
                                            ₹{Math.abs(transaction.amount).toLocaleString()}
                                        </td>
                                        <td style={styles.tableCell}>
                                                            {transaction.remarks}
                                        </td>
                                        <td style={styles.tableCell}>
                                            ₹{transaction.newBalance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                            </div>

                    <div style={styles.actionButtons}>
                        <button 
                            style={{ ...styles.actionButton, ...styles.downloadButton }}
                            onClick={handleGeneratePdf}
                        >
                            <span>📄</span> Download PDF
                        </button>
                        <button 
                            style={{ ...styles.actionButton, ...styles.shareButton }}
                            onClick={() => console.log('Share functionality to be implemented')}
                        >
                            <span>📤</span> Share
                        </button>
                    </div>

                    <div style={styles.reportFooter}>
                        <div>Phone: {customer.phoneNumber}</div>
                        <div>Total Transactions: {paymentHistory.length}</div>
                        <div>Total Given: ₹{totalGave.toLocaleString()}</div>
                        <div>Total Received: ₹{totalReceived.toLocaleString()}</div>
                    </div>
                </div>
            </main>
        </div>
    );
}; 

