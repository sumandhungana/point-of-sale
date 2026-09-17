"use client"

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PaymentHistory, getPaymentHistory } from '../services/paymentService';
import { getCustomers } from '../services/customerService';
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
    // Data will be managed by reportData state

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
        totals: { given: 0, received: 0 }
    });

    // Use data from location.state if available, otherwise fetch it
    useEffect(() => {
        if (location.state && location.state.customer && location.state.paymentHistory) {
            setReportData(location.state as ReportData);
        } else if (id) {
            // Fetch data if not available from location.state
            fetchReportData();
        }
    }, [id, location.state]);

    const fetchReportData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const customers = await getCustomers();
            const customer = customers.find(c => c.id === parseInt(id));

            if (!customer) {
                toast.error('Customer not found');
                navigate('/parties/customers');
                return;
            }

            const paymentHistory = await getPaymentHistory(customer.id);

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

            const customerData: CustomerData = {
                name: customer.name,
                phoneNumber: customer.phoneNumber,
                profileImage: customer.profileImage || null,
                balance: currentBalance,
                paymentHistory: paymentHistory
            };

            setReportData({
                customer: customerData,
                paymentHistory: paymentHistory,
                totals: totals
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Failed to load customer data');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/parties/customers/statements/${id}`);
    };

    // Calculate totals
    const totalGave = reportData.totals.given;
    const totalReceived = reportData.totals.received;
    const netBalance = totalReceived - totalGave;

    // Filter and sort transactions
    const filteredTransactions = reportData.paymentHistory
        .filter((transaction) => {
            const search = searchTerm.trim().toLowerCase();

            const matchesSearch =
                search === "" ||
                transaction.remarks?.toLowerCase().includes(search) ||
                transaction.type.toLowerCase().includes(search) ||
                transaction.date?.toLowerCase().includes(search) ||
                transaction.amount.toString().includes(search) ||
                transaction.newBalance.toString().includes(search) ||
                reportData.customer.name.toLowerCase().includes(search);

            const matchesFilter =
                filterOption === "all" ||
                (filterOption === "gave" && transaction.type === "Given") ||
                (filterOption === "received" &&
                    transaction.type === "Received");

            const transactionDate = new Date(transaction.createdAt);

            const matchesStartDate =
                !startDate || transactionDate >= new Date(startDate);

            const matchesEndDate =
                !endDate ||
                transactionDate <= new Date(
                    `${endDate}T23:59:59`
                );

            return (
                matchesSearch &&
                matchesFilter &&
                matchesStartDate &&
                matchesEndDate
            );
        })
        .sort((a, b) => {
            switch (sortOption) {
                case "date-desc":
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );

                case "date-asc":
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    );

                case "amount-desc":
                    return Number(b.newBalance) - Number(a.newBalance);

                case "amount-asc":
                    return Number(a.newBalance) - Number(b.newBalance);

                default:
                    return 0;
            }
        });

    const handleGeneratePdf = async () => {
        setGeneratingPdf(true);
        try {
            console.log('Starting PDF generation...');
            console.log('Customer data:', reportData.customer);
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
            link.download = `customer-statement-${reportData.customer.name.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                            <p>Loading customer data...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // @ts-ignore
    return (
        <div className="customer-statements-report-page">
            <Sidebar />

            <main className="customer-statements-report-main-content">
                <div ref={contentRef} className="customer-statements-report-content-container">
                    <div className="customer-statements-report-header">
                        <button className="customer-statements-report-back-button" onClick={handleBack}>
                            <i className="bi bi-arrow-left"></i>
                            Back
                        </button>
                        <h1 className="customer-statements-report-title">
                            <i className="bi bi-file-earmark-text me-2"></i>
                            Report of {reportData.customer.name}
                        </h1>
                    </div>

                    <div className="customer-statements-report-controls-card">

                        {/* Search */}
                        <div className="customer-statements-report-search-container">
                            <i className="bi bi-search customer-statements-report-search-icon"></i>

                            <input
                                type="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="customer-statements-report-search-input"
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="customer-statements-report-dropdown"
                        >
                            <option value="date-desc">Newest</option>
                            <option value="date-asc">Oldest</option>
                            <option value="amount-desc">Balance ↓</option>
                            <option value="amount-asc">Balance ↑</option>
                        </select>

                        {/* Start Date */}
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="customer-statements-report-date-select"
                        />

                        {/* End Date */}
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="customer-statements-report-date-select"
                        />

                        {/* Reset */}
                        <button
                            className="customer-statements-report-reset-btn"
                            onClick={() => {
                                setSearchTerm("");
                                setSortOption("date-desc");
                                setStartDate("");
                                setEndDate("");
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Reset
                        </button>
                    </div>

                    <div className="search-result-count">
                        Showing {filteredTransactions.length} of {reportData.paymentHistory.length} transactions
                    </div>
                    <div className="customer-statements-report-summary-section">
                        <table className="statement-table">
                            <tbody>
                            <tr>
                                <td className="net-balance" colSpan="3">
                                    <div className="net-balance-content">
                                        <span>Total Net Balance</span>
                                        <strong>रु{netBalance.toLocaleString()}</strong>
                                    </div>
                                </td>
                            </tr>
                            <tr className="summary-row">
                                <td>
                                    Total Bill Count
                                    <br />
                                    <strong>{reportData.paymentHistory.length}</strong>
                                </td>

                                <td>
                                    You Gave
                                    <br />
                                    <strong>रु{totalGave.toLocaleString()}</strong>
                                </td>

                                <td >
                                    You Received
                                    <br />
                                    <strong>रु{totalReceived.toLocaleString()}</strong>
                                </td>
                            </tr>

                            {filteredTransactions.map((item, index) => (
                                <tr key={index}  className="summary-row-details">
                                    <td>
                                        Date: {item.date}
                                        <br />
                                        Balance: रु{item.newBalance.toLocaleString()}
                                        <br />
                                        Remarks: {item.remarks}
                                    </td>

                                    <td>
                                        {item.type === "Given"
                                            ? "रु " + Math.abs(item.amount).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td>
                                        {item.type === "Received"
                                            ? "रु " + Math.abs(item.amount).toLocaleString()
                                            : "-"}
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


                </div>
            </main>
        </div>
    );
}; 

