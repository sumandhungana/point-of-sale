import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const User = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [reseller, setReseller] = useState('');
  const [branch, setBranch] = useState('');
  const navigate = useNavigate();

  // Dummy data for the table
  const users = [
    { id: 1, companyName: 'ABC Corp', ownerName: 'John Doe', phoneNumber: '+1 234 567 8900', status: 'Active' },
    { id: 2, companyName: 'XYZ Ltd', ownerName: 'Jane Smith', phoneNumber: '+1 234 567 8901', status: 'Inactive' },
    { id: 3, companyName: '123 Industries', ownerName: 'Bob Johnson', phoneNumber: '+1 234 567 8902', status: 'Active' },
    { id: 4, companyName: 'Tech Solutions', ownerName: 'Alice Brown', phoneNumber: '+1 234 567 8903', status: 'Pending' },
  ];

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    searchContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '2rem',
    },
    leftSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      flex: 1,
    },
    rightSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      alignItems: 'flex-end',
    },
    searchField: {
      padding: '0.75rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      width: '100%',
      fontSize: '1rem',
    },
    dropdownRow: {
      display: 'flex',
      gap: '1rem',
    },
    dropdown: {
      padding: '0.75rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '1rem',
      minWidth: '150px',
    },
    reminderButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '2rem',
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      textAlign: 'left' as const,
      borderBottom: '2px solid #dee2e6',
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
    },
    statusCell: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
    },
    statusBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.875rem',
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      alignSelf: 'flex-end',
    },
    addButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1rem',
    },
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { ...styles.statusBadge, backgroundColor: '#d4edda', color: '#155724' };
      case 'inactive':
        return { ...styles.statusBadge, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'pending':
        return { ...styles.statusBadge, backgroundColor: '#fff3cd', color: '#856404' };
      default:
        return styles.statusBadge;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: '300px',
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.searchContainer}>
            <div style={styles.leftSection}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchField}
              />
              <div style={styles.dropdownRow}>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={styles.dropdown}
                >
                  <option value="">Filter</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={styles.dropdown}
                >
                  <option value="">Sort</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
            <div style={styles.rightSection}>
              <div style={styles.dropdownRow}>
                <select
                  value={reseller}
                  onChange={(e) => setReseller(e.target.value)}
                  style={styles.dropdown}
                >
                  <option value="">Reseller</option>
                  <option value="reseller1">Reseller 1</option>
                  <option value="reseller2">Reseller 2</option>
                </select>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={styles.dropdown}
                >
                  <option value="">Branch</option>
                  <option value="branch1">Branch 1</option>
                  <option value="branch2">Branch 2</option>
                </select>
              </div>
              <button style={styles.reminderButton}>Reminder</button>
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Company Name</th>
                <th style={styles.tableHeader}>Owner Name</th>
                <th style={styles.tableHeader}>Phone Number</th>
                <th style={styles.tableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={styles.tableCell}>{user.companyName}</td>
                  <td style={styles.tableCell}>{user.ownerName}</td>
                  <td style={styles.tableCell}>{user.phoneNumber}</td>
                  <td style={styles.statusCell}>
                    <span style={getStatusStyle(user.status)}>{user.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.addButtonContainer}>
            <button 
              style={styles.addButton}
              onClick={() => navigate('/add-user')}
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 