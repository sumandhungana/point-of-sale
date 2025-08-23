import { useState } from "react"
import { Sidebar } from "../components/Sidebar"
import { useNavigate, useParams } from "react-router-dom"
import '../styles/DownloadCustomerStatementReport.css'

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

  return (
    <div className="download-statement-container">
      <Sidebar />
    
      <main className="download-statement-main-content">
        <div className="download-statement-content-container">
          <div className="download-statement-button-container">
            <button className="download-statement-back-button" onClick={handleBack}>
              <i className="bi bi-arrow-left"></i>
              Back
            </button>
          </div>

          <div className="download-statement-report-date">
            <div>
              <i className="bi bi-person me-1"></i>
              {customerName} Statement
            </div>
            <div>
              <i className="bi bi-telephone me-1"></i>
              Phone Number: {phoneNumber}
            </div>
            <div>
              <i className="bi bi-calendar-event me-1"></i>
              Start Date: {startDate}
            </div>
            <div>
              <i className="bi bi-calendar-check me-1"></i>
              End Date: {endDate}
            </div>
          </div>

          <div className="download-statement-summary-section">
            <div className="download-statement-summary-item">
              <div className="download-statement-summary-item-title">
                <i className="bi bi-calculator me-1"></i>
                Opening Balance
              </div>
              <div className="download-statement-summary-item-value">Rs. {openingBalance.toLocaleString()}</div>
              <div className="download-statement-summary-item-title">Date: {startDate}</div>
            </div>
            <div className="download-statement-summary-divider" />
            <div className="download-statement-summary-item">
              <div className="download-statement-summary-item-title">
                <i className="bi bi-arrow-up-circle me-1"></i>
                Total Gave
              </div>
              <div className="download-statement-summary-item-value download-statement-gave-value">Rs. {totalGave.toLocaleString()}</div>
            </div>
            <div className="download-statement-summary-divider" />
            <div className="download-statement-summary-item">
              <div className="download-statement-summary-item-title">
                <i className="bi bi-arrow-down-circle me-1"></i>
                Total Received
              </div>
              <div className="download-statement-summary-item-value download-statement-received-value">Rs. {totalReceived.toLocaleString()}</div>
            </div>
            <div className="download-statement-summary-divider" />
            <div className="download-statement-summary-item">
              <div className="download-statement-summary-item-title">
                <i className="bi bi-calculator me-1"></i>
                Net Balance
              </div>
              <div className="download-statement-summary-item-value download-statement-net-value">Rs. {netBalance.toLocaleString()}</div>
              <div className="download-statement-summary-item-title">{netBalance >= 0 ? "Received" : "Gave"}</div>
            </div>
          </div>

          <div className="download-statement-customer-count">
            <i className="bi bi-file-text me-1"></i>
            No. of Statements: {totalStatements}
          </div>

          <div className="download-statement-table-container">
            <table className="download-statement-table">
              <thead>
                <tr>
                  <th className="download-statement-table-header">
                    <i className="bi bi-calendar-event me-1"></i>
                    Date
                  </th>
                  <th className="download-statement-table-header">
                    <i className="bi bi-info-circle me-1"></i>
                    Details(Remarks)
                  </th>
                  <th className="download-statement-table-header">
                    <i className="bi bi-arrow-up-circle me-1"></i>
                    Gave
                  </th>
                  <th className="download-statement-table-header">
                    <i className="bi bi-arrow-down-circle me-1"></i>
                    Received
                  </th>
                  <th className="download-statement-table-header">
                    <i className="bi bi-calculator me-1"></i>
                    Balance
                  </th>
                </tr>
                <tr>
                  <th className="download-statement-table-header" colSpan={3}>
                    <i className="bi bi-calendar-month me-1"></i>
                    Full Date Opening Month
                  </th>
                  <th className="download-statement-table-header" colSpan={2}>
                    Opening Balance: Rs. {openingBalance.toLocaleString()}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="download-statement-table-cell">{startDate}</td>
                  <td className="download-statement-table-cell">Opening Balance</td>
                  <td className="download-statement-table-cell">-</td>
                  <td className="download-statement-table-cell">-</td>
                  <td className="download-statement-table-cell">Rs. {openingBalance.toLocaleString()}</td>
                </tr>
                {currentMonthTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="download-statement-table-cell">{transaction.date}</td>
                    <td className="download-statement-table-cell">{transaction.details}</td>
                    <td className="download-statement-table-cell">
                      {transaction.gave > 0 ? `Rs. ${transaction.gave.toLocaleString()}` : "-"}
                    </td>
                    <td className="download-statement-table-cell">
                      {transaction.received > 0 ? `Rs. ${transaction.received.toLocaleString()}` : "-"}
                    </td>
                    <td className="download-statement-table-cell">Rs. {transaction.balance.toLocaleString()}</td>
                  </tr>
                ))}
                <tr>
                  <td className="download-statement-table-cell" colSpan={2}>
                    <strong>Total</strong>
                  </td>
                  <td className="download-statement-table-cell">
                    <strong>Rs. {currentMonthTotalGave.toLocaleString()}</strong>
                  </td>
                  <td className="download-statement-table-cell">
                    <strong>Rs. {currentMonthTotalReceived.toLocaleString()}</strong>
                  </td>
                  <td className="download-statement-table-cell"></td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '2rem' }}>
              <div className="download-statement-month-header">
                <i className="bi bi-calendar-month me-1"></i>
                Full Date: Next Month
              </div>
              <table className="download-statement-table">
                <thead>
                  <tr>
                    <th className="download-statement-table-header">
                      <i className="bi bi-calendar-event me-1"></i>
                      Date
                    </th>
                    <th className="download-statement-table-header">
                      <i className="bi bi-info-circle me-1"></i>
                      Details(Remarks)
                    </th>
                    <th className="download-statement-table-header">
                      <i className="bi bi-arrow-up-circle me-1"></i>
                      Gave
                    </th>
                    <th className="download-statement-table-header">
                      <i className="bi bi-arrow-down-circle me-1"></i>
                      Received
                    </th>
                    <th className="download-statement-table-header">
                      <i className="bi bi-calculator me-1"></i>
                      Balance
                    </th>
                  </tr>
                  <tr>
                    <th className="download-statement-table-header" colSpan={3}>
                      <i className="bi bi-calendar-month me-1"></i>
                      Full Date Next Month
                    </th>
                    <th className="download-statement-table-header" colSpan={2}>
                      Opening Balance: Rs. {openingBalance.toLocaleString()}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nextMonthTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="download-statement-table-cell">{transaction.date}</td>
                      <td className="download-statement-table-cell">{transaction.details}</td>
                      <td className="download-statement-table-cell">
                        {transaction.gave > 0 ? `Rs. ${transaction.gave.toLocaleString()}` : "-"}
                      </td>
                      <td className="download-statement-table-cell">
                        {transaction.received > 0 ? `Rs. ${transaction.received.toLocaleString()}` : "-"}
                      </td>
                      <td className="download-statement-table-cell">Rs. {transaction.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="download-statement-table-cell" colSpan={2}>
                      <strong>Total</strong>
                    </td>
                    <td className="download-statement-table-cell">
                      <strong>Rs. {nextMonthTotalGave.toLocaleString()}</strong>
                    </td>
                    <td className="download-statement-table-cell">
                      <strong>Rs. {nextMonthTotalReceived.toLocaleString()}</strong>
                    </td>
                    <td className="download-statement-table-cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="download-statement-report-footer">
            <div>
              <i className="bi bi-building me-1"></i>
              Company Details
            </div>
            <div>
              <i className="bi bi-telephone me-1"></i>
              Phone Number
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
