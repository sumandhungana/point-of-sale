import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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

// Register fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        },
        header: {
        textAlign: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#4a90e2',
            color: 'white',
        },
        title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        },
        subtitle: {
        fontSize: 12,
        opacity: 0.9,
        },
        content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginVertical: 10,
        },
        section: {
        flex: 1,
        minWidth: 250,
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 4,
        border: '1px solid #e0e0e0',
        },
        field: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 4,
        },
        label: {
        fontSize: 10,
            color: '#666',
        marginBottom: 3,
        fontWeight: 'bold',
        },
        value: {
        fontSize: 12,
            color: '#333',
        fontWeight: 'bold',
        },
        amount: {
            color: '#28a745',
        fontSize: 14,
        fontWeight: 'bold',
        },
        footer: {
        textAlign: 'center',
        marginTop: 15,
        paddingTop: 10,
        borderTop: '1px solid #e0e0e0',
            color: '#666',
        fontSize: 10,
        },
        type: {
        padding: '3 6',
        borderRadius: 3,
        fontWeight: 'bold',
        fontSize: 10,
        marginTop: 3,
        },
        paymentIn: {
            backgroundColor: '#d4edda',
        color: '#155724',
        },
        paymentOut: {
            backgroundColor: '#f8d7da',
        color: '#721c24',
    },
});

const StatementPDFTemplate: React.FC<StatementPDFTemplateProps> = ({ formData }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Payment Statement</Text>
                    <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
                </View>
            
                <View style={styles.content}>
                    <View style={styles.section}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Customer Name</Text>
                            <Text style={styles.value}>{formData.customerName}</Text>
                        </View>
                    
                        <View style={styles.field}>
                            <Text style={styles.label}>Amount</Text>
                            <Text style={[styles.value, styles.amount]}>Rs. {formData.totalAmount}</Text>
                        </View>
                    
                        <View style={styles.field}>
                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.value}>{formData.date}</Text>
                        </View>
                    
                        <View style={styles.field}>
                            <Text style={styles.label}>Transaction Type</Text>
                            <Text style={styles.value}>
                            {formData.type === 'payment_in' ? 'Payment Received' : 'Payment Given'}
                            </Text>
                            <Text style={[
                                styles.type,
                                formData.type === 'payment_in' ? styles.paymentIn : styles.paymentOut
                            ]}>
                            {formData.type === 'payment_in' ? 'Received' : 'Given'}
                            </Text>
                        </View>
                    </View>
                
                    <View style={styles.section}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Phone Number</Text>
                            <Text style={styles.value}>{formData.phoneNumber}</Text>
                        </View>
                    
                        <View style={styles.field}>
                            <Text style={styles.label}>Details</Text>
                            <Text style={styles.value}>{formData.details}</Text>
                        </View>
                    
                        <View style={styles.field}>
                            <Text style={styles.label}>Remarks</Text>
                            <Text style={styles.value}>{formData.remarks}</Text>
                        </View>
                    
                        <View style={styles.field}>
                            <Text style={styles.label}>SMS</Text>
                            <Text style={styles.value}>{formData.sms}</Text>
                        </View>
                    </View>
                </View>
            
                <View style={styles.footer}>
                    <Text>This is a computer-generated statement. No signature is required.</Text>
                </View>
            </Page>
        </Document>
    );
};

export default StatementPDFTemplate; 