"use client"

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {CustomerData, getPaymentList, GetPaymentResponse} from '@/features/services/paymentService';
import { getCustomers } from '@/features/services/customerService';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'react-toastify';
import CustomerStatementsPDFTemplate from '../components/CustomerStatementsPDFTemplate';
import '../../../styles/CustomerStatementsReport.css';

interface ReportData {
    customer: CustomerData;
    paymentHistory: GetPaymentResponse[];
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

    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortOption, setSortOption] = useState("date-desc");
    const [filterOption] = useState("all");
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData>({
        customer: {
            id: 0,
            name: '',
            phone: null,
            email: null,
            address: null,
            company: null,
            pan: null,
            contactPerson: null,
            isSupplier: false,
            createdAt: '',
            updatedAt: '',
            bankAccount: null,
            cashBalance: 0,
            profileImage: null,
            customerSmsSetting: false,
            smsLanguage: false,
            transactionHistoryCheck: false,
            paymentHistory: [],
            paymentDateReminder: null,
        },
        paymentHistory: [],
        totals: { given: 0, received: 0 }
    });

    useEffect(() => {
        if (location.state && location.state.customer && location.state.paymentHistory) {
            setReportData(location.state as ReportData);
        } else if (id) {
            fetchReportData();
        }
    }, [id, location.state]);

    const fetchReportData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const customers = await getCustomers();
            const customer = customers.find((c: any) => c.id === parseInt(id));

            if (!customer) {
                toast.error('Customer not found');
                navigate('/parties/customers');
                return;
            }

            const paymentHistory = await getPaymentList({
                paymentParty: 'CUSTOMER',
                partyId: customer.id,
            });

            const totals = paymentHistory.reduce((acc, payment) => {
                const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
                const cleanAmount = isNaN(amount) ? 0 : amount;

                if (payment.paymentCategory === 'GIVEN') {
                    acc.given += cleanAmount;
                } else if (payment.paymentCategory === 'RECEIVED') {
                    acc.received += cleanAmount;
                }
                return acc;
            }, { given: 0, received: 0 });

            const currentBalance = totals.received - totals.given;

            const customerData: CustomerData = {
                id: customer.id,
                name: customer.name,
                phone: customer.phone ?? null,
                email: customer.email ?? null,
                address: customer.address ?? null,
                company: customer.company ?? null,
                pan: customer.pan ?? null,
                contactPerson: customer.contactPerson ?? null,
                isSupplier: customer.isSupplier ?? false,
                createdAt: customer.createdAt ?? new Date().toISOString(),
                updatedAt: customer.updatedAt ?? new Date().toISOString(),
                bankAccount: customer.bankAccount ?? null,
                cashBalance: currentBalance,
                profileImage: customer.profileImage || null,
                customerSmsSetting: customer.customerSmsSetting ?? false,
                smsLanguage: customer.smsLanguage ?? false,
                transactionHistoryCheck: customer.transactionHistoryCheck ?? false,
                paymentHistory: paymentHistory,
                paymentDateReminder: customer.paymentDateReminder ?? null,
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

    const totalGave = reportData.totals.given;
    const totalReceived = reportData.totals.received;
    const netBalance = totalReceived - totalGave;

    const filteredTransactions = reportData.paymentHistory
        .filter((transaction) => {
            const search = searchTerm.trim().toLowerCase();
            const typeText = transaction.paymentCategory === 'GIVEN' ? 'given' : 'received';
            const dateStr = new Date(transaction.createdAt).toLocaleDateString();

            const matchesSearch =
                search === "" ||
                transaction.remarks?.toLowerCase().includes(search) ||
                typeText.includes(search) ||
                dateStr.includes(search) ||
                transaction.amount.toString().includes(search) ||
                reportData.customer.name.toLowerCase().includes(search);

            const matchesFilter =
                filterOption === "all" ||
                (filterOption === "gave" && transaction.paymentCategory === "GIVEN") ||
                (filterOption === "received" && transaction.paymentCategory === "RECEIVED");

            const transactionTime = new Date(transaction.createdAt).getTime();

            const matchesStartDate =
                !startDate || transactionTime >= new Date(`${startDate}T00:00:00`).getTime();

            const matchesEndDate =
                !endDate || transactionTime <= new Date(`${endDate}T23:59:59`).getTime();

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
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

                case "date-asc":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

                case "amount-desc":
                    return Number(b.amount || 0) - Number(a.amount || 0);

                case "amount-asc":
                    return Number(a.amount || 0) - Number(b.amount || 0);

                default:
                    return 0;
            }
        });

    const handleGeneratePdf = async () => {
        setGeneratingPdf(true);
        try {
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
                            <option value="amount-desc">Amount ↓</option>
                            <option value="amount-asc">Amount ↑</option>
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
                                <td className="net-balance" colSpan={3}>
                                    <div className="net-balance-content">
                                        <span>Total Net Balance</span>
                                        <strong>रु{(netBalance || 0).toLocaleString()}</strong>
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
                                    <strong>रु{(totalGave || 0).toLocaleString()}</strong>
                                </td>
                                <td>
                                    You Received
                                    <br />
                                    <strong>रु{(totalReceived || 0).toLocaleString()}</strong>
                                </td>
                            </tr>

                            {filteredTransactions.map((item) => (
                                <tr key={item.id} className="summary-row-details">
                                    <td>
                                        Date: {new Date(item.createdAt).toLocaleDateString()}
                                        <br />
                                        Payment Method: {item.paymentType}
                                        <br />
                                        Remarks: {item.remarks || '-'}
                                    </td>
                                    <td>
                                        {item.paymentCategory === "GIVEN"
                                            ? "रु " + Math.abs(Number(item.amount) || 0).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        {item.paymentCategory === "RECEIVED"
                                            ? "रु " + Math.abs(Number(item.amount) || 0).toLocaleString()
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
