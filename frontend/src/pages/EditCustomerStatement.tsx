import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';

export const EditCustomerStatement = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState({
        amount: '',
        details: '',
        billNumber: '',
        date: '',
        file: null as File | null,
    });
    const [customerName, setCustomerName] = useState('John Doe'); // This would come from API
    const [transactionType, setTransactionType] = useState('give'); // 'give' or 'receive'
    const [totalAmount, setTotalAmount] = useState(15000); // This would come from API

    useEffect(() => {
        // Fetch customer data based on ID
        // This is a placeholder - replace with actual API call
        console.log(`Fetching customer data for ID: ${id}`);
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                file: e.target.files![0]
            }));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
        // After successful submission, navigate back to customer statements page
        navigate(`/parties/customers/statements/${id}`);
    };

    const handleCancel = () => {
        navigate(`/parties/customers/statements/${id}`);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
      
       mainContent: {
            padding: '2rem',
            marginTop: '64px',
            maxWidth: 'calc(100% - 500px)',
            marginRight: '500px',
            width: '100%',
        },ntainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        formTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '2rem',
        },
        summaryBox: {
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #dee2e6',
        },
        summaryText: {
            fontSize: '1.25rem',
            color: '#212529',
            marginBottom: '0.5rem',
        },
        highlightedAmount: {
            color: '#dc4c39',
            fontWeight: 'bold',
        },
        formRow: {
            display: 'flex',
            gap: '2rem',
            marginBottom: '1.5rem',
        },
        formGroup: {
            flex: 1,
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            color: '#495057',
            fontWeight: '500',
        },
        input: {
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.875rem',
            '&:focus': {
                outline: 'none',
                borderColor: '#80bdff',
                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
            },
        },
        textarea: {
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.875rem',
            minHeight: '100px',
            resize: 'vertical' as const,
            '&:focus': {
                outline: 'none',
                borderColor: '#80bdff',
                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
            },
        },
        select: {
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.875rem',
            background: 'white',
            '&:focus': {
                outline: 'none',
                borderColor: '#80bdff',
                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
            },
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '2rem',
        },
        button: {
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
        },
        saveButton: {
            background: '#dc4c39',
            color: 'white',
            '&:hover': {
                background: '#c82333',
            },
        },
        cancelButton: {
            background: '#6c757d',
            color: 'white',
            '&:hover': {
                background: '#5a6268',
            },
        },
    };

    return (
        <div style={styles.container}>
            <Sidebar />
           
            <main style={styles.mainContent}>
                <div style={styles.formContainer}>
                    <div style={styles.summaryBox}>
                        <p style={styles.summaryText}>
                            You {transactionType === 'give' ? 'give' : 'receive'} 
                            <span style={styles.highlightedAmount}> Rs. {totalAmount.toLocaleString()} </span> 
                            from {customerName}
                        </p>
                    </div>

                    <form onSubmit={handleSave}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Give/Receive Amount (Rs.)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Transaction Type</label>
                                <select
                                    name="transactionType"
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="give">Give</option>
                                    <option value="receive">Receive</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Enter Details Remarks</label>
                                <input
                                    type="text"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Add Bill Number</label>
                                <input
                                    type="text"
                                    name="billNumber"
                                    value={formData.billNumber}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Attach File</label>
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleFileChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.buttonContainer}>
                            <button type="submit" style={{ ...styles.button, ...styles.saveButton }}>
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}; 