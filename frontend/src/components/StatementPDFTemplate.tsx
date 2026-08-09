import React from 'react';
import {Document, Page, Text, View, StyleSheet, Font, Image} from '@react-pdf/renderer';
import logo from "@/assets/logo.png";

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
        {src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'},
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
            fontWeight: 'bold'
        },
    ],
});

const styles = StyleSheet.create({
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
    page: {
        padding: 30,
        fontSize: 11,
    },

    header: {
        alignItems: "center",
        marginBottom: 25,
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
    },

    subtitle: {
        marginTop: 5,
        fontSize: 10,
        color: "#666",
    },

    infoSection: {
        marginBottom: 20,
    },

    infoRow: {
        flexDirection: "row",
        marginBottom: 6,
    },

    infoLabel: {
        width: 110,
        fontWeight: "bold",
    },

    infoValue: {
        flex: 1,
    },

    table: {
        borderWidth: 1,
        borderColor: "#000",
        marginTop: 10,
    },

    dateCol: {
        width: "22%",
    },

    remarkCol: {
        width: "38%",
    },

    typeCol: {
        width: "18%",
        textAlign: "center",
    },

    amountCol: {
        width: "22%",
        textAlign: "right",
        borderRightWidth: 0,
    },

    notesSection: {
        marginTop: 20,
    },

    notesTitle: {
        fontWeight: "bold",
        marginBottom: 5,
    },

    notesText: {
        lineHeight: 1.5,
    },

    footer: {
        position: "absolute",
        bottom: 25,
        left: 30,
        right: 30,
        alignItems: "center",
        fontSize: 9,
        color: "#666",
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        fontWeight: "bold",
    },

    headerCell: {
        padding: 8,
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "#fff",
    },

    dateHeader: {
        width: "22%",
        backgroundColor: "#6B7280",
    },

    remarksHeader: {
        width: "38%",
        backgroundColor: "#ECB65C",
    },

    typeHeader: {
        width: "18%",
        backgroundColor: "#5B7FFF",
    },

    amountHeader: {
        width: "22%",
        backgroundColor: "#374151",
        borderRightWidth: 0,
    },

    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#D1D5DB",
    },

    cell: {
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: "#D1D5DB",
    },

    receiveCell: {
        backgroundColor: "#8BD9A8",
        textAlign: "center",
        fontWeight: "bold",
    },

    giveCell: {
        backgroundColor: "#EA9090",
        textAlign: "center",
        fontWeight: "bold",
    },

    amountCell: {
        textAlign: "right",
        borderRightWidth: 0,
        fontWeight: "bold",
    },
    logoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 6,
    },
    logo: {
        width: 32,
        height: 32,
        objectFit: "contain",
        marginLeft: 10,
    },

    companyName: {
        fontSize: 14,
        fontWeight: "bold",
        flex: 1,
        textAlign: "left",
    },

    divider: {
        borderBottomWidth: 0.8,
        borderColor: "#D1D5DB",
        marginTop: 4,
        marginBottom: 8,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        marginBottom: 10,
    },
    footerDivider: {
        borderTopWidth: 1,
        borderColor: '#000000',
        marginBottom: 5
    },
    footerTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    cellText: {
        fontSize: 10,
        color: "#000000"
    },
});


const StatementPDFTemplate: React.FC<StatementPDFTemplateProps> = ({formData}) => {
    const companyName = localStorage.getItem("companyName") || "Admin";
    const companyDetails = 'Company Details';
    const companyPhone = 'Phone Number';
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.logoHeader}>
                    <Text style={styles.companyName}>{companyName}</Text>
                    <Image src={logo} style={styles.logo}/>
                </View>

                <View style={styles.divider}/>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Payment Statement of {formData.customerName}
                    </Text>

                    <Text style={styles.subtitle}>
                        Generated on {new Date().toLocaleDateString()}
                    </Text>
                </View>

                {/* Customer Details */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Customer Name:</Text>
                        <Text style={styles.infoValue}>{formData.customerName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone Number:</Text>
                        <Text style={styles.infoValue}>{formData.phoneNumber}</Text>
                    </View>
                </View>

                {/* Statement Table */}
                <View style={styles.table}>
                    {/* Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.dateHeader]}>Date</Text>
                        <Text style={[styles.headerCell, styles.remarksHeader]}>Remarks</Text>
                        <Text style={[styles.headerCell, styles.typeHeader]}>Give / Receive</Text>
                        <Text style={[styles.headerCell, styles.amountHeader]}>Amount</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={[styles.cell, styles.dateCol]}>
                            {formData.date}
                        </Text>

                        <Text style={[styles.cell, styles.remarkCol]}>
                            {formData.remarks || "-"}
                        </Text>

                        <Text
                            style={[
                                styles.cell,
                                styles.typeCol,
                                formData.type === "payment_in"
                                    ? styles.receiveCell
                                    : styles.giveCell,
                            ]}
                        >
                            {formData.type === "payment_in" ? "Receive" : "Give"}
                        </Text>

                        <Text
                            style={[
                                styles.cell,
                                styles.amountCol,
                                styles.amountCell,
                            ]}
                        >
                            Rs. {formData.totalAmount}
                        </Text>
                    </View>
                </View>

                {/* Optional Details */}
                {formData.details && (
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Details</Text>
                        <Text style={styles.notesText}>{formData.details}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footerContainer} fixed>
                    <View style={styles.footerDivider}/>
                    <View style={styles.footerTextRow}>
                        <Text style={styles.cellText}>{companyDetails}</Text>
                        <Text style={styles.cellText}>{companyPhone}</Text>
                    </View>
                </View>
                <View style={styles.footer}>
                    <Text>
                        This is a computer-generated payment statement. No signature is required.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default StatementPDFTemplate; 