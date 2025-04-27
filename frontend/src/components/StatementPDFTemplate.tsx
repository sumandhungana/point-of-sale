import React from 'react';

interface StatementPDFTemplateProps {
    formData: {
        customerName: string;
        totalAmount: string;
        date: string;
        type: string;
        phoneNumber: string;
        details: string;
        remarks: string;
        sms: string;
    };
}

const StatementPDFTemplate: React.FC<StatementPDFTemplateProps> = ({ formData }) => {
    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            background: 'white',
            padding: '20px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            fontFamily: 'Arial, sans-serif',
            width: '210mm', // A4 width
            minHeight: '297mm', // A4 height
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center'
        },
        header: {
            textAlign: 'center' as const,
            padding: '20px',
            background: 'linear-gradient(135deg, #4a90e2, #357abd)',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '20px'
        },
        title: {
            fontSize: '28px',
            margin: '0',
            fontWeight: 'bold' as const
        },
        subtitle: {
            fontSize: '16px',
            margin: '10px 0 0',
            opacity: '0.9'
        },
        content: {
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '20px',
            margin: '20px 0'
        },
        section: {
            flex: '1',
            minWidth: '300px',
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
        },
        field: {
            marginBottom: '15px',
            padding: '10px',
            background: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        },
        label: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '5px',
            fontWeight: '500' as const
        },
        value: {
            fontSize: '16px',
            color: '#333',
            fontWeight: '600' as const
        },
        amount: {
            color: '#28a745',
            fontSize: '20px',
            fontWeight: 'bold' as const
        },
        footer: {
            textAlign: 'center' as const,
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '2px solid #e0e0e0',
            color: '#666',
            fontSize: '14px'
        },
        type: {
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: '4px',
            fontWeight: '500' as const,
            fontSize: '14px',
            marginTop: '5px'
        },
        paymentIn: {
            backgroundColor: '#d4edda',
            color: '#155724'
        },
        paymentOut: {
            backgroundColor: '#f8d7da',
            color: '#721c24'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Payment Statement</h1>
                <p style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</p>
            </div>
            
            <div style={styles.content}>
                <div style={styles.section}>
                    <div style={styles.field}>
                        <div style={styles.label}>Customer Name</div>
                        <div style={styles.value}>{formData.customerName}</div>
                    </div>
                    
                    <div style={styles.field}>
                        <div style={styles.label}>Amount</div>
                        <div style={{...styles.value, ...styles.amount}}>Rs. {formData.totalAmount}</div>
                    </div>
                    
                    <div style={styles.field}>
                        <div style={styles.label}>Date</div>
                        <div style={styles.value}>{formData.date}</div>
                    </div>
                    
                    <div style={styles.field}>
                        <div style={styles.label}>Transaction Type</div>
                        <div style={styles.value}>
                            {formData.type === 'payment_in' ? 'Payment Received' : 'Payment Given'}
                        </div>
                        <div style={{
                            ...styles.type,
                            ...(formData.type === 'payment_in' ? styles.paymentIn : styles.paymentOut)
                        }}>
                            {formData.type === 'payment_in' ? 'Received' : 'Given'}
                        </div>
                    </div>
                </div>
                
                <div style={styles.section}>
                    <div style={styles.field}>
                        <div style={styles.label}>Phone Number</div>
                        <div style={styles.value}>{formData.phoneNumber}</div>
                    </div>
                    
                    <div style={styles.field}>
                        <div style={styles.label}>Details</div>
                        <div style={styles.value}>{formData.details}</div>
                    </div>
                    
                    <div style={styles.field}>
                        <div style={styles.label}>Remarks</div>
                        <div style={styles.value}>{formData.remarks}</div>
                    </div>
                    
                    <div style={styles.field}>
                        <div style={styles.label}>SMS</div>
                        <div style={styles.value}>{formData.sms}</div>
                    </div>
                </div>
            </div>
            
            <div style={styles.footer}>
                <p>This is a computer-generated statement. No signature is required.</p>
            </div>
        </div>
    );
};

export default StatementPDFTemplate; 