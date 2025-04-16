import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const Sales = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
    },
    searchContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    searchInput: {
      flex: 1,
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '1rem',
    },
    reminderButton: {
      padding: '0.5rem 1rem',
      background: '#dc4c39',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    filterContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    dropdown: {
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      background: 'white',
      fontSize: '1rem',
      minWidth: '200px',
    },
    border: {
      border: '1px solid #dee2e6',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    infoCard: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
    },
    infoSection: {
      flex: 1,
      padding: '1rem',
      background: '#f8f9fa',
      borderRadius: '4px',
      textAlign: 'center' as const,
    },
    infoTitle: {
      fontSize: '0.875rem',
      color: '#6c757d',
      marginBottom: '0.5rem',
    },
    infoValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    viewReportButton: {
      width: '100%',
      padding: '0.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
    detailCard: {
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginTop: '1rem',
    },
    imageSection: {
      flex: '0 0 100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      borderRadius: '4px',
    },
    placeholderImage: {
      width: '80px',
      height: '80px',
      background: '#e9ecef',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
      fontSize: '0.875rem',
    },
    infoRow: {
      display: 'flex',
      gap: '0.5rem',
    },
    infoLabel: {
      color: '#6c757d',
      minWidth: '80px',
    },
    infoText: {
      color: '#212529',
    },
    amountSection: {
      flex: '0 0 120px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    amountValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#28a745',
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '2rem',
    },
    returnButton: {
      padding: '0.75rem 1.5rem',
      background: '#dc4c39',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
    addBillButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
  };

  const handleAddBill = () => {
    navigate('/sales/add-bill');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search sales..."
                style={styles.searchInput}
              />
              <button style={styles.reminderButton}>
                <span>📝</span> Bulk Reminder
              </button>
            </div>
            <div style={styles.filterContainer}>
              <select style={styles.dropdown}>
                <option value="">Filter by Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select style={styles.dropdown}>
                <option value="">Sort by Date</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Total Sales</div>
                <div style={styles.infoValue}>₹1,23,456</div>
                <button style={styles.viewReportButton}>View Report</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Pending Amount</div>
                <div style={styles.infoValue}>₹45,678</div>
                <button style={styles.viewReportButton}>View Details</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Total Bills</div>
                <div style={styles.infoValue}>234</div>
                <button style={styles.viewReportButton}>View All</button>
              </div>
            </div>
            <div style={styles.actionButtons}>
              <button style={styles.returnButton}>Return Item</button>
              <button style={styles.addBillButton} onClick={handleAddBill}>
                Add New Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 