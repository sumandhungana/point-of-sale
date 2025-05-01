import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import StatementPDFTemplate from '../components/StatementPDFTemplate';
import { deletePaymentGiven, deletePaymentReceived } from '../services/paymentService';
import { toast } from 'react-toastify';

interface TransactionData {
    customerId: number;
    customerName: string;
    totalAmount: number;
    type: string;
    phoneNumber: string;
    details: string;
    remarks: string;
    sms: string;
    date: string;
}

export const CustomerStatement = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const transactionData = location.state?.transaction as TransactionData;

    const [formData, setFormData] = useState({
        type: transactionData?.type || '',
        customerName: transactionData?.customerName || '',
        totalAmount: transactionData?.totalAmount?.toString() || '',
        phoneNumber: transactionData?.phoneNumber || '',
        details: transactionData?.details || '',
        remarks: transactionData?.remarks || '',
        customerId: transactionData?.customerId || '',
        sms: transactionData?.sms || '',
        date: transactionData?.date || '',
    });

    const handleEdit = () => {
        const editData = {
            customerId: formData.customerId,
            customerName: formData.customerName,
            amount: parseFloat(formData.totalAmount),
            remarks: formData.remarks,
            date: formData.date,
            phoneNumber: formData.phoneNumber
        };

        if (transactionData.type === 'payment_in') {
            navigate(`/parties/customers/statements/you-received/${id}`, {
                state: { initialData: editData }
            });
        } else {
            navigate(`/parties/customers/statements/you-gave/${id}`, {
                state: { initialData: editData }
            });
        }
    };

    const handleDelete = async () => {
        try {
            if (transactionData.type === 'payment_in') {
                await deletePaymentReceived(parseInt(id || '0'));
            } else {
                await deletePaymentGiven(parseInt(id || '0'));
            }
            toast.success('Payment deleted successfully');
        navigate(-1);
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast.error('Failed to delete payment');
        }
    };

    const handlePrintPDF = async () => {
        try {
            const blob = await pdf(<StatementPDFTemplate formData={formData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    URL.revokeObjectURL(url);
                }, 1000);
            };
        } catch (error) {
            console.error('Error printing PDF:', error);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const blob = await pdf(<StatementPDFTemplate formData={formData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `statement_${formData.customerName}_${formData.date}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
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
        formContainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
       mainContent: {
            padding: '2rem',
            marginTop: '64px',
            maxWidth: 'calc(100% - 500px)',
            marginRight: '500px',
            width: '100%',
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
                                disabled
                                value={formData.customerName}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Rs Total</label>
                            <input
                                type="number"
                                name="totalAmount"
                                disabled
                                value={formData.totalAmount}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                disabled
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Details</label>
                            <input
                                type="text"
                                disabled
                                name="details"
                                value={formData.details}
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
                                disabled
                                value={formData.date}
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
                                disabled
                                value={formData.remarks}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>SMS</label>
                            <textarea
                                disabled
                                name="sms"
                                value={formData.sms}
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