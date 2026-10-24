
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createPayment } from '@/features/services/paymentService';
import { toast } from 'react-toastify';
import { useAppSettings } from '@/context/AppSettingsContext';

interface YouReceivedProps {
    customerId?: number;
    onSuccess: () => void;
    onClose: () => void;
}

export const YouReceived: React.FC<YouReceivedProps> = ({ customerId, onSuccess, onClose }) => {
    const { settings } = useAppSettings();
    const currencySymbol = settings.currency || 'Rs. ';
    const { id } = useParams<{ id: string }>();

    const resolvedId = customerId || (id ? parseInt(id, 10) : 0);
    const activeCustomerId = isNaN(resolvedId) ? 0 : resolvedId;

    const [amount, setAmount] = useState<string>('');
    const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'QR'>('CASH');
    const [remarks, setRemarks] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeCustomerId || activeCustomerId <= 0) {
            toast.error('Invalid customer ID');
            return;
        }

        if (!amount || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);
        let paymentCreatedSuccessfully = false;

        try {
            await createPayment({
                paymentParty: 'CUSTOMER',
                customerId: activeCustomerId,
                amount: Number(amount),
                paymentType: paymentType,
                paymentCategory: 'RECEIVED',
                billPath: selectedFile ? selectedFile.name : undefined,
                remarks: remarks || undefined
            });

            paymentCreatedSuccessfully = true;
            toast.success('Payment received successfully!');
        } catch (error: any) {
            console.error('Payment API error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit payment');
        } finally {
            setIsSubmitting(false);
        }

        // Run parent callbacks safely outside the try-catch block
        if (paymentCreatedSuccessfully) {
            try {
                onSuccess();
            } catch (err) {
                console.error('Error in onSuccess callback:', err);
            }
            try {
                onClose();
            } catch (err) {
                console.error('Error in onClose callback:', err);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="you-received-form">
            <div className="form-group">
                <label className="form-label">
                    <i className="bi bi-cash-stack me-1 text-success"></i>
                    Amount ({currencySymbol}) <span className="text-danger ms-1">*</span>
                </label>
                <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    autoFocus
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    <i className="bi bi-wallet2 me-1"></i>
                    Payment Mode
                </label>
                <select
                    className="form-select"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'CASH' | 'CARD' | 'QR')}
                >
                    <option value="CASH">Cash</option>
                    <option value="QR">QR Code</option>
                    <option value="CARD">Card</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">
                    <i className="bi bi-paperclip me-1"></i>
                    Attach Bill / Receipt (Optional)
                </label>
                <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                />
                {selectedFile && (
                    <small className="text-muted d-block mt-1">
                        <i className="bi bi-check-circle me-1 text-success"></i>
                        Selected: {selectedFile.name}
                    </small>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">
                    <i className="bi bi-chat-left-text me-1"></i>
                    Remarks
                </label>
                <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Optional notes or reference..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            <div className="popup-action-buttons">
                <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-submit-received" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-arrow-down-circle me-1"></i>
                            Confirm You Received
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};