
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createPayment } from '@/features/services/paymentService';
import { toast } from 'react-toastify';

interface YouReceivedProps {
    customerId?: number;
    onSuccess: () => void;
    onClose: () => void;
}

export const YouReceived: React.FC<YouReceivedProps> = ({ customerId, onSuccess, onClose }) => {
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
            <div className="mb-3">
                <label className="form-label">Amount (रु)</label>
                <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Payment Mode</label>
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

            <div className="mb-3">
                <label className="form-label">Attach Bill / Receipt (Optional)</label>
                <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                />
                {selectedFile && (
                    <small className="text-muted d-block mt-1">
                        Selected: {selectedFile.name}
                    </small>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">Remarks</label>
                <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Optional notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Confirm You Received'}
                </button>
            </div>
        </form>
    );
};