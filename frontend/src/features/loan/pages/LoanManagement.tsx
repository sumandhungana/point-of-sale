import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
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
import { usePermission } from '@/core/rbac/usePermission';
import '@/styles/RentalItem.css';
import '@/styles/LoanManagement.css';

export const LoanManagement: React.FC = () => {
    const { hasPermission, isSuperAdmin, hasModule } = usePermission();
    const canAccessLoan = isSuperAdmin || hasModule('loan') || hasPermission('loan:list');
    const canCreateLoan = hasPermission('loan:create');
    const canRecordPayment = hasPermission('loan:payment');
    const canViewDetails = hasPermission('loan:single') || hasPermission('loan:list');

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
        if (canAccessLoan) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [canAccessLoan]);

    const loadData = async () => {
        if (!canAccessLoan) return;
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
                <div className="loan-container">
                    {/* Header Card */}
                    <div className="loan-header-card">
                        <div className="loan-header-actions-row">
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

                            <div className="loan-filter-selects-wrap">
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
                    </div>

                    {/* Loan Items List (Full Width Rental Item Style) */}
                    {loading ? (
                        <div className="loan-table-card text-center p-5 text-muted">
                            <i className="bi bi-arrow-repeat fa-spin me-2"></i> Loading loan accounts...
                        </div>
                    ) : filteredLoans.length === 0 ? (
                        <div className="rental-item-loading-message">
                            <i className="bi bi-inbox me-2"></i>
                            No loan records found. Click <strong>+ Add New Loan</strong> to record your first loan.
                        </div>
                    ) : (
                        <div className="loan-list-container">
                            {filteredLoans.map((loan) => {
                                const isBank = loan.lenderType === 'BANK';
                                const isClosed = loan.status === 'CLOSED' || loan.remainingBalance <= 0;
                                const pctPaid = loan.totalPayable > 0 ? (loan.totalPaid / loan.totalPayable) * 100 : 0;
                                const statusClass = isClosed
                                    ? 'rental-item-status-completed'
                                    : 'rental-item-status-in-progress';

                                return (
                                    <div
                                        key={loan.id}
                                        className="rental-item-card loan-item-card"
                                        onClick={() => setSelectedLoanForDetail(loan)}
                                        title="Click to view Amortization Schedule and Payment History"
                                    >
                                        <div className="rental-item-info">
                                            <div
                                                className="rental-item-image-placeholder"
                                                style={{
                                                    background: isBank
                                                        ? 'linear-gradient(135deg, #eff6ff, #dbeafe)'
                                                        : loan.lenderType === 'INSTITUTION'
                                                        ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)'
                                                        : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                                    color: isBank
                                                        ? '#255dce'
                                                        : loan.lenderType === 'INSTITUTION'
                                                        ? '#7c3aed'
                                                        : '#b45309',
                                                }}
                                            >
                                                <i
                                                    className={`bi ${
                                                        isBank
                                                            ? 'bi-bank'
                                                            : loan.lenderType === 'INSTITUTION'
                                                            ? 'bi-building'
                                                            : 'bi-person-fill'
                                                    }`}
                                                ></i>
                                            </div>
                                            <div className="rental-item-details">
                                                <div className="rental-item-name d-flex align-items-center gap-2 flex-wrap">
                                                    <span>{loan.lenderName}</span>
                                                    <span className="loan-badge-chip">
                                                        {loan.loanNumber} • {loan.lenderType}
                                                    </span>
                                                </div>
                                                <div className="rental-item-time">
                                                    <i className="bi bi-calendar-event me-1"></i>
                                                    Start: {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : 'N/A'} |
                                                    Tenure: {loan.tenureMonths} Months |
                                                    Rate: {loan.interestRate}% ({loan.interestType}) |
                                                    Monthly EMI: <strong>रु {loan.monthlyEmi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                                </div>
                                                <div className="rental-item-time">
                                                    {loan.accountNumber && (
                                                        <>
                                                            <i className="bi bi-credit-card-2-front me-1"></i>
                                                            A/C: {loan.accountNumber} |{' '}
                                                        </>
                                                    )}
                                                    {loan.phoneNumber && (
                                                        <>
                                                            <i className="bi bi-telephone me-1"></i>
                                                            Phone: {loan.phoneNumber} |{' '}
                                                        </>
                                                    )}
                                                    <i className="bi bi-tag me-1"></i>
                                                    Purpose: {loan.purpose || 'General / Working Capital'}
                                                </div>
                                                {loan.remarks && (
                                                    <div className="rental-item-time">
                                                        <i className="bi bi-chat-text me-1"></i>
                                                        Remarks: {loan.remarks}
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center gap-3 flex-wrap mt-1">
                                                    <div className={`rental-item-status ${statusClass}`}>
                                                        <i className="bi bi-circle-fill me-1" style={{ fontSize: '8px' }}></i>
                                                        Status: {isClosed ? 'Fully Settled / Closed' : loan.status}
                                                    </div>
                                                    <div
                                                        className="d-flex align-items-center gap-2"
                                                        style={{ fontSize: '0.8rem', color: '#64748b' }}
                                                    >
                                                        <span>{pctPaid.toFixed(1)}% Repaid</span>
                                                        <div
                                                            style={{
                                                                width: '100px',
                                                                height: '6px',
                                                                backgroundColor: '#e2e8f0',
                                                                borderRadius: '999px',
                                                                overflow: 'hidden',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: `${Math.min(100, pctPaid)}%`,
                                                                    height: '100%',
                                                                    backgroundColor: isClosed ? '#10b981' : '#255dce',
                                                                    borderRadius: '999px',
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rental-item-amount">
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>
                                                रु {loan.principalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="rental-card-balance-row">
                                                <span className="rental-card-paid-text">
                                                    Repaid: रु {loan.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                {isClosed ? (
                                                    <span className="rental-card-settled-text">
                                                        <i className="bi bi-check-circle-fill me-1"></i>Settled
                                                    </span>
                                                ) : (
                                                    <span className="rental-card-due-text">
                                                        Due: रु {loan.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                className="loan-card-actions-wrap d-flex align-items-center gap-2 mt-2 flex-wrap justify-content-end"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {canRecordPayment && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="loan-action-btn pay"
                                                            onClick={() => handleOpenPayment(loan, 'PAYMENT_GIVEN')}
                                                            title="Record EMI / Repayment paid out to lender"
                                                        >
                                                            <i className="bi bi-arrow-up-right"></i> Pay Given
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="loan-action-btn receive"
                                                            onClick={() => handleOpenPayment(loan, 'PAYMENT_RECEIVED')}
                                                            title="Record additional funds or loan amount received"
                                                        >
                                                            <i className="bi bi-arrow-down-left"></i> Receive
                                                        </button>
                                                    </>
                                                )}
                                                {canViewDetails && (
                                                    <button
                                                        type="button"
                                                        className="loan-action-btn schedule"
                                                        onClick={() => setSelectedLoanForDetail(loan)}
                                                        title="View Amortization Schedule and Payment History"
                                                    >
                                                        <i className="bi bi-calendar3"></i> Schedule{' '}
                                                        <i className="bi bi-chevron-right ms-1"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Bottom-Right Add Loan Button (Matching Customer Page) */}
            {canCreateLoan && (
                <button
                    type="button"
                    className="loan-add-sticky-button"
                    onClick={() => {
                        setPrefilledLoanPayload(undefined);
                        setIsAddModalOpen(true);
                    }}
                    title="Add New Loan"
                >
                    <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                    <span>Add New Loan</span>
                </button>
            )}

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
