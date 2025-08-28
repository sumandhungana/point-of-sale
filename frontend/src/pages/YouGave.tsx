import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BackButton } from '../components/BackButton';
import { createPaymentGiven, updatePaymentGiven, PaymentGiven } from '../services/paymentService';
import { toast, Bounce } from 'react-toastify';
import '../styles/YouGave.css';

interface InitialData {
    customerId: number;
    customerName: string;
    amount: number;
    remarks: string;
    date: string;
    phoneNumber: string;
}

export const YouGave = () => {
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
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const paymentData: PaymentGiven = {
                partyId: Number(id),
                amount: parseFloat(formData.amount),
                remarks: formData.remarks,
                date: new Date(formData.date).toISOString(),
                billPath: formData.bill ? `bills/${formData.bill.name}` : ''
            };

            if (isEditMode) {
                await updatePaymentGiven(Number(id), paymentData);
                toast.success('Payment updated successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    className: 'red-success-toast',
                    style: {
                        '--toastify-color-success': '#cf1f30',
                        '--toastify-color-progress-success': '#cf1f30'
                    } as React.CSSProperties
                });
            } else {
                await createPaymentGiven(paymentData);
                toast.success('Payment recorded successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    className: 'red-success-toast',
                    style: {
                        '--toastify-color-success': '#cf1f30',
                        '--toastify-color-progress-success': '#cf1f30'
                    } as React.CSSProperties
                });
            }
            navigate(`/parties/customers/statements/${id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to record payment');
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
        <div className="you-gave-page" style={{ position: 'relative' }}>
            <Sidebar />
            <BackButton 
                to={`/parties/customers/statements/${id}`}
                label="Back to Statements"
                className="below-navbar"
            />
            <main className="you-gave-main-content">
                <div className="you-gave-form-container">
                    <h2 className="you-gave-form-title">
                        <i className="bi bi-cash-coin me-2"></i>
                        {isEditMode ? 'Edit Payment Given' : 'Record Payment Given'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="you-gave-form-group">
                            <label className="you-gave-label" htmlFor="amount">
                                <i className="bi bi-currency-rupee me-1"></i>
                                Amount
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="you-gave-input"
                                placeholder="Enter amount"
                                required
                            />
                        </div>

                        <div className="you-gave-form-group">
                            <label className="you-gave-label" htmlFor="remarks">
                                <i className="bi bi-pencil me-1"></i>
                                Remarks
                            </label>
                            <textarea
                                id="remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                className="you-gave-textarea"
                                placeholder="Add remarks"
                                required
                            />
                        </div>

                        <div className="you-gave-form-group">
                            <label className="you-gave-label" htmlFor="date">
                                <i className="bi bi-calendar3 me-1"></i>
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="you-gave-input"
                                required
                            />
                        </div>

                        <div className="you-gave-form-group">
                            <label className="you-gave-label">Attach Bill</label>
                            <input
                                type="file"
                                id="bill"
                                onChange={handleFileChange}
                                className="you-gave-file-input"
                            />
                            <label htmlFor="bill" className="you-gave-file-button">
                                <i className="bi bi-paperclip me-1"></i>
                                Choose File
                            </label>
                            {formData.bill && (
                                <span className="you-gave-file-name">{formData.bill.name}</span>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="you-gave-submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="you-gave-spinner"></span>
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