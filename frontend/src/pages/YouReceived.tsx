import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BackButton } from '../components/BackButton';
import { createPaymentReceived, updatePaymentReceived } from '../services/paymentService';
import { toast } from 'react-toastify';
import '../styles/YouReceived.css';

interface InitialData {
    customerId: number;
    customerName: string;
    amount: number;
    remarks: string;
    date: string;
    phoneNumber: string;
}

export const YouReceived = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const initialData = location.state?.initialData as InitialData;
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        amount: initialData?.amount?.toString() || '',
        remarks: initialData?.remarks || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        bill: null as File | null
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const paymentData = {
                partyId: Number(id),
                amount: Number(formData.amount),
                remarks: formData.remarks,
                date: new Date(formData.date).toISOString(),
                billPath: formData.bill ? `bills/${formData.bill.name}` : "bills/payment1.pdf"
            };

            if (isEditMode) {
                await updatePaymentReceived(Number(id), paymentData);
                toast.success('Payment updated successfully!');
            } else {
                await createPaymentReceived(paymentData);
                toast.success('Payment recorded successfully!');
            }
            const cameFromSuppliers = document.referrer.includes('/suppliers/') || location.pathname.includes('/supplier/');
            navigate(cameFromSuppliers ? `/parties/suppliers/statements/${id}` : `/parties/customers/statements/${id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to save payment. Please try again.');
            toast.error(err.message || 'Failed to save payment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                bill: e.target.files![0]
            }));
        }
    };

    return (
        <div className="you-received-page" style={{ position: 'relative' }}>
            <Sidebar />
            <BackButton 
                to={location.pathname.includes('/supplier/') ? `/parties/suppliers/statements/${id}` : `/parties/customers/statements/${id}`}
                label="Back to Statements"
                className="below-navbar"
            />
            <main className="you-received-main-content">
                <div className="you-received-form-container">
                    <h2 className="you-received-form-title">
                        <i className="bi bi-cash-coin me-2"></i>
                        {isEditMode ? 'Edit Payment Received' : 'Record Payment Received'}
                    </h2>
                    {error && <div className="you-received-error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="you-received-form-group">
                            <label className="you-received-label" htmlFor="amount">
                                <i className="bi bi-currency-rupee me-1"></i>
                                Amount
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="you-received-input"
                                placeholder="Enter amount"
                                required
                                step="0.01"
                            />
                        </div>

                        <div className="you-received-form-group">
                            <label className="you-received-label" htmlFor="remarks">
                                <i className="bi bi-pencil me-1"></i>
                                Remarks
                            </label>
                            <textarea
                                id="remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                className="you-received-textarea"
                                placeholder="Add remarks"
                                required
                            />
                        </div>

                        <div className="you-received-form-group">
                            <label className="you-received-label" htmlFor="date">
                                <i className="bi bi-calendar3 me-1"></i>
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="you-received-input"
                                required
                            />
                        </div>

                        <div className="you-received-form-group">
                            <label className="you-received-label">
                                <i className="bi bi-paperclip me-1"></i>
                                Attach Bill
                            </label>
                            <input
                                type="file"
                                id="bill"
                                onChange={handleFileChange}
                                className="you-received-file-input"
                            />
                            <label htmlFor="bill" className="you-received-file-button">
                                <i className="bi bi-paperclip me-1"></i>
                                Choose File
                            </label>
                            {formData.bill && (
                                <span className="you-received-file-name">{formData.bill.name}</span>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="you-received-submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="you-received-spinner"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    {isEditMode ? 'Update Payment' : 'Save Payment'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}; 