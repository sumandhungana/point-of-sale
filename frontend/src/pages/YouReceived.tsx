import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { createPaymentReceived } from '../services/paymentService';

export const YouReceived = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState({
        amount: '',
        remarks: '',
        date: new Date().toISOString().split('T')[0],
        bill: null as File | null
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // For now, we'll use a static billPath. In a real app, you'd upload the file first
            const paymentData = {
                partyId: Number(id),
                amount: Number(formData.amount),
                remarks: formData.remarks,
                date: new Date(formData.date).toISOString(),
                billPath: "bills/payment1.pdf" // This should be replaced with actual file upload logic
            };

            await createPaymentReceived(paymentData);
            navigate(-1); // Go back one page
        } catch (err: any) {
            setError(err.message || 'Failed to save payment. Please try again.');
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
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem',
            opacity: isSubmitting ? 0.7 : 1,
            pointerEvents: isSubmitting ? 'none' as const : 'auto' as const,
        },
        errorMessage: {
            color: '#dc3545',
            marginTop: '1rem',
            textAlign: 'center' as const,
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
                    <h2 style={styles.formTitle}>Record Payment Received</h2>
                    {error && <div style={styles.errorMessage}>{error}</div>}
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
                                step="0.01"
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
                            {isSubmitting ? 'Saving...' : 'Save Payment'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}; 