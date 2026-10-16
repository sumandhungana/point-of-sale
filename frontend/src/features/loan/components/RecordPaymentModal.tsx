import React, { useState } from 'react';
import { Loan, TransactionType, PaymentMode, RecordPaymentPayload } from '@/features/services/loanService';
import '@/styles/LoanManagement.css';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    loan: Loan | null;
    defaultType?: TransactionType;
    onSubmit: (payload: RecordPaymentPayload) => Promise<void>;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
    isOpen,
    onClose,
    loan,
    defaultType = 'PAYMENT_GIVEN',
    onSubmit,
}) => {
    const [type, setType] = useState<TransactionType>(defaultType);
    const [amount, setAmount] = useState<number | ''>(loan?.monthlyEmi || 0);
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER');
    const [referenceNo, setReferenceNo] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !loan) return null;

    const isGiven = type === 'PAYMENT_GIVEN';
    const numAmount = Number(amount) || 0;
    const projectedBalance = isGiven
        ? Math.max(0, loan.remainingBalance - numAmount)
        : loan.remainingBalance + numAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numAmount || numAmount <= 0) {
            setError('Please enter a valid payment amount.');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await onSubmit({
                loanId: loan.id,
                type,
                amount: numAmount,
                paymentDate,
                paymentMode,
                referenceNo: referenceNo.trim() || undefined,
                remarks: remarks.trim() || undefined,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to record transaction');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="loan-modal-backdrop" onClick={onClose}>
            <div className="loan-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="loan-modal-header">
                    <div>
                        <h3>
                            {isGiven ? 'Record Repayment (Payment Given)' : 'Receive Funds (Loan Inflow)'}
                        </h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            {loan.lenderName} ({loan.loanNumber})
                        </p>
                    </div>
                    <button type="button" className="btn-invoice-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="loan-modal-form">
                    <div className="loan-modal-body">
                        {error && (
                            <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '13px' }}>
                                <i className="bi bi-exclamation-triangle me-1"></i> {error}
                            </div>
                        )}

                        {/* Transaction Type Segmented Toggle */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                                Transaction Direction
                            </label>
                            <div className="loan-type-toggle-row">
                                <button
                                    type="button"
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        background: isGiven ? '#ffffff' : 'transparent',
                                        color: isGiven ? '#1d4ed8' : '#64748b',
                                        boxShadow: isGiven ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                    onClick={() => setType('PAYMENT_GIVEN')}
                                >
                                    <i className="bi bi-arrow-up-right me-1"></i> Payment Given (Pay EMI / Repayment)
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        background: !isGiven ? '#ffffff' : 'transparent',
                                        color: !isGiven ? '#15803d' : '#64748b',
                                        boxShadow: !isGiven ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                    onClick={() => setType('PAYMENT_RECEIVED')}
                                >
                                    <i className="bi bi-arrow-down-left me-1"></i> Payment Received (Extra Loan Inflow)
                                </button>
                            </div>
                        </div>

                        <div className="loan-form-grid">
                            {/* Amount */}
                            <div className="loan-input-group">
                                <label>Amount (Rs.) *</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="Enter amount in Rs."
                                    required
                                />
                                {isGiven && (
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                                        Monthly EMI: Rs. {loan.monthlyEmi.toLocaleString('en-IN')} | Remaining: Rs. {loan.remainingBalance.toLocaleString('en-IN')}
                                    </div>
                                )}
                            </div>

                            {/* Payment Date */}
                            <div className="loan-input-group">
                                <label>Date of Transaction *</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Payment Mode */}
                            <div className="loan-input-group">
                                <label>Payment Mode *</label>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                                >
                                    <option value="BANK_TRANSFER">Bank Transfer / Cheque</option>
                                    <option value="CASH">Cash in Hand</option>
                                    <option value="CHEQUE">Bank Cheque</option>
                                    <option value="DIGITAL">Digital Wallet / UPI</option>
                                </select>
                            </div>

                            {/* Reference No */}
                            <div className="loan-input-group">
                                <label>Voucher / Cheque / Ref #</label>
                                <input
                                    type="text"
                                    placeholder="e.g. TXN-8921829 or Cheque #10291"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                />
                            </div>

                            {/* Remarks */}
                            <div className="loan-input-group loan-form-col-full">
                                <label>Remarks / Notes</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Regular monthly EMI installment for Month 3"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Balance Impact Card */}
                        <div
                            style={{
                                marginTop: '18px',
                                padding: '14px 16px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                    Current Outstanding
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                                    Rs. {loan.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                                <i className="bi bi-arrow-right"></i>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                    New Projected Balance
                                </div>
                                <div
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        color: isGiven ? '#16a34a' : '#255dce',
                                    }}
                                >
                                    Rs. {projectedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="loan-modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={isGiven ? 'btn-primary' : 'btn-primary'}
                            style={{ background: isGiven ? '#255dce' : '#16a34a' }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <i className="bi bi-arrow-repeat fa-spin me-1"></i> Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle me-1"></i> Confirm Transaction
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
