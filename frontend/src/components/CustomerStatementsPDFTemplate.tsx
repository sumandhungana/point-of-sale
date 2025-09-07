import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer';
import { registerFonts, DEVANAGARI_FAMILY, DEVANAGARI_ENABLED, DEVANAGARI_ACTIVE, getCurrencySymbol } from './fonts';

/* ------------------ Types ------------------ */
interface PaymentHistory {
  id: number;
  createdAt: string;
  type: string;
  amount: number | string;
  remarks: string;
  newBalance: number | string;
}

interface CustomerData {
  name: string;
  phoneNumber: string;
  profileImage?: string | null;
  balance: number | string;
}

interface ReportData {
  customer: CustomerData;
  paymentHistory: PaymentHistory[];
  totals: {
    given: number | string;
    received: number | string;
  };
}

/* ------------------ Helpers ------------------ */
const toNumber = (val: number | string | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const clean = val.replace(/[^\d.-]/g, '');
  if (!clean) return 0;
  const num = Number(clean);
  return Number.isFinite(num) ? num : 0;
};

const formatNumber = (
  val: number | string | null | undefined,
  opts?: { decimals?: number; round?: boolean }
): string => {
  const { decimals = 0, round = true } = opts || {};
  let num = toNumber(val);
  if (round) {
    const factor = Math.pow(10, decimals);
    num = Math.round(num * factor) / factor;
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
};

const getRemarks = (remarks: string): string => {
  if (!remarks) return 'No remarks';
  const trimmed = remarks.trim();
  if (!trimmed || trimmed === '.' || trimmed === '.l') return 'No remarks';
  return trimmed;
};

/* ------------------ Currency / Config ------------------ */
// Choose symbol at runtime depending on font availability
const CURRENCY_SYMBOL = getCurrencySymbol();
const SHOW_DECIMALS = false;
const DECIMALS = 2;

/* ------------------ Font Registration (once) ------------------ */
// best-effort register; supports browser/SSR
// note: registerFonts can be async; for browser it resolves quickly
// PDF generation will pick symbol from getCurrencySymbol()
// eslint-disable-next-line @typescript-eslint/no-floating-promises
registerFonts();

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: DEVANAGARI_ENABLED ? DEVANAGARI_FAMILY : 'Helvetica',
    fontSize: 12
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#dc4c39',
    color: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9
  },
  customerInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: 'bold'
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: 'bold'
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 20
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryTitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
    fontWeight: 'bold'
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  gaveValue: {
    color: '#dc3545'
  },
  receivedValue: {
    color: '#28a745'
  },
  netValue: {
    color: '#17a2b8'
  },
  netNegative: {
    color: '#dc3545'
  },
  table: {
    width: '100%',
    marginTop: 15
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1
  },
  tableCell: {
    padding: 12,
    fontSize: 11,
    color: '#212529',
    flex: 1
  },
  amountCell: {
    textAlign: 'right'
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center'
  },
  emptyState: {
    padding: 20,
    textAlign: 'center',
    fontSize: 11,
    color: '#6c757d'
  }
});

/* ------------------ Component ------------------ */
const CustomerStatementsPDFTemplate: React.FC<{ data: ReportData }> = ({ data }) => {
  const { customer, paymentHistory, totals } = data;

  const givenNum = toNumber(totals.given);
  const receivedNum = toNumber(totals.received);
  const netBalanceNum = receivedNum - givenNum;

  const numOpts = { decimals: SHOW_DECIMALS ? DECIMALS : 0 };
  const formattedGiven = formatNumber(givenNum, numOpts);
  const formattedReceived = formatNumber(receivedNum, numOpts);
  const formattedNet = formatNumber(netBalanceNum, numOpts);
  const formattedCustomerBalance = formatNumber(customer.balance, numOpts);

  const netValueStyle =
    netBalanceNum < 0
      ? [styles.summaryValue, styles.netNegative]
      : [styles.summaryValue, styles.netValue];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Customer Statement Report</Text>
            <Text style={styles.subtitle}>
              Generated on {formatDate(new Date().toISOString())}
            </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer Name:</Text>
            <Text style={styles.infoValue}>{customer.name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <Text style={styles.infoValue}>{customer.phoneNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Balance:</Text>
            <Text style={styles.infoValue}>
              {CURRENCY_SYMBOL} {formattedCustomerBalance}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTitle}>Total Given</Text>
            <Text style={[styles.summaryValue, styles.gaveValue]}>
              {CURRENCY_SYMBOL} {formattedGiven}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTitle}>Total Received</Text>
            <Text style={[styles.summaryValue, styles.receivedValue]}>
              {CURRENCY_SYMBOL} {formattedReceived}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTitle}>Net Balance</Text>
            <Text style={netValueStyle}>
              {CURRENCY_SYMBOL} {formattedNet}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Date</Text>
            <Text style={styles.tableHeader}>Type</Text>
            <Text style={[styles.tableHeader, styles.amountCell]}>Amount</Text>
            <Text style={styles.tableHeader}>Remarks</Text>
            <Text style={[styles.tableHeader, styles.amountCell]}>Balance</Text>
          </View>

          {paymentHistory.length === 0 && (
            <Text style={styles.emptyState}>No transactions found.</Text>
          )}

          {paymentHistory.map(tx => {
            const amountFormatted = formatNumber(tx.amount, numOpts);
            const balanceFormatted = formatNumber(tx.newBalance, numOpts);
            return (
              <View key={tx.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{formatDate(tx.createdAt)}</Text>
                <Text style={styles.tableCell}>{tx.type}</Text>
                <Text style={[styles.tableCell, styles.amountCell]}>
                  {CURRENCY_SYMBOL} {amountFormatted}
                </Text>
                <Text style={styles.tableCell}>{getRemarks(tx.remarks)}</Text>
                <Text style={[styles.tableCell, styles.amountCell]}>
                  {CURRENCY_SYMBOL} {balanceFormatted}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated statement. No signature is required.</Text>
          <Text>Total Transactions: {paymentHistory.length}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default CustomerStatementsPDFTemplate;