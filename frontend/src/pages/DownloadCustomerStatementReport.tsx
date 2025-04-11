import { useState } from "react"
import { Sidebar } from "../components/Sidebar"
import { useNavigate, useParams } from "react-router-dom"

interface Transaction {
  id: number
  date: string
  details: string
  gave: number
  received: number
  balance: number
}

export const DownloadCustomerStatementReport = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [printLogo, setPrintLogo] = useState(false)

  const customerName = "Raj Kumar"
  const phoneNumber = "+91 9876543210"
  const startDate = "01/04/2023"
  const endDate = "30/04/2023"

  const openingBalance = 5000

  const currentMonthTransactions: Transaction[] = [
    { id: 1, date: "05/04/2023", details: "Material purchase", gave: 2000, received: 0, balance: 3000 },
    { id: 2, date: "12/04/2023", details: "Partial payment", gave: 0, received: 1500, balance: 4500 },
    { id: 3, date: "18/04/2023", details: "Transportation", gave: 500, received: 0, balance: 4000 },
    { id: 4, date: "25/04/2023", details: "Service charge", gave: 1000, received: 0, balance: 3000 },
  ]

  const nextMonthTransactions: Transaction[] = [
    { id: 5, date: "03/05/2023", details: "Advance payment", gave: 0, received: 2000, balance: 5000 },
    { id: 6, date: "10/05/2023", details: "New order", gave: 3000, received: 0, balance: 2000 },
    { id: 7, date: "17/05/2023", details: "Final payment", gave: 0, received: 4000, balance: 6000 },
  ]

  // Calculate totals for current month
  const currentMonthTotalGave = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.gave, 0)
  const currentMonthTotalReceived = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.received, 0)

  // Calculate totals for next month
  const nextMonthTotalGave = nextMonthTransactions.reduce((sum, transaction) => sum + transaction.gave, 0)
  const nextMonthTotalReceived = nextMonthTransactions.reduce((sum, transaction) => sum + transaction.received, 0)

  // Calculate overall totals
  const totalGave = currentMonthTotalGave + nextMonthTotalGave
  const totalReceived = currentMonthTotalReceived + nextMonthTotalReceived
  const netBalance = openingBalance + totalReceived - totalGave

  const totalStatements = currentMonthTransactions.length + nextMonthTransactions.length

  const handleBack = () => {
    navigate(`/parties/customers/statements/report/${id}`)
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8f9fa',
    },
   
    mainContent: {
      padding: '2rem',
      marginTop: '64px',
    },
    contentContainer: {
      background: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    backButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#dc4c39',
      padding: '0.5rem',
      '&:hover': {
        color: '#c23321',
      },
    },
    reportTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#212529',
      textAlign: 'center' as const,
      marginBottom: '0.5rem',
      borderBottom: '2px solid #dc4c39',
      paddingBottom: '0.5rem',
    },
    logoSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    logoImage: {
      width: '50px',
      height: '50px',
      borderRadius: '4px',
      backgroundColor: '#dc4c39',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.5rem',
      color: 'white',
    },
    companyName: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#dc4c39',
    },
    printOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    reportDate: {
      color: '#6c757d',
      textAlign: 'center' as const,
      marginBottom: '1.5rem',
    },
    summarySection: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '1rem',
      background: '#f8f9fa',
      borderRadius: '4px',
      marginBottom: '1.5rem',
      border: '1px solid #dee2e6',
    },
    summaryItem: {
      textAlign: 'center' as const,
    },
    summaryItemTitle: {
      color: '#6c757d',
      marginBottom: '0.5rem',
    },
    summaryItemValue: {
      fontSize: '1.25rem',
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
    summaryDivider: {
      width: '1px',
      background: '#dee2e6',
    },
    customerCount: {
      color: '#6c757d',
      marginBottom: '1rem',
      padding: '0.5rem',
      background: '#f8f9fa',
      borderRadius: '4px',
      textAlign: 'center' as const,
    },
    tableContainer: {
      marginTop: '2rem',
      overflowX: 'auto' as const,
    },
    customerTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '1rem',
    },
    tableHeader: {
      background: '#f8f9fa',
      padding: '0.75rem',
      textAlign: 'left' as const,
      borderBottom: '2px solid #dee2e6',
      color: '#212529',
      fontWeight: 'bold',
    },
    tableCell: {
      padding: '0.75rem',
      borderBottom: '1px solid #dee2e6',
    },
    totalBalance: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '1rem',
      textAlign: 'right' as const,
    },
    reportFooter: {
      textAlign: 'center' as const,
      color: '#6c757d',
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid #dee2e6',
      background: '#f8f9fa',
      padding: '1rem',
      borderRadius: '4px',
    },
  }

  return (
    <div style={styles.container}>
      <Sidebar />
    
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <button style={styles.backButton} onClick={handleBack}>
              ←
            </button>
          </div>

     

          <div style={styles.reportDate}>
            <div>{customerName} Statement</div>
            <div>Phone Number: {phoneNumber}</div>
            <div>Start Date: {startDate}</div>
            <div>End Date: {endDate}</div>
          </div>

          <div style={styles.summarySection}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryItemTitle}>Opening Balance</div>
              <div style={styles.summaryItemValue}>Rs. {openingBalance.toLocaleString()}</div>
              <div style={styles.summaryItemTitle}>Date: {startDate}</div>
            </div>
            <div style={styles.summaryDivider} />
            <div style={styles.summaryItem}>
              <div style={styles.summaryItemTitle}>Total Gave</div>
              <div style={{ ...styles.summaryItemValue, ...styles.gaveValue }}>Rs. {totalGave.toLocaleString()}</div>
            </div>
            <div style={styles.summaryDivider} />
            <div style={styles.summaryItem}>
              <div style={styles.summaryItemTitle}>Total Received</div>
              <div style={{ ...styles.summaryItemValue, ...styles.receivedValue }}>Rs. {totalReceived.toLocaleString()}</div>
            </div>
            <div style={styles.summaryDivider} />
            <div style={styles.summaryItem}>
              <div style={styles.summaryItemTitle}>Net Balance</div>
              <div style={{ ...styles.summaryItemValue, ...styles.netValue }}>Rs. {netBalance.toLocaleString()}</div>
              <div style={styles.summaryItemTitle}>{netBalance >= 0 ? "Received" : "Gave"}</div>
            </div>
          </div>

          <div style={styles.customerCount}>No. of Statements: {totalStatements}</div>

          <div style={styles.tableContainer}>
            <table style={styles.customerTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Date</th>
                  <th style={styles.tableHeader}>Details(Remarks)</th>
                  <th style={styles.tableHeader}>Gave</th>
                  <th style={styles.tableHeader}>Received</th>
                  <th style={styles.tableHeader}>Balance</th>
                </tr>
                <tr>
                  <th style={styles.tableHeader} colSpan={3}>Full Date Opening Month</th>
                  <th style={styles.tableHeader} colSpan={2}>Opening Balance: Rs. {openingBalance.toLocaleString()}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.tableCell}>{startDate}</td>
                  <td style={styles.tableCell}>Opening Balance</td>
                  <td style={styles.tableCell}>-</td>
                  <td style={styles.tableCell}>-</td>
                  <td style={styles.tableCell}>Rs. {openingBalance.toLocaleString()}</td>
                </tr>
                {currentMonthTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td style={styles.tableCell}>{transaction.date}</td>
                    <td style={styles.tableCell}>{transaction.details}</td>
                    <td style={styles.tableCell}>
                      {transaction.gave > 0 ? `Rs. ${transaction.gave.toLocaleString()}` : "-"}
                    </td>
                    <td style={styles.tableCell}>
                      {transaction.received > 0 ? `Rs. ${transaction.received.toLocaleString()}` : "-"}
                    </td>
                    <td style={styles.tableCell}>Rs. {transaction.balance.toLocaleString()}</td>
                  </tr>
                ))}
                <tr>
                  <td style={styles.tableCell} colSpan={2}>
                    <strong>Total</strong>
                  </td>
                  <td style={styles.tableCell}>
                    <strong>Rs. {currentMonthTotalGave.toLocaleString()}</strong>
                  </td>
                  <td style={styles.tableCell}>
                    <strong>Rs. {currentMonthTotalReceived.toLocaleString()}</strong>
                  </td>
                  <td style={styles.tableCell}></td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '2rem' }}>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                color: '#212529',
                marginBottom: '1rem',
                padding: '0.5rem',
                background: '#f8f9fa',
                borderRadius: '4px'
              }}>
                Full Date: Next Month
              </div>
              <table style={styles.customerTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Details(Remarks)</th>
                    <th style={styles.tableHeader}>Gave</th>
                    <th style={styles.tableHeader}>Received</th>
                    <th style={styles.tableHeader}>Balance</th>
                  </tr>
                  <tr>
                    <th style={styles.tableHeader} colSpan={3}>Full Date Next Month</th>
                    <th style={styles.tableHeader} colSpan={2}>Opening Balance: Rs. {openingBalance.toLocaleString()}</th>
                  </tr>
                </thead>
                <tbody>
                  {nextMonthTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={styles.tableCell}>{transaction.date}</td>
                      <td style={styles.tableCell}>{transaction.details}</td>
                      <td style={styles.tableCell}>
                        {transaction.gave > 0 ? `Rs. ${transaction.gave.toLocaleString()}` : "-"}
                      </td>
                      <td style={styles.tableCell}>
                        {transaction.received > 0 ? `Rs. ${transaction.received.toLocaleString()}` : "-"}
                      </td>
                      <td style={styles.tableCell}>Rs. {transaction.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={styles.tableCell} colSpan={2}>
                      <strong>Total</strong>
                    </td>
                    <td style={styles.tableCell}>
                      <strong>Rs. {nextMonthTotalGave.toLocaleString()}</strong>
                    </td>
                    <td style={styles.tableCell}>
                      <strong>Rs. {nextMonthTotalReceived.toLocaleString()}</strong>
                    </td>
                    <td style={styles.tableCell}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.reportFooter}>
            <div>Company Details</div>
            <div>Phone Number</div>
          </div>
        </div>
      </main>
    </div>
  )
}
