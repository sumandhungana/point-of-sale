import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet
} from '@react-pdf/renderer';
import { registerFonts, DEVANAGARI_FAMILY, DEVANAGARI_ENABLED, getCurrencySymbol } from '@/components/fonts';
import logo from "@/assets/logo.png";
import { GetPaymentResponse, SupplierData} from "@/features/services/paymentService";


interface ReportData {
    companyName?: string;
    companyDetails?: string;
    companyPhone?: string;
    startDate?: string;
    endDate?: string;
    openingBalance?: number | string;
    openingBalanceDate?: string;
    supplier: SupplierData;
    paymentHistory: GetPaymentResponse[];
    totals: {
        given: number | string;
        received: number | string;
    };
}

/* ------------------ Helpers ------------------ */
const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    const clean = String(val).replace(/[^\d.-]/g, '');
    if (!clean) return 0;
    const num = Number(clean);
    return Number.isFinite(num) ? num : 0;
};

const formatNumber = (val: any): string => {
    return toNumber(val).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-US');
};

const getReportDateRange = (transactions: GetPaymentResponse[]) => {
    if (!transactions || transactions.length === 0) {
        return {
            oldestDate: '-',
            latestDate: '-',
        };
    }

    const dates = transactions
        .map(tx => new Date(tx.createdAt))
        .filter(date => !isNaN(date.getTime()));

    if (dates.length === 0) {
        return {
            oldestDate: '-',
            latestDate: '-',
        };
    }

    const oldestDate = new Date(
        Math.min(...dates.map(date => date.getTime()))
    );

    const latestDate = new Date(
        Math.max(...dates.map(date => date.getTime()))
    );

    return {
        oldestDate: formatDate(oldestDate.toISOString()),
        latestDate: formatDate(latestDate.toISOString()),
    };
};

const formatMonthYear = (dateString: string): string => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
        ? 'Unknown Month'
        : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const groupTransactionsByMonth = (txs: GetPaymentResponse[]) => {
    const groups: { [key: string]: GetPaymentResponse[] } = {};
    txs.forEach(tx => {
        const key = formatMonthYear(tx.createdAt);
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
    });
    return groups;
};

const CURRENCY_SYMBOL = getCurrencySymbol() || 'Rs.';

