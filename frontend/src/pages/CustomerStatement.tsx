import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import html3pdf from 'html3pdf';
import StatementPDFTemplate from '../components/StatementPDFTemplate';

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

    const pdfRef = useRef<HTMLDivElement>(null);

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

    const handleDelete = () => {
        // Navigate back to statements page
        navigate(-1);
    };

    const handlePrintPDF = () => {
        // Handle print PDF functionality
        console.log('Print PDF clicked');
    };

    const handleDownloadPDF = async () => {
        const element = pdfRef.current;
        if (!element) {
            console.error('PDF reference not found');
            return;
        }

        const opt = {
            margin: 1,
            filename: `statement_${formData.customerName}_${formData.date}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'in', 
                format: 'letter',
                orientation: 'portrait' as const
            }
        };

        try {
            await html3pdf().set(opt).from(element).save();
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

    const pdfStyles = {
        pdfContainer: {
            position: 'absolute' as const,
            left: '-9999px',
            top: '-9999px',
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            background: 'white',
        },
        pdfCard: {
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        pdfHeader: {
            textAlign: 'center' as const,
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '2px solid #f0f0f0',
        },
        pdfTitle: {
            fontSize: '24px',
            color: '#333',
            marginBottom: '10px',
        },
        pdfSubtitle: {
            fontSize: '16px',
            color: '#666',
        },
        pdfContent: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px',
        },
        pdfField: {
            marginBottom: '15px',
        },
        pdfLabel: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '5px',
        },
        pdfValue: {
            fontSize: '16px',
            color: '#333',
            fontWeight: '500',
        },
        pdfFooter: {
            textAlign: 'center' as const,
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '2px solid #f0f0f0',
            color: '#666',
            fontSize: '14px',
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

            {/* PDF Template (positioned off-screen) */}
            <div ref={pdfRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <StatementPDFTemplate formData={formData} />
            </div>
        </div>
    );
}; 