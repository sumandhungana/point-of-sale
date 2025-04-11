"use client"

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';

interface Customer {
  id: number
  name: string
  dateId: string
  youGave: number
  youReceived: number
  collectionDate: string
}

export const CustomerStatementsReport = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerName = "Ram Kumar";

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");

  const [customers] = useState<Customer[]>([
    { id: 1, name: "Ram", dateId: "1234567", youGave: 5000, youReceived: 3000, collectionDate: "10/04/2023" },
    { id: 2, name: "Shyam", dateId: "1234569", youGave: 7000, youReceived: 4000, collectionDate: "15/04/2023" },
    { id: 3, name: "Hari", dateId: "", youGave: 3000, youReceived: 3000, collectionDate: "20/04/2023" },
    { id: 4, name: "Sita", dateId: "", youGave: 2000, youReceived: 1000, collectionDate: "25/04/2023" },
    { id: 5, name: "Gita", dateId: "", youGave: 4000, youReceived: 2000, collectionDate: "30/04/2023" },
  ]);
  const [printLogo, setPrintLogo] = useState(false);

  const handleBack = () => {
    navigate(`/parties/customers/statements/${id}`);
  };

  const handleGeneratePdf = () => {
    navigate(`/parties/customers/statements/report/${id}/download`);
  };

  // Calculate totals
  const totalGave = customers.reduce((sum, customer) => sum + customer.youGave, 0);
  const totalReceived = customers.reduce((sum, customer) => sum + customer.youReceived, 0);
  const netBalance = totalReceived - totalGave;

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
    controlsCard: {
      background: '#f8f9fa',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid #dee2e6',
      marginBottom: '2rem',
    },
    controlsRow: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap' as const,
    },
    searchInput: {
      padding: '0.5rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      flex: 1,
      minWidth: '200px',
    },
    dropdownSelect: {
      padding: '0.5rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      background: 'white',
      color: '#212529',
      minWidth: '150px',
    },
    dateControls: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap' as const,
    },
    dateLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#6c757d',
      fontSize: '0.875rem',
    },
    dateInput: {
      display: 'flex',
      flexDirection: 'column' as const,
      minWidth: '150px',
    },
    dateSelect: {
      padding: '0.5rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      background: 'white',
      minWidth: '150px',
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
    actionButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '2rem',
    },
    actionButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    downloadButton: {
      background: '#dc4c39',
      color: 'white',
      '&:hover': {
        background: '#c23321',
      },
    },
    shareButton: {
      background: '#28a745',
      color: 'white',
      '&:hover': {
        background: '#218838',
      },
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
     
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <button style={styles.backButton} onClick={handleBack}>
              ←
            </button>
            <h1 style={styles.reportTitle}>Report of {customerName}</h1>
          </div>

          <div style={styles.controlsCard}>
            <div style={styles.controlsRow}>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={styles.dropdownSelect}>
                <option value="date-desc">Sort: Date (Newest)</option>
                <option value="date-asc">Sort: Date (Oldest)</option>
                <option value="amount-desc">Sort: Amount (High to Low)</option>
                <option value="amount-asc">Sort: Amount (Low to High)</option>
              </select>
              <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} style={styles.dropdownSelect}>
                <option value="all">Filter: All</option>
                <option value="gave">Filter: You Gave</option>
                <option value="received">Filter: You Received</option>
              </select>
            </div>

            <div style={styles.dateControls}>
              <div style={styles.dateInput}>
                <label style={styles.dateLabel}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.dateSelect}
                />
              </div>
              <div style={styles.dateInput}>
                <label style={styles.dateLabel}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.dateSelect}
                />
              </div>
            </div>
          </div>

          <div style={styles.totalBalance}>
            Total Net Balance: Rs {netBalance.toLocaleString()}
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.customerTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Total Bill Count: {customers.length}</th>
                  <th style={styles.tableHeader}>You Gave Rs {totalGave.toLocaleString()}</th>
                  <th style={styles.tableHeader}>You Received Rs {totalReceived.toLocaleString()}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={styles.tableCell}>
                      <div style={{ marginBottom: '0.5rem' }}><strong>{customer.name}</strong></div>
                      <div style={{ marginBottom: '0.5rem' }}>{customer.collectionDate}</div>
                      <div style={{ marginBottom: '0.5rem' }}>Balance: Rs {(customer.youReceived - customer.youGave).toLocaleString()}</div>
                      <div>{customer.dateId ? `ID: ${customer.dateId}` : 'No remarks'}</div>
                    </td>
                    <td style={styles.tableCell}>{customer.youGave > 0 ? `Rs ${customer.youGave.toLocaleString()}` : ""}</td>
                    <td style={styles.tableCell}>{customer.youReceived > 0 ? `Rs ${customer.youReceived.toLocaleString()}` : ""}</td>
                  </tr>
                ))}
            
              </tbody>
            </table>
          </div>

          <div style={styles.actionButtons}>
            <button 
              style={{ ...styles.actionButton, ...styles.downloadButton }}
              onClick={handleGeneratePdf}
            >
              <span>📄</span> Download PDF
            </button>
            <button 
              style={{ ...styles.actionButton, ...styles.shareButton }}
              onClick={() => console.log('Share functionality to be implemented')}
            >
              <span>📤</span> Share
            </button>
          </div>

          <div style={styles.reportFooter}>
            Company Details and Helpline Number
          </div>
        </div>
      </main>
    </div>
  );
};