registerFonts();

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: DEVANAGARI_ENABLED ? DEVANAGARI_FAMILY : 'Helvetica',
        fontSize: 10,
        color: '#000000',
        position: 'relative'
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    // companyName: {
    //   fontSize: 14,
    //   fontWeight: 'bold'
    // },
    // logoBoxContainer: {
    //   alignItems: 'center'
    // },
    logoBox: {
        width: 60,
        height: 30,
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 2
    },
    logoText: {
        fontSize: 8
    },
    // divider: {
    //   borderBottomWidth: 1,
    //   borderColor: '#000000',
    //   marginBottom: 15
    // },


    metaText: {
        fontSize: 10,
        marginBottom: 4
    },
    summaryGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 18,
    },
    openingCard: {
        width: "24%",
        backgroundColor: "#8daef6",
        borderRadius: 8,
        padding: 12,
    },
    openingTitle: {
        color: "#0c0c0c",
        fontSize: 10,
        marginBottom: 6,
        fontWeight: "bold",
    },
    openingValue: {
        color: "#0c0c0c",
        fontSize: 17,
        fontWeight: "bold",
    },
    openingSub: {
        color: "#E5E7EB",
        fontSize: 8,
        marginTop: 8,
    },
    giveCard: {
        width: "24%",
        backgroundColor: "#efacac",
        borderRadius: 8,
        padding: 12,
    },
    giveTitle: {
        color: "#ea1414",
        fontSize: 10,
        marginBottom: 6,
        fontWeight: "bold",
    },
    giveValue: {
        color: "#ea1414",
        fontSize: 17,
        fontWeight: "bold",
    },
    receivedCard: {
        width: "24%",
        backgroundColor: "#8bd9a8",
        borderRadius: 8,
        padding: 12,
    },
    receivedTitle: {
        color: "#15803D",
        fontSize: 10,
        marginBottom: 6,
        fontWeight: "bold",
    },
    receivedValue: {
        color: "#15803D",
        fontSize: 17,
        fontWeight: "bold",
    },
    netCardPositive: {
        width: "24%",
        backgroundColor: "#7eeaa7",
        borderRadius: 8,
        padding: 12,
    },
    netCardNegative: {
        width: "24%",
        backgroundColor: "#efacac",
        borderRadius: 8,
        padding: 12,
    },
    netTitle: {
        color: "#0a0a0a",
        fontSize: 10,
        marginBottom: 6,
        fontWeight: "bold",
    },
    netValue: {
        color: "#0a0a0a",
        fontSize: 17,
        fontWeight: "bold",
    },
    netSub: {
        color: "#0a0a0a",
        fontSize: 8,
        marginTop: 8,
    },
    countLabel: {
        fontSize: 10,
        marginBottom: 10,
        fontWeight: 'bold'
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 20
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableRowLast: {
        flexDirection: 'row'
    },
    headerCell: {
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRightWidth: 1,
        borderColor: "#FFFFFF",
    },
    headerText: {
        color: "#050505",
        fontWeight: "bold",
        fontSize: 10,
        textAlign: "center",
    },

    headerGiveText: {
        color: "#bb0404",
        fontWeight: "bold",
        fontSize: 10,
        textAlign: "center",
    },
    headerReceiveText: {
        color: "#15803D",
        fontWeight: "bold",
        fontSize: 10,
        textAlign: "center",
    },
    dateHeader: { backgroundColor: "#6B7280" },
    remarksHeader: { backgroundColor: "#ecb65c" },
    giveHeader: { backgroundColor: "#ea9090" },
    receiveHeader: { backgroundColor: "#8bd9a8" },
    balanceHeader: { backgroundColor: "#9bb7f5" },

    tableCell: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        fontSize: 10,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#D1D5DB",
    },
    cellText: {
        fontSize: 10,
        color: "#000000"
    },
    cellTextRight: {
        fontSize: 10,
        color: "#000000",
        textAlign: "right"
    },
    cellLast: {
        borderRightWidth: 0
    },
    colDate: { width: '18%' },
    colRemarks: { width: '34%' },
    colGive: { width: '16%' },
    colReceive: { width: '16%' },
    colBalance: { width: '16%' },

    monthHeaderCell: {
        padding: 6,
        fontSize: 9,
        backgroundColor: '#f2f2f2',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000000'
    },
    monthHeaderText: {
        fontWeight: 'bold',
        color: '#000000'
    },
    giveCell: {
        backgroundColor: "#FEE2E2",
    },
    giveCellText: {
        color: "#B91C1C",
        fontWeight: "bold",
        textAlign: "right"
    },
    receiveCell: {
        backgroundColor: "#DCFCE7",
    },
    receiveCellText: {
        color: "#15803D",
        fontWeight: "bold",
        textAlign: "right"
    },
    balanceCell: {
        backgroundColor: "#b4d1f5",
    },
    balanceCellText: {
        color: "#0e48ec",
        fontWeight: "bold",
        textAlign: "right"
    },
    footerContainer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30
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

    customerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },



    customerSection: {
        marginTop: 8,
        marginBottom: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#D1D5DB",
    },

    statementTitle: {
        fontSize: 13,
        fontWeight: "bold",
        marginBottom: 3,
        textAlign: "center",
    },

    phoneNumber: {
        fontSize: 8,
        color: "#555",
        marginBottom: 2,
        textAlign: "center",
    },

    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    dateText: {
        fontSize: 8,
        color: "#555",
    },

    dateSeparator: {
        fontSize: 8,
        color: "#999",
        marginHorizontal: 4,
    },
    header: {
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
});

/* ------------------ Shared Sub-Component ------------------ */
const TableHeaderBlock = () => (
    <View style={styles.tableRow}>
        <View style={[styles.headerCell, styles.colDate, styles.dateHeader]}>
            <Text style={styles.headerText}>Date</Text>
        </View>
        <View style={[styles.headerCell, styles.colRemarks, styles.remarksHeader]}>
            <Text style={styles.headerText}>Details (Remarks)</Text>
        </View>
        <View style={[styles.headerCell, styles.colGive, styles.giveHeader]}>
            <Text style={styles.headerGiveText}>Give</Text>
        </View>
        <View style={[styles.headerCell, styles.colReceive, styles.receiveHeader]}>
            <Text style={styles.headerReceiveText}>Received</Text>
        </View>
        <View style={[styles.headerCell, styles.colBalance, styles.balanceHeader, styles.cellLast]}>
            <Text style={styles.headerText}>Balance</Text>
        </View>
    </View>
);

