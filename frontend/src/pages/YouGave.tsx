import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { createPaymentGiven, updatePaymentGiven, PaymentGiven } from '../services/paymentService';
import { toast } from 'react-toastify';

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
                toast.success('Payment updated successfully!');
            } else {
                await createPaymentGiven(paymentData);
                toast.success('Payment recorded successfully!');
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

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
        backButton: {
            position: 'absolute' as const,
            top: '80px',
            padding: '8px 16px',
            marginLeft: '30px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#495057',
            '&:hover': {
                background: '#e9ecef',
            },
        },
        mainContent: {
            padding: '2rem',
            marginTop: '64px',
        },
        formContainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            margin: '0 auto',
        },
        formTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '1.5rem',
            textAlign: 'center' as const,
        },
        formGroup: {
            marginBottom: '1.5rem',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#495057',
            fontWeight: '500',
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '1rem',
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '1rem',
            minHeight: '100px',
            resize: 'vertical' as const,
        },
        fileInput: {
            display: 'none',
        },
        fileButton: {
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginTop: '0.5rem',
        },
        fileName: {
            marginLeft: '1rem',
            color: '#6c757d',
        },
        submitButton: {
            width: '100%',
            padding: '0.75rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem',
        },
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <button 
                style={styles.backButton} 
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>
            <main style={styles.mainContent}>
                <div style={styles.formContainer}>
                    <h2 style={styles.formTitle}>
                        {isEditMode ? 'Edit Payment Given' : 'Record Payment Given'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="amount">Amount</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="remarks">Remarks</label>
                            <textarea
                                id="remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                style={styles.textarea}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="date">Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Attach Bill</label>
                            <input
                                type="file"
                                id="bill"
                                onChange={handleFileChange}
                                style={styles.fileInput}
                            />
                            <label htmlFor="bill" style={styles.fileButton}>
                                Choose File
                            </label>
                            {formData.bill && (
                                <span style={styles.fileName}>{formData.bill.name}</span>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            style={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Payment' : 'Save Payment')}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}; 