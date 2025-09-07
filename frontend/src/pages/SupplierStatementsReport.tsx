"use client"

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PaymentHistory, getPaymentHistory } from '../services/paymentService';
import { getSuppliers } from '../services/customerService';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'react-toastify';
import CustomerStatementsPDFTemplate from '../components/CustomerStatementsPDFTemplate';
import '../styles/CustomerStatementsReport.css';

interface SupplierData {
    name: string;
    phoneNumber: string;
    profileImage: string | null;
    balance: number;
    paymentHistory: PaymentHistory[];
}

interface ReportData {
    customer: SupplierData;
    paymentHistory: PaymentHistory[];
    totals: {
        given: number;
        received: number;
    };
}

export const SupplierStatementsReport = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const contentRef = useRef<HTMLDivElement>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortOption, setSortOption] = useState("date-desc");
    const [filterOption, setFilterOption] = useState("all");
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData>({
        customer: {
            name: '',
            phoneNumber: '',
            profileImage: null,
            balance: 0,
            paymentHistory: []
        },
        paymentHistory: [],
        totals: {
            given: 0,
            received: 0
        }
    });

    useEffect(() => {
        if (location.state) {
            setReportData(location.state as ReportData);
        } else if (id) {
            fetchReportData();
        }
    }, [id, location.state]);

    const fetchReportData = async () => {
        if (!id) return;
        
        setLoading(true);
        try {
            const suppliers = await getSuppliers();
            const supplier = suppliers.find(s => s.id === parseInt(id));
            
            if (!supplier) {
                toast.error('Supplier not found');
                navigate('/parties/suppliers');
                return;
            }

            const paymentHistory = await getPaymentHistory(supplier.id);
            
            // Calculate totals
            const totals = paymentHistory.reduce((acc, payment) => {
                // Ensure amount is a proper number
                const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
                const cleanAmount = isNaN(amount) ? 0 : amount;
                
                if (payment.type === 'Given') {
                    acc.given += cleanAmount;
                } else if (payment.type === 'Received') {
                    acc.received += cleanAmount;
                }
                return acc;
            }, { given: 0, received: 0 });

            // Calculate current balance from payment history
            const currentBalance = paymentHistory.reduce((acc, payment) => {
                // Ensure amount is a proper number
                const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
                const cleanAmount = isNaN(amount) ? 0 : amount;
                
                if (payment.type === 'Received') {
                    return acc + cleanAmount;
                } else if (payment.type === 'Given') {
                    return acc - cleanAmount;
                }
                return acc;
            }, 0);

            const supplierData: SupplierData = {
                name: supplier.name,
                phoneNumber: supplier.phoneNumber,
                profileImage: supplier.profileImage || null,
                balance: currentBalance,
                paymentHistory: paymentHistory
            };

            setReportData({
                customer: supplierData,
                paymentHistory: paymentHistory,
                totals: totals
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Failed to load supplier data');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/parties/suppliers/statements/${id}`);
    };

    // Calculate totals
    const totalGave = reportData.totals.given;
    const totalReceived = reportData.totals.received;
    const netBalance = totalReceived - totalGave;

    // Filter and sort transactions
    const filteredTransactions = reportData.paymentHistory
        .filter(transaction => {
            const matchesSearch = !searchTerm || (transaction.remarks && transaction.remarks.toLowerCase().includes(searchTerm.toLowerCase()));
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

    const handleGeneratePdf = async () => {
        setGeneratingPdf(true);
        try {
            console.log('Starting PDF generation...');
            console.log('Supplier data:', reportData.customer);
            console.log('Filtered transactions:', filteredTransactions);
            console.log('Totals:', { given: totalGave, received: totalReceived });
            
            const blob = await pdf(
                <CustomerStatementsPDFTemplate data={{
                    customer: reportData.customer,
                    paymentHistory: filteredTransactions,
                    totals: {
                        given: totalGave,
                        received: totalReceived
                    }
                }} />
            ).toBlob();
            
            console.log('PDF blob created successfully:', blob);
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `supplier-statement-${reportData.customer.name.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            toast.error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setGeneratingPdf(false);
        }
    };

    if (loading) {
        return (
            <div className="customer-statements-report-page">
                <Sidebar />
                <main className="customer-statements-report-main-content">
                    <div className="customer-statements-report-content-container">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <i className="bi bi-arrow-clockwise spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                            <p>Loading supplier data...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

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
                            Report of {reportData.customer.name}
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
                                            {transaction.remarks || 'No remarks'}
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
                            disabled={generatingPdf}
                        >
                            <i className={`bi ${generatingPdf ? 'bi-arrow-clockwise spin me-1' : 'bi-download me-1'}`}></i>
                            {generatingPdf ? 'Generating...' : 'Download PDF'}
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
                            Phone: {reportData.customer.phoneNumber}
                        </div>
                        <div className="customer-statements-report-footer-item">
                            <i className="bi bi-list-ul me-1"></i>
                            Total Transactions: {reportData.paymentHistory.length}
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