/* ------------------ Main Component ------------------ */
const SupplierStatementsPDFTemplate: React.FC<{ data: ReportData }> = ({ data }) => {
    const {
        supplier,
        paymentHistory = [],
        totals,
        companyName = localStorage.getItem('companyName') || 'Admin',
        companyDetails = 'Company Details',
        companyPhone = 'Phone Number',
        openingBalance = 0,
        openingBalanceDate = '-'
    } = data;

    const givenNum = toNumber(totals.given);
    const receivedNum = toNumber(totals.received);
    const netBalanceNum = receivedNum - givenNum;

    const groupedTxs = groupTransactionsByMonth(paymentHistory);
    const monthKeys = Object.keys(groupedTxs);
    const { oldestDate, latestDate } = getReportDateRange(paymentHistory);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Top Navbar Section Layout */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>{companyName}</Text>
                    <Image src={logo} style={styles.logo} />
                </View>

                <View style={styles.divider} />
                <View style={styles.customerSection}>
                    <Text style={styles.statementTitle}>
                        Statement of {(supplier.name?.trim() || "Customer Name").toUpperCase()}
                    </Text>
                    <Text style={styles.phoneNumber}>
                        Phone: {supplier.phoneNumber || "-"}
                    </Text>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateText}>From: {oldestDate}</Text>
                        <Text style={styles.dateSeparator}>   |   </Text>
                        <Text style={styles.dateText}>To: {latestDate}</Text>
                    </View>
                </View>
                {/* Bounded Metrics Matrix Box */}
                <View style={styles.summaryGrid}>
                    <View style={styles.openingCard}>
                        <Text style={styles.openingTitle}>Opening Balance</Text>
                        <Text style={styles.openingValue}>
                            {CURRENCY_SYMBOL} {formatNumber(openingBalance)}
                        </Text>
                        <Text style={styles.openingSub}>
                            Date : {openingBalanceDate}
                        </Text>
                    </View>

                    <View style={styles.giveCard}>
                        <Text style={styles.giveTitle}>Total Give</Text>
                        <Text style={styles.giveValue}>
                            {CURRENCY_SYMBOL} {formatNumber(givenNum)}
                        </Text>
                    </View>

                    <View style={styles.receivedCard}>
                        <Text style={styles.receivedTitle}>Total Received</Text>
                        <Text style={styles.receivedValue}>
                            {CURRENCY_SYMBOL} {formatNumber(receivedNum)}
                        </Text>
                    </View>

                    <View style={netBalanceNum >= 0 ? styles.netCardPositive : styles.netCardNegative}>
                        <Text style={styles.netTitle}>Net Balance</Text>
                        <Text style={styles.netValue}>
                            {CURRENCY_SYMBOL} {formatNumber(Math.abs(netBalanceNum))}
                        </Text>
                        <Text style={styles.netSub}>
                            {netBalanceNum >= 0 ? "Received" : "Give"}
                        </Text>
                    </View>
                </View>

                <Text style={styles.countLabel}>No. of Statements — {paymentHistory.length}</Text>

                {/* Main Operational Tables Render Engine */}
                {monthKeys.length === 0 ? (
                    <View style={styles.table}>
                        <TableHeaderBlock />
                        <View style={styles.tableRowLast}>
                            <View style={[styles.tableCell, { width: '100%', borderRightWidth: 0, borderBottomWidth: 0 }]}>
                                <Text style={{ textAlign: 'center', padding: 15 }}>
                                    No transactions found for the specified interval period.
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    monthKeys.map((monthKey, groupIdx) => {
                        const currentMonthTxs = groupedTxs[monthKey];

                        let localizedGive = 0;
                        let localizedReceive = 0;

                        // Localized subtotal tracking updated to support both shortened and full naming variations safely
                        currentMonthTxs.forEach(tx => {
                            const typeCleaned = String(tx.paymentCategory).toUpperCase();
                            if (typeCleaned === 'GIVE' || typeCleaned === 'GIVEN') {
                                localizedGive += toNumber(tx.amount);
                            } else if (typeCleaned === 'RECEIVE' || typeCleaned === 'RECEIVED') {
                                localizedReceive += toNumber(tx.amount);
                            }
                        });

                        return (
                            <View key={groupIdx} style={styles.table} wrap={false}>
                                {/* Header Row */}
                                <TableHeaderBlock />

                                {/* Opening Month Dynamic Label Anchor Row */}
                                <View style={styles.tableRow}>
                                    <View style={[styles.monthHeaderCell, styles.colDate]}>
                                        <Text style={styles.monthHeaderText}>Full Date</Text>
                                    </View>
                                    <View style={[styles.monthHeaderCell, styles.colRemarks]}>
                                        <Text style={styles.monthHeaderText}>{groupIdx === 0 ? 'Opening Month' : 'Next Month'} ({monthKey})</Text>
                                    </View>
                                    <View style={[styles.monthHeaderCell, styles.colGive]} />
                                    <View style={[styles.monthHeaderCell, styles.colReceive]} />
                                    <View style={[styles.monthHeaderCell, styles.colBalance, styles.cellLast]}>
                                        <Text style={styles.monthHeaderText}>Opening Balance</Text>
                                    </View>
                                </View>

                                {/* Data Records Rows */}
                                {currentMonthTxs.map((tx) => {
                                    const typeCleaned = String(tx.paymentCategory).toUpperCase();
                                    const isGive = typeCleaned === 'GIVE' || typeCleaned === 'GIVEN';
                                    const isReceive = typeCleaned === 'RECEIVE' || typeCleaned === 'RECEIVED';

                                    return (
                                        <View key={tx.id} style={styles.tableRow}>
                                            <View style={[styles.tableCell, styles.colDate]}>
                                                <Text style={styles.cellText}>{formatDate(tx.createdAt)}</Text>
                                            </View>
                                            <View style={[styles.tableCell, styles.colRemarks]}>
                                                <Text style={styles.cellText}>{tx.remarks || '-'}</Text>
                                            </View>
                                            <View style={[styles.tableCell, styles.colGive, styles.giveCell]}>
                                                <Text style={isGive ? styles.giveCellText : styles.cellTextRight}>
                                                    {isGive ? formatNumber(tx.amount) : ''}
                                                </Text>
                                            </View>

                                            {/* RECEIVED COLUMN - ALWAYS HIGHLIGHTED */}
                                            <View style={[styles.tableCell, styles.colReceive, styles.receiveCell]}>
                                                <Text style={isReceive ? styles.receiveCellText : styles.cellTextRight}>
                                                    {isReceive ? formatNumber(tx.amount) : ''}
                                                </Text>
                                            </View>
                                            <View style={[styles.tableCell, styles.colBalance, styles.balanceCell, styles.cellLast]}>
                                                <Text style={styles.balanceCellText}>
                                                    {formatNumber(tx.newBalance)}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}

                                {/* Sub-total Bottom Block */}
                                <View style={styles.tableRowLast}>
                                    <View style={[styles.tableCell, styles.colDate, { borderBottomWidth: 0 }]}>
                                        <Text style={[styles.cellText, { fontWeight: 'bold' }]}>Total</Text>
                                    </View>
                                    <View style={[styles.tableCell, styles.colRemarks, { borderBottomWidth: 0 }]} />
                                    <View style={[styles.tableCell, styles.colGive, { borderBottomWidth: 0 }]}>
                                        <Text style={[styles.cellTextRight, { fontWeight: 'bold' }]}>{formatNumber(localizedGive)}</Text>
                                    </View>
                                    <View style={[styles.tableCell, styles.colReceive, { borderBottomWidth: 0 }]}>
                                        <Text style={[styles.cellTextRight, { fontWeight: 'bold' }]}>{formatNumber(localizedReceive)}</Text>
                                    </View>
                                    <View style={[styles.tableCell, styles.colBalance, styles.cellLast, { borderBottomWidth: 0 }]} />
                                </View>
                            </View>
                        );
                    })
                )}

                {/* Sticky Baseline Layout Footer Block */}
                <View style={styles.footerContainer} fixed>
                    <View style={styles.footerDivider} />
                    <View style={styles.footerTextRow}>
                        <Text style={styles.cellText}>{companyDetails}</Text>
                        <Text style={styles.cellText}>{companyPhone}</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default SupplierStatementsPDFTemplate;