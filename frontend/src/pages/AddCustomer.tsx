import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

export const AddCustomer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        companyName: '',
        panVatNo: '',
        address: '',
        email: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
        // After successful submission, navigate back to customers page
        navigate('/parties/customers');
    };

    const handleCancel = () => {
        navigate('/parties/customers');
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
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
        },
        formTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '2rem',
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
        submitButton: {
            background: '#dc4c39',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            '&:hover': {
                background: '#c82333',
            },
        },
    };

    return (
        <div style={styles.container}>
            <Sidebar />
           
            <main style={styles.mainContent}>
                <div style={styles.formContainer}>
                    <h2 style={styles.formTitle}>Add New Customer</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Customer Name</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>PAN No / VAT No</label>
                                <input
                                    type="text"
                                    name="panVatNo"
                                    value={formData.panVatNo}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email ID</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" style={styles.submitButton}>
                            Add Customer
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}; 