import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

interface PaymentHistory {
    id: number;
    createdAt: string;
    type: string;
    amount: number;
    remarks: string;
    newBalance: number;
}

interface CustomerData {
    name: string;
    phoneNumber: string;
    profileImage: string | null;
    balance: number;
}

interface ReportData {
    customer: CustomerData;
    paymentHistory: PaymentHistory[];
    totals: {
        given: number;
        received: number;
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
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#dc4c39',
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
    customerInfo: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        border: '1px solid #dee2e6',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    infoLabel: {
        fontSize: 10,
        color: '#6c757d',
        fontWeight: 'bold',
    },
    infoValue: {
        fontSize: 12,
        color: '#212529',
    },
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        border: '1px solid #dee2e6',
        marginBottom: 15,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryTitle: {
        fontSize: 10,
        color: '#6c757d',
        marginBottom: 3,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    gaveValue: {
        color: '#dc3545',
    },
    receivedValue: {
        color: '#28a745',
    },
    netValue: {
        color: '#17a2b8',
    },
    table: {
        width: '100%',
        marginTop: 10,
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderBottom: '1px solid #dee2e6',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#212529',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #dee2e6',
    },
    tableCell: {
        padding: 8,
        fontSize: 10,
        color: '#212529',
        flex: 1,
    },
    amountCell: {
        textAlign: 'right',
    },
    footer: {
        marginTop: 15,
        paddingTop: 10,
        borderTop: '1px solid #dee2e6',
        fontSize: 10,
        color: '#6c757d',
        textAlign: 'center',
    },
});

const CustomerStatementsPDFTemplate: React.FC<{ data: ReportData }> = ({ data }) => {
    const { customer, paymentHistory, totals } = data;
    const netBalance = totals.received - totals.given;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Customer Statement Report</Text>
                    <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
                </View>

                <View style={styles.customerInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Customer Name:</Text>
                        <Text style={styles.infoValue}>{customer.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone Number:</Text>
                        <Text style={styles.infoValue}>{customer.phoneNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Current Balance:</Text>
                        <Text style={styles.infoValue}>रु{customer.balance.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.summarySection}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryTitle}>Total Given</Text>
                        <Text style={[styles.summaryValue, styles.gaveValue]}>रु{totals.given.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryTitle}>Total Received</Text>
                        <Text style={[styles.summaryValue, styles.receivedValue]}>रु{totals.received.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryTitle}>Net Balance</Text>
                        <Text style={[styles.summaryValue, styles.netValue]}>रु{netBalance.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>Date</Text>
                        <Text style={styles.tableHeader}>Type</Text>
                        <Text style={[styles.tableHeader, styles.amountCell]}>Amount</Text>
                        <Text style={styles.tableHeader}>Remarks</Text>
                        <Text style={[styles.tableHeader, styles.amountCell]}>Balance</Text>
                    </View>
                    {paymentHistory.map((transaction) => (
                        <View key={transaction.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>
                                {new Date(transaction.createdAt).toLocaleDateString()}
                            </Text>
                            <Text style={styles.tableCell}>{transaction.type}</Text>
                            <Text style={[styles.tableCell, styles.amountCell]}>
                                रु{Math.abs(transaction.amount).toLocaleString()}
                            </Text>
                            <Text style={styles.tableCell}>{transaction.remarks}</Text>
                            <Text style={[styles.tableCell, styles.amountCell]}>
                                रु{transaction.newBalance.toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text>This is a computer-generated statement. No signature is required.</Text>
                    <Text>Total Transactions: {paymentHistory.length}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default CustomerStatementsPDFTemplate; 