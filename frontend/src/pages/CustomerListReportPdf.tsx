"use client"

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: number
  name: string
  dateId: string
  youGave: number
  youReceived: number
  collectionDate: string
}

export const CustomerListReportPdf = () => {
  const navigate = useNavigate();
  const [customers] = useState<Customer[]>([
    { id: 1, name: "Ram", dateId: "1234567", youGave: 5000, youReceived: 3000, collectionDate: "10/04/2023" },
    { id: 2, name: "Shyam", dateId: "1234569", youGave: 7000, youReceived: 4000, collectionDate: "15/04/2023" },
    { id: 3, name: "Hari", dateId: "", youGave: 3000, youReceived: 3000, collectionDate: "20/04/2023" },
    { id: 4, name: "Sita", dateId: "", youGave: 2000, youReceived: 1000, collectionDate: "25/04/2023" },
    { id: 5, name: "Gita", dateId: "", youGave: 4000, youReceived: 2000, collectionDate: "30/04/2023" },
  ]);
  const [printLogo, setPrintLogo] = useState(false);

  const handleBack = () => {
    navigate('/parties/customers');
  };

  const handleGeneratePdf = () => {
    // TODO: Implement PDF generation logic
    console.log('Generating PDF with logo:', printLogo);
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
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      '&:hover': {
        background: '#5a6268',
      },
    },
    generateButton: {
      padding: '0.75rem 1.5rem',
      background: '#dc4c39',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      '&:hover': {
        background: '#c82333',
      },
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
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
    reportTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#212529',
      textAlign: 'center' as const,
      marginBottom: '0.5rem',
      borderBottom: '2px solid #dc4c39',
      paddingBottom: '0.5rem',
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
      overflowX: 'auto' as const,
    },
    customerTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
    },
    tableHeader: {
      background: '#f8f9fa',
      padding: '0.75rem',
      textAlign: 'left' as const,
      borderBottom: '1px solid #dee2e6',
      color: '#212529',
      fontWeight: 'bold',
    },
    tableCell: {
      padding: '0.75rem',
      borderBottom: '1px solid #dee2e6',
    },
    gaveCell: {
      color: '#dc3545',
    },
    receivedCell: {
      color: '#28a745',
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
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={styles.logoSection}>
            <div style={styles.logoContainer}>
              <div style={styles.logoImage}>🏢</div>
              <div style={styles.companyName}>Company Name</div>
            </div>
            <div style={styles.printOption}>
              <input 
                type="checkbox" 
                id="printLogo" 
                checked={printLogo} 
                onChange={() => setPrintLogo(!printLogo)} 
              />
              <label htmlFor="printLogo">Print/book logo</label>
            </div>
          </div>

          <h1 style={styles.reportTitle}>Customer List Report</h1>
          <p style={styles.reportDate}>
            (generated: {new Date().toLocaleDateString()})
          </p>

          <div style={styles.summarySection}>
            <div style={styles.summaryItem}>
              <p style={styles.summaryItemTitle}>You Gave</p>
              <p style={{...styles.summaryItemValue, ...styles.gaveValue}}>रू {totalGave.toLocaleString()}</p>
            </div>
            <div style={styles.summaryDivider}></div>
            <div style={styles.summaryItem}>
              <p style={styles.summaryItemTitle}>You Received</p>
              <p style={{...styles.summaryItemValue, ...styles.receivedValue}}>रू {totalReceived.toLocaleString()}</p>
            </div>
            <div style={styles.summaryDivider}></div>
            <div style={styles.summaryItem}>
              <p style={styles.summaryItemTitle}>Net Balance</p>
              <p style={{...styles.summaryItemValue, ...styles.netValue}}>रू {netBalance.toLocaleString()}</p>
            </div>
          </div>

          <div style={styles.customerCount}>
            No of Customer: {customers.length} (All)
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.customerTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Date/ID</th>
                  <th style={styles.tableHeader}>You Gave</th>
                  <th style={styles.tableHeader}>You Received</th>
                  <th style={styles.tableHeader}>Collection Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={styles.tableCell}>{customer.name}</td>
                    <td style={styles.tableCell}>{customer.dateId}</td>
                    <td style={{...styles.tableCell, ...styles.gaveCell}}>
                      {customer.youGave > 0 ? `रू ${customer.youGave.toLocaleString()}` : ""}
                    </td>
                    <td style={{...styles.tableCell, ...styles.receivedCell}}>
                      {customer.youReceived > 0 ? `रू ${customer.youReceived.toLocaleString()}` : ""}
                    </td>
                    <td style={styles.tableCell}>{customer.collectionDate}</td>
                  </tr>
                ))}
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td style={styles.tableCell}></td>
                    <td style={styles.tableCell}></td>
                    <td style={styles.tableCell}></td>
                    <td style={styles.tableCell}></td>
                    <td style={styles.tableCell}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.reportFooter}>
            Company Details and Helpline Number
          </div>
        </div>
      </main>
    </div>
  );
};

