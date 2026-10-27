import React, { useState, useMemo } from 'react';
import { InterestType, calculateEMI, generateAmortizationSchedule } from '@/features/services/loanService';
import { formatSystemNumber } from '@/features/services/appSettingService';
import '@/styles/LoanManagement.css';

interface EmiCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyToNewLoan?: (params: {
        principal: number;
        rate: number;
        tenure: number;
        type: InterestType;
    }) => void;
}

export const EmiCalculatorModal: React.FC<EmiCalculatorModalProps> = ({
    isOpen,
    onClose,
    onApplyToNewLoan,
}) => {
    const [principal, setPrincipal] = useState<number>(500000);
    const [rate, setRate] = useState<number>(10.5);
    const [tenure, setTenure] = useState<number>(24);
    const [type, setType] = useState<InterestType>('REDUCING');
    const [showSchedule, setShowSchedule] = useState<boolean>(false);

    const result = useMemo(() => {
        return calculateEMI(principal, rate, tenure, type);
    }, [principal, rate, tenure, type]);

    const schedule = useMemo(() => {
        if (!showSchedule) return [];
        return generateAmortizationSchedule(principal, rate, tenure, new Date().toISOString(), type);
    }, [principal, rate, tenure, type, showSchedule]);

    if (!isOpen) return null;

    const principalPct = result.totalPayable > 0 ? (principal / result.totalPayable) * 100 : 100;
    const interestPct = result.totalPayable > 0 ? (result.totalInterest / result.totalPayable) * 100 : 0;

    return (
        <div className="loan-modal-backdrop" onClick={onClose}>
            <div className="loan-modal-container large" onClick={(e) => e.stopPropagation()}>
                <div className="loan-modal-header">
                    <div>
                        <h3>EMI Calculator & Payment Schedule Planner</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            Simulate loan installments, interest costs, and amortization before borrowing
                        </p>
                    </div>
                    <button type="button" className="btn-invoice-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="loan-modal-body">
                    {/* Method Selector */}
                    <div className="emi-method-toggle">
                        <button
                            type="button"
                            style={{
                                flex: 1,
                                border: 'none',
                                padding: '8px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: type === 'REDUCING' ? '#ffffff' : 'transparent',
                                color: type === 'REDUCING' ? '#255dce' : '#64748b',
                                boxShadow: type === 'REDUCING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                            onClick={() => setType('REDUCING')}
                        >
                            Reducing Balance (Standard Bank EMI)
                        </button>
                        <button
                            type="button"
                            style={{
                                flex: 1,
                                border: 'none',
                                padding: '8px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: type === 'FLAT' ? '#ffffff' : 'transparent',
                                color: type === 'FLAT' ? '#255dce' : '#64748b',
                                boxShadow: type === 'FLAT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                            onClick={() => setType('FLAT')}
                        >
                            Flat Interest Rate
                        </button>
                    </div>

                    <div className="emi-calc-grid">
                        {/* Sliders & Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Loan Amount */}
                            <div className="loan-input-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Loan Amount (Rs.)</label>
                                    <input
                                        type="number"
                                        value={principal}
                                        onChange={(e) => setPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
                                        style={{ width: '140px', textAlign: 'right', fontWeight: 700 }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="10000"
                                    max="10000000"
                                    step="10000"
                                    value={principal}
                                    onChange={(e) => setPrincipal(parseFloat(e.target.value))}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                            </div>

                            {/* Interest Rate */}
                            <div className="loan-input-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Interest Rate (% P.A.)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={rate}
                                        onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
                                        style={{ width: '100px', textAlign: 'right', fontWeight: 700 }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="0.25"
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value))}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                            </div>

                            {/* Tenure in Months */}
                            <div className="loan-input-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Loan Tenure ({Math.floor(tenure / 12)} Yrs {tenure % 12} Mos)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="360"
                                        value={tenure}
                                        onChange={(e) => setTenure(Math.max(1, parseInt(e.target.value) || 1))}
                                        style={{ width: '100px', textAlign: 'right', fontWeight: 700 }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="120"
                                    step="1"
                                    value={tenure}
                                    onChange={(e) => setTenure(parseInt(e.target.value))}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        {/* Calculation Results Card */}
                        <div
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                            }}
                        >
                            <div style={{ textAlign: 'center', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                    Monthly EMI Amount
                                </span>
                                <div style={{ fontSize: '26px', fontWeight: 800, color: '#255dce', marginTop: '4px' }}>
                                    Rs. {formatSystemNumber(result.monthlyEmi)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: '#64748b' }}>Principal Borrowed:</span>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                    Rs. {formatSystemNumber(principal)}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: '#64748b' }}>Total Interest Cost:</span>
                                <span style={{ fontWeight: 700, color: '#d97706' }}>
                                    Rs. {formatSystemNumber(result.totalInterest)}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                                <span style={{ color: '#0b192c' }}>Total Repayment:</span>
                                <span style={{ color: '#0b192c' }}>
                                    Rs. {formatSystemNumber(result.totalPayable)}
                                </span>
                            </div>

                            {/* Split bar */}
                            <div style={{ marginTop: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                                    <span>Principal ({principalPct.toFixed(1)}%)</span>
                                    <span>Interest ({interestPct.toFixed(1)}%)</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#d97706', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ width: `${principalPct}%`, background: '#255dce' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Toggle Button */}
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setShowSchedule(!showSchedule)}
                            style={{ fontSize: '13px' }}
                        >
                            <i className={`bi ${showSchedule ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
                            {showSchedule ? 'Hide Payment Schedule' : 'View Month-by-Month Amortization Schedule'}
                        </button>

                        {onApplyToNewLoan && (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => {
                                    onApplyToNewLoan({ principal, rate, tenure, type });
                                    onClose();
                                }}
                            >
                                <i className="bi bi-plus-lg me-1"></i> Apply & Create Loan
                            </button>
                        )}
                    </div>

                    {/* Monthly Schedule Table */}
                    {showSchedule && (
                        <div className="schedule-table-wrap" style={{ marginTop: '16px' }}>
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th>Due Date</th>
                                        <th className="text-end">Beginning (Rs.)</th>
                                        <th className="text-end">EMI (Rs.)</th>
                                        <th className="text-end">Principal (Rs.)</th>
                                        <th className="text-end">Interest (Rs.)</th>
                                        <th className="text-end">Ending Balance (Rs.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map((item) => (
                                        <tr key={item.installmentNo}>
                                            <td>{item.installmentNo}</td>
                                            <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                                            <td className="text-end">{formatSystemNumber(item.beginningBalance)}</td>
                                            <td className="text-end fw-bold" style={{ color: '#255dce' }}>
                                                {formatSystemNumber(item.emiAmount)}
                                            </td>
                                            <td className="text-end">{formatSystemNumber(item.principalComponent)}</td>
                                            <td className="text-end" style={{ color: '#d97706' }}>
                                                {formatSystemNumber(item.interestComponent)}
                                            </td>
                                            <td className="text-end fw-bold">{formatSystemNumber(item.endingBalance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
