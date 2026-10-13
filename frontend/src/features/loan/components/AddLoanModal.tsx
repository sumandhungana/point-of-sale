import React, { useState, useMemo } from 'react';
import { CreateLoanPayload, LenderType, InterestType, calculateEMI } from '@/features/services/loanService';
import '@/styles/LoanManagement.css';

interface AddLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateLoanPayload) => Promise<void>;
    initialData?: Partial<CreateLoanPayload>;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    const [lenderName, setLenderName] = useState(initialData?.lenderName || '');
    const [lenderType, setLenderType] = useState<LenderType>(initialData?.lenderType || 'BANK');
    const [loanNumber, setLoanNumber] = useState(initialData?.loanNumber || '');
    const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
    const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '');
    const [principalAmount, setPrincipalAmount] = useState<number | ''>(initialData?.principalAmount || 500000);
    const [interestRate, setInterestRate] = useState<number | ''>(initialData?.interestRate || 10.5);
    const [tenureMonths, setTenureMonths] = useState<number | ''>(initialData?.tenureMonths || 24);
    const [interestType, setInterestType] = useState<InterestType>(initialData?.interestType || 'REDUCING');
    const [startDate, setStartDate] = useState(
        initialData?.startDate || new Date().toISOString().split('T')[0]
    );
    const [purpose, setPurpose] = useState(initialData?.purpose || '');
    const [remarks, setRemarks] = useState(initialData?.remarks || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Live real-time EMI calculation
    const emiSummary = useMemo(() => {
        const p = Number(principalAmount) || 0;
        const r = Number(interestRate) || 0;
        const t = Number(tenureMonths) || 0;
        return calculateEMI(p, r, t, interestType);
    }, [principalAmount, interestRate, tenureMonths, interestType]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lenderName.trim()) {
            setError('Please enter the lender name (Bank or Person name).');
            return;
        }
        if (!principalAmount || principalAmount <= 0) {
            setError('Please enter a valid loan principal amount.');
            return;
        }
        if (!interestRate || interestRate < 0) {
            setError('Please enter a valid annual interest rate.');
            return;
        }
        if (!tenureMonths || tenureMonths <= 0) {
            setError('Please enter a valid loan duration in months.');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await onSubmit({
                loanNumber: loanNumber.trim() || undefined,
                lenderName: lenderName.trim(),
                lenderType,
                phoneNumber: phoneNumber.trim() || undefined,
                accountNumber: accountNumber.trim() || undefined,
                principalAmount: Number(principalAmount),
                interestRate: Number(interestRate),
                tenureMonths: Number(tenureMonths),
                interestType,
                startDate,
                purpose: purpose.trim() || undefined,
                remarks: remarks.trim() || undefined,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create loan record');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="loan-modal-backdrop" onClick={onClose}>
            <div className="loan-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="loan-modal-header">
                    <div>
                        <h3>Add New Loan</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            Record borrowing from banks, persons, or financial institutions
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

                        <div className="loan-form-grid">
                            {/* Lender Type */}
                            <div className="loan-input-group">
                                <label>Lender Source / Type *</label>
                                <select
                                    value={lenderType}
                                    onChange={(e) => setLenderType(e.target.value as LenderType)}
                                >
                                    <option value="BANK">Commercial Bank</option>
                                    <option value="PERSON">Individual / Person</option>
                                    <option value="INSTITUTION">Cooperative / Financial Institution</option>
                                    <option value="OTHER">Other Source</option>
                                </select>
                            </div>

                            {/* Lender Name */}
                            <div className="loan-input-group">
                                <label>Lender Name *</label>
                                <input
                                    type="text"
                                    placeholder={lenderType === 'BANK' ? 'e.g. Nabil Bank, Global IME' : 'e.g. Ram Bahadur, Partner'}
                                    value={lenderName}
                                    onChange={(e) => setLenderName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Custom Loan / Account # */}
                            <div className="loan-input-group">
                                <label>Loan Account # / Ref</label>
                                <input
                                    type="text"
                                    placeholder="Auto-generated if blank (e.g. LN-2026-001)"
                                    value={loanNumber}
                                    onChange={(e) => setLoanNumber(e.target.value)}
                                />
                            </div>

                            {/* Contact Number */}
                            <div className="loan-input-group">
                                <label>Contact / Phone</label>
                                <input
                                    type="text"
                                    placeholder="e.g. +977-9800000000"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>

                            {/* Principal Amount */}
                            <div className="loan-input-group">
                                <label>Principal Amount (Rs.) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1000"
                                    placeholder="e.g. 500000"
                                    value={principalAmount}
                                    onChange={(e) =>
                                        setPrincipalAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                                    }
                                    required
                                />
                            </div>

                            {/* Annual Interest Rate */}
                            <div className="loan-input-group">
                                <label>Annual Interest Rate (%) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="e.g. 10.5"
                                    value={interestRate}
                                    onChange={(e) =>
                                        setInterestRate(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                                    }
                                    required
                                />
                            </div>

                            {/* Tenure in Months */}
                            <div className="loan-input-group">
                                <label>Tenure / Duration (Months) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="360"
                                    placeholder="e.g. 12, 24, 36"
                                    value={tenureMonths}
                                    onChange={(e) =>
                                        setTenureMonths(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
                                    }
                                    required
                                />
                            </div>

                            {/* Interest Calculation Method */}
                            <div className="loan-input-group">
                                <label>Interest Calculation Type *</label>
                                <select
                                    value={interestType}
                                    onChange={(e) => setInterestType(e.target.value as InterestType)}
                                >
                                    <option value="REDUCING">Reducing Balance (Standard Bank EMI)</option>
                                    <option value="FLAT">Flat Interest Rate</option>
                                </select>
                            </div>

                            {/* Disbursal / Start Date */}
                            <div className="loan-input-group">
                                <label>Disbursal Date *</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Account Details */}
                            <div className="loan-input-group">
                                <label>Bank Account / Branch Details</label>
                                <input
                                    type="text"
                                    placeholder="e.g. A/C 019283748291 / Kathmandu Branch"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                />
                            </div>

                            {/* Purpose */}
                            <div className="loan-input-group loan-form-col-full">
                                <label>Loan Purpose</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Store renovation, Bulk stock procurement"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>

                            {/* Remarks */}
                            <div className="loan-input-group loan-form-col-full">
                                <label>Additional Terms / Remarks</label>
                                <textarea
                                    rows={2}
                                    placeholder="Notes on collateral, guarantor, special agreement terms..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Real-time EMI Live Preview Box */}
                        <div className="emi-live-preview-box">
                            <div className="emi-preview-item">
                                <span className="emi-preview-title">Monthly EMI</span>
                                <span className="emi-preview-val">
                                    Rs. {emiSummary.monthlyEmi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="emi-preview-item">
                                <span className="emi-preview-title">Total Interest</span>
                                <span className="emi-preview-val white">
                                    Rs. {emiSummary.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="emi-preview-item">
                                <span className="emi-preview-title">Total Repayment</span>
                                <span className="emi-preview-val white">
                                    Rs. {emiSummary.totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="loan-modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <i className="bi bi-arrow-repeat fa-spin me-1"></i> Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-1"></i> Save Loan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
