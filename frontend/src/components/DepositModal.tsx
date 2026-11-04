import React, { useState, useEffect } from 'react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { createPayment, AddPaymentPayload } from '@/features/services/paymentService';
import { toast } from 'react-toastify';
import '../styles/DepositModal.css';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    partyId: number;
    partyName: string;
    partyType: 'CUSTOMER' | 'SUPPLIER';
    onSuccess?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
    isOpen,
    onClose,
    partyId,
    partyName,
    partyType,
    onSuccess,
}) => {
    const { settings } = useAppSettings();
    const currencySymbol = settings.currency || 'Rs. ';

    const [amount, setAmount] = useState<string>('');
    const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'QR'>('CASH');
    const [remarks, setRemarks] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Reset fields when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setRemarks('');
            setPaymentType('CASH');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!partyId || partyId <= 0) {
            toast.error(`Invalid ${partyType.toLowerCase()} ID`);
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Please enter a valid deposit amount greater than 0');
            return;
        }

        setIsSubmitting(true);
        let success = false;

        try {
            const payload: AddPaymentPayload = {
                paymentParty: partyType,
                customerId: partyType === 'CUSTOMER' ? partyId : undefined,
                supplierId: partyType === 'SUPPLIER' ? partyId : undefined,
                amount: numAmount,
                paymentType: paymentType,
                // Customer deposit = money received from customer
                // Supplier deposit = money given/advanced to supplier
                paymentCategory: partyType === 'CUSTOMER' ? 'RECEIVED' : 'GIVEN',
                remarks: remarks.trim() ? `[Deposit] ${remarks.trim()}` : 'Deposit',
            };

            await createPayment(payload);
            toast.success(`Deposit of ${currencySymbol}${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} saved successfully!`);
            success = true;
        } catch (error: any) {
            console.error('Deposit error:', error);
            toast.error(error?.response?.data?.message || 'Failed to save deposit');
        } finally {
            setIsSubmitting(false);
        }

        if (success) {
            if (onSuccess) {
                try {
                    onSuccess();
                } catch (err) {
                    console.error('Error in onSuccess callback:', err);
                }
            }
            onClose();
        }
    };

    return (
        <div 
            className="deposit-modal-overlay" 
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting) {
                    onClose();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-modal-title"
        >
            <div className="deposit-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header with Title and Upper Right Cross Close Button */}
                <div className="deposit-modal-header">
                    <div className="deposit-modal-header-left">
                        <div className="deposit-modal-icon-badge">
                            <i className="bi bi-cash-coin"></i>
                        </div>
                        <div>
                            <h2 id="deposit-modal-title" className="deposit-modal-title">Deposit</h2>
                            <p className="deposit-modal-subtitle">
                                {partyType === 'CUSTOMER' ? 'Customer' : 'Supplier'}: <strong>{partyName || 'Party'}</strong>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="deposit-modal-close"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close deposit popup"
                        title="Close (Esc)"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="deposit-modal-form">
                    <div className="deposit-modal-body">
                        {/* Amount Field */}
                        <div className="deposit-form-group">
                            <label className="deposit-form-label" htmlFor="deposit-amount-input">
                                <i className="bi bi-currency-exchange me-1 text-primary"></i>
                                Amount ({currencySymbol}) <span className="text-danger">*</span>
                            </label>
                            <div className="deposit-input-wrapper">
                                <span className="deposit-currency-prefix">{currencySymbol}</span>
                                <input
                                    id="deposit-amount-input"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="deposit-form-control deposit-amount-input"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Payment Mode Selection */}
                        <div className="deposit-form-group">
                            <label className="deposit-form-label" htmlFor="deposit-payment-type">
                                <i className="bi bi-wallet2 me-1 text-secondary"></i>
                                Payment Mode
                            </label>
                            <select
                                id="deposit-payment-type"
                                className="deposit-form-select"
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value as 'CASH' | 'CARD' | 'QR')}
                                disabled={isSubmitting}
                            >
                                <option value="CASH">Cash</option>
                                <option value="QR">QR Code / Online</option>
                                <option value="CARD">Card</option>
                            </select>
                        </div>

                        {/* Remarks Field */}
                        <div className="deposit-form-group">
                            <label className="deposit-form-label" htmlFor="deposit-remarks-input">
                                <i className="bi bi-chat-left-text me-1 text-secondary"></i>
                                Remarks
                            </label>
                            <textarea
                                id="deposit-remarks-input"
                                className="deposit-form-control deposit-remarks-textarea"
                                rows={3}
                                placeholder="Enter remarks (e.g., Security deposit, advance payment)..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={isSubmitting}
                                maxLength={500}
                            />
                            <div className="deposit-field-hint">
                                Optional note or description for this deposit transaction.
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="deposit-modal-footer">
                        <button
                            type="button"
                            className="deposit-btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="deposit-btn-save"
                            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-cash-coin me-1"></i>
                                    Deposit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

