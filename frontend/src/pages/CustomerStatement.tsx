import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface TransactionData {
    customerName: string;
    totalAmount: number;
    phoneNumber: string;
    details: string;
    remarks: string;
    sms: string;
}

export const CustomerStatement = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const transactionData = location.state?.transaction as TransactionData;

    const [formData, setFormData] = useState({
        customerName: transactionData?.customerName || '',
        totalAmount: transactionData?.totalAmount?.toString() || '',
        phoneNumber: transactionData?.phoneNumber || '',
        details: transactionData?.details || '',
        remarks: transactionData?.remarks || '',
        sms: transactionData?.sms || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelete = () => {
        // Handle delete functionality
        console.log('Delete clicked');
    };

    const handleEdit = () => {
        navigate(`/parties/customers/statements/${id}`);
    };

    const handlePrintPDF = () => {
        // Handle print PDF functionality
        console.log('Print PDF clicked');
    };

    const handleDownloadPDF = () => {
        // Handle download PDF functionality
        console.log('Download PDF clicked');
    };

    const handleShare = () => {
        // Handle share functionality
        console.log('Share clicked');
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
        buttonContainer: {
            display: 'flex',
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
            flex: 1,
            textAlign: 'center' as const,
        },
        deleteButton: {
            background: '#dc3545',
            color: 'white',
            '&:hover': {
                background: '#c82333',
            },
        },
        editButton: {
            background: '#ffc107',
            color: '#212529',
            '&:hover': {
                background: '#e0a800',
            },
        },
        printButton: {
            background: '#17a2b8',
            color: 'white',
            '&:hover': {
                background: '#138496',
            },
        },
        downloadButton: {
            background: '#28a745',
            color: 'white',
            '&:hover': {
                background: '#218838',
            },
        },
        shareButton: {
            background: '#6f42c1',
            color: 'white',
            '&:hover': {
                background: '#5a32a3',
            },
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
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Customer Name</label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Rs Total</label>
                            <input
                                type="number"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Details</label>
                            <input
                                type="text"
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Remarks</label>
                            <input
                                type="text"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>SMS</label>
                            <textarea
                                name="sms"
                                value={formData.sms}
                                onChange={handleChange}
                                style={styles.textarea}
                            />
                        </div>
                    </div>

                    <div style={styles.buttonContainer}>
                        <button 
                            style={{...styles.button, ...styles.deleteButton}}
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                        <button 
                            style={{...styles.button, ...styles.editButton}}
                            onClick={handleEdit}
                        >
                            Edit
                        </button>
                        <button 
                            style={{...styles.button, ...styles.printButton}}
                            onClick={handlePrintPDF}
                        >
                            Print PDF
                        </button>
                        <button 
                            style={{...styles.button, ...styles.downloadButton}}
                            onClick={handleDownloadPDF}
                        >
                            Download PDF
                        </button>
                        <button 
                            style={{...styles.button, ...styles.shareButton}}
                            onClick={handleShare}
                        >
                            Share
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}; 