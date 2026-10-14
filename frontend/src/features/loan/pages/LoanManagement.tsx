import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
    Loan,
    LoanTransaction,
    fetchAllLoans,
    getStoredTransactions,
    createLoan,
    recordLoanTransaction,
    CreateLoanPayload,
    RecordPaymentPayload,
    TransactionType,
    InterestType,
} from '@/features/services/loanService';
import { AddLoanModal } from '../components/AddLoanModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { EmiCalculatorModal } from '../components/EmiCalculatorModal';
import { LoanDetailModal } from '../components/LoanDetailModal';
import { printHtmlContent } from '@/features/inventoryManagement/utils/printInvoice';
import '@/styles/LoanManagement.css';

export const LoanManagement: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<string>('NEWEST');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
    const [selectedLoanForDetail, setSelectedLoanForDetail] = useState<Loan | null>(null);
    const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);
    const [paymentModalType, setPaymentModalType] = useState<TransactionType>('PAYMENT_GIVEN');
    const [prefilledLoanPayload, setPrefilledLoanPayload] = useState<Partial<CreateLoanPayload> | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchAllLoans();
            setLoans(data);
            setTransactions(getStoredTransactions());
        } finally {
            setLoading(false);
        }
    };

    // Filter and Sort Loans
    const filteredLoans = useMemo(() => {
        return loans
            .filter((l) => {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    l.lenderName.toLowerCase().includes(query) ||
                    l.loanNumber.toLowerCase().includes(query) ||
                    (l.purpose || '').toLowerCase().includes(query) ||
                    (l.accountNumber || '').toLowerCase().includes(query);

                const matchesType = typeFilter === 'ALL' || l.lenderType === typeFilter;
                const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;

                return matchesSearch && matchesType && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'HIGHEST_AMOUNT') return b.principalAmount - a.principalAmount;
                if (sortBy === 'HIGHEST_EMI') return b.monthlyEmi - a.monthlyEmi;
                if (sortBy === 'LOWEST_BALANCE') return a.remainingBalance - b.remainingBalance;
                // NEWEST
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [loans, searchQuery, typeFilter, statusFilter, sortBy]);

    // Aggregate KPI Metrics
    const totalBorrowed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
    const totalRepaid = loans.reduce((sum, l) => sum + l.totalPaid, 0);
    const totalOutstanding = loans.reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalMonthlyEmi = loans
        .filter((l) => l.status === 'ACTIVE')
        .reduce((sum, l) => sum + l.monthlyEmi, 0);

    // Handlers
    const handleCreateLoan = async (payload: CreateLoanPayload) => {
        await createLoan(payload);
        await loadData();
    };

    const handleRecordPayment = async (payload: RecordPaymentPayload) => {
        await recordLoanTransaction(payload);
        await loadData();

        // Refresh detail modal if open
        if (selectedLoanForDetail && selectedLoanForDetail.id === payload.loanId) {
            const updated = await fetchAllLoans();
            const curr = updated.find((l) => l.id === payload.loanId);
            if (curr) setSelectedLoanForDetail(curr);
        }
    };

    const handleOpenPayment = (loan: Loan, type: TransactionType = 'PAYMENT_GIVEN') => {
        setSelectedLoanForPayment(loan);
        setPaymentModalType(type);
    };

    const handleApplyFromCalculator = (params: {
        principal: number;
        rate: number;
        tenure: number;
        type: InterestType;
    }) => {
        setPrefilledLoanPayload({
            principalAmount: params.principal,
            interestRate: params.rate,
            tenureMonths: params.tenure,
            interestType: params.type,
            lenderName: '',
            lenderType: 'BANK',
            startDate: new Date().toISOString().split('T')[0],
        });
        setIsAddModalOpen(true);
    };

    const handleExportReport = () => {
        const companyName =
            localStorage.getItem('organizationName') ||
            localStorage.getItem('companyName') ||
            'Point of Sale Store';

        const rowsHtml = filteredLoans
            .map(
                (l, idx) => `
            <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="fw-bold" style="color: #255dce;">${l.loanNumber}</td>
                <td><strong>${l.lenderName}</strong> (${l.lenderType})</td>
                <td class="text-end">Rs. ${l.principalAmount.toLocaleString('en-IN')}</td>
                <td class="text-center">${l.interestRate}% (${l.interestType})</td>
                <td class="text-end fw-bold" style="color: #255dce;">Rs. ${l.monthlyEmi.toLocaleString('en-IN')}</td>
                <td class="text-end" style="color: #16a34a;">Rs. ${l.totalPaid.toLocaleString('en-IN')}</td>
                <td class="text-end fw-bold" style="color: #dc2626;">Rs. ${l.remainingBalance.toLocaleString('en-IN')}</td>
                <td class="text-center">
                    <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${
                        l.status === 'ACTIVE' ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #475569;'
                    }">${l.status}</span>
                </td>
            </tr>
        `
            )
            .join('');

        const html = `
            <div class="invoice-paper-header">
                <div class="invoice-brand">
                    <h1>${companyName}</h1>
                    <p>Loan Liabilities & Debt Portfolio Report</p>
                </div>
                <div class="invoice-type-banner">
                    <h2>DEBT PORTFOLIO</h2>
                    <div class="num">Generated: ${new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <div class="report-kpis">
                <div class="report-kpi">
                    <span>Total Borrowed</span>
                    <span style="color: #0f172a;">Rs. ${totalBorrowed.toLocaleString('en-IN')}</span>
                </div>
                <div class="report-kpi">
                    <span>Total Repaid</span>
                    <span style="color: #16a34a;">Rs. ${totalRepaid.toLocaleString('en-IN')}</span>
                </div>
                <div class="report-kpi">
                    <span>Total Outstanding</span>
                    <span style="color: #dc2626;">Rs. ${totalOutstanding.toLocaleString('en-IN')}</span>
                </div>
                <div class="report-kpi">
                    <span>Monthly EMI Burden</span>
                    <span style="color: #255dce;">Rs. ${totalMonthlyEmi.toLocaleString('en-IN')} / mo</span>
                </div>
            </div>

            <h4 style="margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase;">Active & Historical Loan Accounts</h4>
            <table>
                <thead>
                    <tr>
                        <th style="width: 30px;" class="text-center">#</th>
                        <th>Loan #</th>
                        <th>Lender Source</th>
                        <th class="text-end">Principal</th>
                        <th class="text-center">Rate</th>
                        <th class="text-end">Monthly EMI</th>
                        <th class="text-end">Total Paid</th>
                        <th class="text-end">Outstanding</th>
                        <th class="text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <div class="disclaimer">
                Executive Liability Statement | Generated by ${companyName} POS Core | ${new Date().toLocaleString()}
            </div>
        `;

        printHtmlContent(html, `Loan_Portfolio_Report_${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <div className="loan-layout-root">
            <Sidebar />
            <div className="loan-page-wrapper">
                <div className="purchase-navbar-spacer">
                    <Navbar />
                </div>

                <div className="loan-container">
                    {/* Header Card */}
                    <div className="loan-header-card">
                        <div className="loan-header-title-row">
                            <div>
                                <h2 className="loan-page-title">Loan & Debt Management</h2>
                                <p className="loan-page-subtitle">
                                    Track borrowings from banks, persons, and institutions, manage EMI schedules, and record payments
                                </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsCalcModalOpen(true)}
                                >
                                    <i className="bi bi-calculator me-1"></i> EMI Calculator
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleExportReport}
                                >
                                    <i className="bi bi-file-earmark-pdf me-1"></i> Export Report
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => {
                                        setPrefilledLoanPayload(undefined);
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    <i className="bi bi-plus-lg me-1"></i> Add New Loan
                                </button>
                            </div>
                        </div>

                        {/* Top KPI Metrics Overview */}
                        <div className="loan-stats-grid">
                            <div className="loan-stat-box">
                                <div className="loan-stat-icon blue">
                                    <i className="bi bi-bank"></i>
                                </div>
                                <div>
                                    <div className="loan-stat-label">Total Borrowed</div>
                                    <div className="loan-stat-value">
                                        Rs. {totalBorrowed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="loan-stat-box">
                                <div className="loan-stat-icon green">
                                    <i className="bi bi-check2-circle"></i>
                                </div>
                                <div>
                                    <div className="loan-stat-label">Total Repaid (Given)</div>
                                    <div className="loan-stat-value" style={{ color: '#16a34a' }}>
                                        Rs. {totalRepaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="loan-stat-box">
                                <div className="loan-stat-icon amber">
                                    <i className="bi bi-exclamation-circle"></i>
                                </div>
                                <div>
                                    <div className="loan-stat-label">Outstanding Debt</div>
                                    <div className="loan-stat-value" style={{ color: '#d97706' }}>
                                        Rs. {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="loan-stat-box">
                                <div className="loan-stat-icon purple">
                                    <i className="bi bi-calendar2-week"></i>
                                </div>
                                <div>
                                    <div className="loan-stat-label">Monthly EMI Outflow</div>
                                    <div className="loan-stat-value" style={{ color: '#255dce' }}>
                                        Rs. {totalMonthlyEmi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="loan-filter-card">
                        <div className="loan-filter-row">
                            <div className="loan-search-wrapper">
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search by lender name, loan #, account #, or purpose..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="loan-search-input"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="loan-select"
                            >
                                <option value="ALL">All Sources</option>
                                <option value="BANK">Commercial Banks</option>
                                <option value="PERSON">Persons / Individuals</option>
                                <option value="INSTITUTION">Institutions</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="loan-select"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active Loans</option>
                                <option value="CLOSED">Closed / Settled</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="loan-select"
                            >
                                <option value="NEWEST">Newest First</option>
                                <option value="HIGHEST_AMOUNT">Highest Principal</option>
                                <option value="HIGHEST_EMI">Highest Monthly EMI</option>
                                <option value="LOWEST_BALANCE">Lowest Balance Left</option>
                            </select>
                        </div>
                    </div>

                    {/* Loan Cards Grid */}
                    {loading ? (
                        <div className="loan-table-card text-center p-5 text-muted">
                            <i className="bi bi-arrow-repeat fa-spin me-2"></i> Loading loan accounts...
                        </div>
                    ) : filteredLoans.length === 0 ? (
                        <div className="loan-table-card text-center p-5 text-muted">
                            <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                            No loan records found. Click <strong>+ Add New Loan</strong> to record your first loan.
                        </div>
                    ) : (
                        <div className="loan-cards-grid">
                            {filteredLoans.map((loan) => {
                                const isBank = loan.lenderType === 'BANK';
                                const pctPaid = loan.totalPayable > 0 ? (loan.totalPaid / loan.totalPayable) * 100 : 0;

                                return (
                                    <div className="loan-card" key={loan.id}>
                                        {/* Card Top */}
                                        <div className="loan-card-top">
                                            <div className="loan-lender-info">
                                                <div className={`loan-type-avatar ${!isBank ? 'person' : ''}`}>
                                                    <i className={`bi ${isBank ? 'bi-bank' : 'bi-person-fill'}`}></i>
                                                </div>
                                                <div>
                                                    <h4 className="loan-lender-name">{loan.lenderName}</h4>
                                                    <div className="loan-number-chip">
                                                        {loan.loanNumber} • {loan.lenderType}
                                                    </div>
                                                </div>
                                            </div>

                                            <span
                                                className={`loan-status-badge ${
                                                    loan.status === 'ACTIVE' ? 'active' : 'closed'
                                                }`}
                                            >
                                                {loan.status}
                                            </span>
                                        </div>

                                        {/* Card Metrics Grid */}
                                        <div className="loan-card-metrics">
                                            <div className="loan-metric-item">
                                                <span className="loan-metric-title">Principal Loan</span>
                                                <span className="loan-metric-num">
                                                    Rs. {loan.principalAmount.toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            <div className="loan-metric-item">
                                                <span className="loan-metric-title">Interest Rate</span>
                                                <span className="loan-metric-num" style={{ color: '#d97706' }}>
                                                    {loan.interestRate}% ({loan.interestType})
                                                </span>
                                            </div>

                                            <div className="loan-metric-item">
                                                <span className="loan-metric-title">Monthly EMI</span>
                                                <span className="loan-metric-num" style={{ color: '#255dce' }}>
                                                    Rs. {loan.monthlyEmi.toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            <div className="loan-metric-item">
                                                <span className="loan-metric-title">Remaining Balance</span>
                                                <span className="loan-metric-num" style={{ color: '#dc2626' }}>
                                                    Rs. {loan.remainingBalance.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Repayment Progress */}
                                        <div className="loan-progress-container">
                                            <div className="loan-progress-labels">
                                                <span>Repaid: Rs. {loan.totalPaid.toLocaleString('en-IN')}</span>
                                                <span>{pctPaid.toFixed(1)}% Completed</span>
                                            </div>
                                            <div className="loan-progress-bar">
                                                <div
                                                    className="loan-progress-fill"
                                                    style={{ width: `${Math.min(100, pctPaid)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="loan-card-actions">
                                            <button
                                                type="button"
                                                className="btn-loan-action pay"
                                                onClick={() => handleOpenPayment(loan, 'PAYMENT_GIVEN')}
                                                title="Record EMI / Repayment paid out to lender"
                                            >
                                                <i className="bi bi-arrow-up-right"></i> Pay Given
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-loan-action receive"
                                                onClick={() => handleOpenPayment(loan, 'PAYMENT_RECEIVED')}
                                                title="Record additional funds or loan amount received"
                                            >
                                                <i className="bi bi-arrow-down-left"></i> Receive
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-loan-action details"
                                                onClick={() => setSelectedLoanForDetail(loan)}
                                                title="View Amortization Schedule and Payment History"
                                            >
                                                <i className="bi bi-calendar3"></i> Schedule
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Loan Modal */}
            <AddLoanModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreateLoan}
                initialData={prefilledLoanPayload}
            />

            {/* Record Payment / Receive Modal */}
            <RecordPaymentModal
                isOpen={Boolean(selectedLoanForPayment)}
                onClose={() => setSelectedLoanForPayment(null)}
                loan={selectedLoanForPayment}
                defaultType={paymentModalType}
                onSubmit={handleRecordPayment}
            />

            {/* EMI Calculator Tool Modal */}
            <EmiCalculatorModal
                isOpen={isCalcModalOpen}
                onClose={() => setIsCalcModalOpen(false)}
                onApplyToNewLoan={handleApplyFromCalculator}
            />

            {/* Loan Detail & Schedule Modal */}
            <LoanDetailModal
                isOpen={Boolean(selectedLoanForDetail)}
                onClose={() => setSelectedLoanForDetail(null)}
                loan={selectedLoanForDetail}
                transactions={transactions}
                onOpenPaymentModal={(l, type) => {
                    setSelectedLoanForPayment(l);
                    setPaymentModalType(type);
                }}
            />
        </div>
    );
};
