import React, { useState } from 'react';
import { Loan, LoanTransaction, TransactionType } from '@/features/services/loanService';
import { printHtmlContent } from '@/features/inventoryManagement/utils/printInvoice';
import { formatSystemNumber } from '@/features/services/appSettingService';
import '@/styles/LoanManagement.css';

interface LoanDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    loan: Loan | null;
    transactions: LoanTransaction[];
    onOpenPaymentModal: (loan: Loan, type: TransactionType, defaultAmount?: number) => void;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
    isOpen,
    onClose,
    loan,
    transactions,
    onOpenPaymentModal,
}) => {
    const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'TRANSACTIONS' | 'INFO'>('SCHEDULE');

    if (!isOpen || !loan) return null;

    const paidPercentage = loan.totalPayable > 0 ? (loan.totalPaid / loan.totalPayable) * 100 : 0;
    const loanTransactions = transactions.filter((t) => t.loanId === loan.id);

    const handlePrintStatement = () => {
        const companyName =
            localStorage.getItem('organizationName') ||
            localStorage.getItem('companyName') ||
            'Point of Sale Store';

        const scheduleRowsHtml = loan.schedule
            .map(
                (item) => `
            <tr>
                <td class="text-center">${item.installmentNo}</td>
                <td>${new Date(item.dueDate).toLocaleDateString()}</td>
                <td class="text-end">Rs. ${formatSystemNumber(item.beginningBalance)}</td>
                <td class="text-end fw-bold" style="color: #255dce;">Rs. ${formatSystemNumber(item.emiAmount)}</td>
                <td class="text-end">Rs. ${formatSystemNumber(item.principalComponent)}</td>
                <td class="text-end">Rs. ${formatSystemNumber(item.interestComponent)}</td>
                <td class="text-end">Rs. ${formatSystemNumber(item.endingBalance)}</td>
                <td class="text-center">
                    <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${
                        item.status === 'PAID' ? '#dcfce7; color: #15803d;' : '#fef3c7; color: #b45309;'
                    }">${item.status}</span>
                </td>
            </tr>
        `
            )
            .join('');

        const html = `
            <div class="invoice-paper-header">
                <div class="invoice-brand">
                    <h1>${companyName}</h1>
                    <p>Official Loan Statement & Repayment Schedule</p>
                </div>
                <div class="invoice-type-banner">
                    <h2>LOAN STATEMENT</h2>
                    <div class="num">${loan.loanNumber}</div>
                </div>
            </div>

            <div class="invoice-meta-grid">
                <div class="invoice-party-col">
                    <h4>Lender Information</h4>
                    <div class="invoice-party-name">${loan.lenderName} (${loan.lenderType})</div>
                    ${loan.accountNumber ? `<div class="invoice-party-detail">Account: ${loan.accountNumber}</div>` : ''}
                    ${loan.phoneNumber ? `<div class="invoice-party-detail">Phone: ${loan.phoneNumber}</div>` : ''}
                    ${loan.purpose ? `<div class="invoice-party-detail">Purpose: ${loan.purpose}</div>` : ''}
                </div>
                <div class="invoice-dates-col">
                    <div class="invoice-info-row">
                        <span class="invoice-info-label">Principal Amount:</span>
                        <span class="invoice-info-val">Rs. ${formatSystemNumber(loan.principalAmount)}</span>
                    </div>
                    <div class="invoice-info-row">
                        <span class="invoice-info-label">Interest Rate:</span>
                        <span class="invoice-info-val">${loan.interestRate}% (${loan.interestType})</span>
                    </div>
                    <div class="invoice-info-row">
                        <span class="invoice-info-label">Monthly EMI:</span>
                        <span class="invoice-info-val">Rs. ${formatSystemNumber(loan.monthlyEmi)}</span>
                    </div>
                    <div class="invoice-info-row">
                        <span class="invoice-info-label">Tenure:</span>
                        <span class="invoice-info-val">${loan.tenureMonths} Months</span>
                    </div>
                </div>
            </div>

            <div class="report-kpis">
                <div class="report-kpi">
                    <span>Total Borrowed</span>
                    <span style="color: #0f172a;">Rs. ${formatSystemNumber(loan.principalAmount)}</span>
                </div>
                <div class="report-kpi">
                    <span>Total Repaid (Given)</span>
                    <span style="color: #16a34a;">Rs. ${formatSystemNumber(loan.totalPaid)}</span>
                </div>
                <div class="report-kpi">
                    <span>Outstanding Balance</span>
                    <span style="color: #255dce;">Rs. ${formatSystemNumber(loan.remainingBalance)}</span>
                </div>
            </div>

            <h4 style="margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase;">Amortization Schedule</h4>
            <table>
                <thead>
                    <tr>
                        <th style="width: 35px;" class="text-center">#</th>
                        <th>Due Date</th>
                        <th class="text-end">Beginning</th>
                        <th class="text-end">EMI (Rs.)</th>
                        <th class="text-end">Principal</th>
                        <th class="text-end">Interest</th>
                        <th class="text-end">Ending Balance</th>
                        <th class="text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${scheduleRowsHtml}
                </tbody>
            </table>

            <div class="disclaimer">
                Computer-generated official statement | Generated by ${companyName} POS Core | ${new Date().toLocaleString()}
            </div>
        `;

        printHtmlContent(html, `Loan_Statement_${loan.loanNumber}`);
    };

    return (
        <div className="loan-modal-backdrop" onClick={onClose}>
            <div className="loan-modal-container large" onClick={(e) => e.stopPropagation()}>
                {/* Header with Title and Actions */}
                <div className="loan-modal-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3>{loan.lenderName}</h3>
                            <span
                                className={`loan-status-badge ${
                                    loan.status === 'ACTIVE' ? 'active' : 'closed'
                                }`}
                            >
                                {loan.status}
                            </span>
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            Loan #{loan.loanNumber} • Source: {loan.lenderType} • Disbursed: {new Date(loan.startDate).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="loan-modal-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            className="btn-invoice-download"
                            onClick={() => onOpenPaymentModal(loan, 'PAYMENT_GIVEN', loan.monthlyEmi)}
                        >
                            <i className="bi bi-arrow-up-right"></i> Pay EMI / Repay
                        </button>

                        <button
                            type="button"
                            className="btn-invoice-print"
                            onClick={handlePrintStatement}
                        >
                            <i className="bi bi-printer"></i> Print Statement
                        </button>

                        <button type="button" className="btn-invoice-close" onClick={onClose}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                <div className="loan-modal-body">
                    {/* Top KPI Summary Banner */}
                    <div
                        style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            marginBottom: '20px',
                        }}
                    >
                        <div className="loan-detail-kpi-grid">
                            <div>
                                <span className="loan-stat-label">Principal Amount</span>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                                    Rs. {formatSystemNumber(loan.principalAmount)}
                                </div>
                            </div>

                            <div>
                                <span className="loan-stat-label">Interest Rate</span>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                                    {loan.interestRate}% <span style={{ fontSize: '11px', color: '#64748b' }}>({loan.interestType})</span>
                                </div>
                            </div>

                            <div>
                                <span className="loan-stat-label">Monthly EMI</span>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#255dce', marginTop: '2px' }}>
                                    Rs. {formatSystemNumber(loan.monthlyEmi)}
                                </div>
                            </div>

                            <div>
                                <span className="loan-stat-label">Remaining Balance</span>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                                    Rs. {formatSystemNumber(loan.remainingBalance)}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '5px' }}>
                                <span>Paid: Rs. {formatSystemNumber(loan.totalPaid)} ({paidPercentage.toFixed(1)}%)</span>
                                <span>Total Payable: Rs. {formatSystemNumber(loan.totalPayable)}</span>
                            </div>
                            <div className="loan-progress-bar">
                                <div className="loan-progress-fill" style={{ width: `${Math.min(100, paidPercentage)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="loan-tabs-nav">
                        <button
                            type="button"
                            className={`loan-tab-btn ${activeTab === 'SCHEDULE' ? 'active' : ''}`}
                            onClick={() => setActiveTab('SCHEDULE')}
                        >
                            <i className="bi bi-calendar3"></i> Monthly EMI Schedule ({loan.schedule.length})
                        </button>
                        <button
                            type="button"
                            className={`loan-tab-btn ${activeTab === 'TRANSACTIONS' ? 'active' : ''}`}
                            onClick={() => setActiveTab('TRANSACTIONS')}
                        >
                            <i className="bi bi-clock-history"></i> Payments Ledger ({loanTransactions.length})
                        </button>
                        <button
                            type="button"
                            className={`loan-tab-btn ${activeTab === 'INFO' ? 'active' : ''}`}
                            onClick={() => setActiveTab('INFO')}
                        >
                            <i className="bi bi-info-circle"></i> Loan Details & Terms
                        </button>
                    </div>

                    {/* Tab 1: Monthly Schedule Table */}
                    {activeTab === 'SCHEDULE' && (
                        <div className="schedule-table-wrap">
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th>Due Date</th>
                                        <th className="text-end">Beginning (Rs.)</th>
                                        <th className="text-end">EMI (Rs.)</th>
                                        <th className="text-end">Principal (Rs.)</th>
                                        <th className="text-end">Interest (Rs.)</th>
                                        <th className="text-end">Ending (Rs.)</th>
                                        <th className="text-center" style={{ width: '90px' }}>Status</th>
                                        <th className="text-center" style={{ width: '90px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loan.schedule.map((item) => (
                                        <tr key={item.installmentNo}>
                                            <td className="text-center">{item.installmentNo}</td>
                                            <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                                            <td className="text-end">{formatSystemNumber(item.beginningBalance)}</td>
                                            <td className="text-end fw-bold" style={{ color: '#255dce' }}>
                                                {formatSystemNumber(item.emiAmount)}
                                            </td>
                                            <td className="text-end">{formatSystemNumber(item.principalComponent)}</td>
                                            <td className="text-end" style={{ color: '#d97706' }}>
                                                {formatSystemNumber(item.interestComponent)}
                                            </td>
                                            <td className="text-end">{formatSystemNumber(item.endingBalance)}</td>
                                            <td className="text-center">
                                                <span
                                                    className={`schedule-status-badge ${
                                                        item.status === 'PAID' ? 'paid' : 'pending'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {item.status === 'PENDING' ? (
                                                    <button
                                                        type="button"
                                                        className="btn-row-action"
                                                        style={{ padding: '3px 8px', fontSize: '11px' }}
                                                        onClick={() =>
                                                            onOpenPaymentModal(loan, 'PAYMENT_GIVEN', item.emiAmount)
                                                        }
                                                    >
                                                        Pay EMI
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                                                        <i className="bi bi-check-circle-fill"></i> Settled
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 2: Payments Ledger */}
                    {activeTab === 'TRANSACTIONS' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                    History of repayments given and funds received
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        className="btn-loan-action pay"
                                        onClick={() => onOpenPaymentModal(loan, 'PAYMENT_GIVEN')}
                                    >
                                        <i className="bi bi-arrow-up-right"></i> + Pay Given
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-loan-action receive"
                                        onClick={() => onOpenPaymentModal(loan, 'PAYMENT_RECEIVED')}
                                    >
                                        <i className="bi bi-arrow-down-left"></i> + Receive Inflow
                                    </button>
                                </div>
                            </div>

                            {loanTransactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                                    No recorded payment transactions yet.
                                </div>
                            ) : (
                                <div className="schedule-table-wrap">
                                    <table className="schedule-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Direction</th>
                                                <th>Payment Mode</th>
                                                <th>Reference #</th>
                                                <th>Remarks</th>
                                                <th className="text-end">Amount (Rs.)</th>
                                                <th className="text-end">Balance After</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loanTransactions.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span
                                                            style={{
                                                                padding: '3px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                fontWeight: 700,
                                                                background:
                                                                    tx.type === 'PAYMENT_GIVEN' ? '#eff6ff' : '#f0fdf4',
                                                                color:
                                                                    tx.type === 'PAYMENT_GIVEN' ? '#1d4ed8' : '#15803d',
                                                            }}
                                                        >
                                                            {tx.type === 'PAYMENT_GIVEN'
                                                                ? 'Payment Given (Repayment)'
                                                                : 'Payment Received (Inflow)'}
                                                        </span>
                                                    </td>
                                                    <td>{tx.paymentMode}</td>
                                                    <td>{tx.referenceNo || '-'}</td>
                                                    <td style={{ maxWidth: '160px' }} className="text-truncate">
                                                        {tx.remarks || '-'}
                                                    </td>
                                                    <td
                                                        className="text-end fw-bold"
                                                        style={{
                                                            color: tx.type === 'PAYMENT_GIVEN' ? '#16a34a' : '#255dce',
                                                        }}
                                                    >
                                                        Rs. {formatSystemNumber(tx.amount)}
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        Rs. {formatSystemNumber(tx.balanceAfter)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Detailed Info */}
                    {activeTab === 'INFO' && (
                        <div className="loan-info-tab-grid">
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <h5 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', color: '#0b192c' }}>
                                    Lender & Account Details
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                    <div><strong>Lender:</strong> {loan.lenderName}</div>
                                    <div><strong>Source Type:</strong> {loan.lenderType}</div>
                                    <div><strong>Account / Branch:</strong> {loan.accountNumber || 'N/A'}</div>
                                    <div><strong>Phone / Contact:</strong> {loan.phoneNumber || 'N/A'}</div>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <h5 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', color: '#0b192c' }}>
                                    Terms & Purpose
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                    <div><strong>Purpose:</strong> {loan.purpose || 'General business financing'}</div>
                                    <div><strong>Disbursal Date:</strong> {new Date(loan.startDate).toLocaleDateString()}</div>
                                    <div><strong>Calculation:</strong> {loan.interestType === 'REDUCING' ? 'Reducing Balance EMI' : 'Flat Rate'}</div>
                                    <div><strong>Remarks:</strong> {loan.remarks || 'None'}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="loan-modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
