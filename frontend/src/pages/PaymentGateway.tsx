import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const PaymentGateway = () => {
  const navigate = useNavigate();
  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '2rem',
    },
    searchBar: {
      padding: '0.5rem 1rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      width: '300px',
      fontSize: '1rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '2rem',
    },
    th: {
      textAlign: 'left' as const,
      padding: '1rem',
      borderBottom: '2px solid #dee2e6',
      color: '#495057',
      fontWeight: '600',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
      color: '#6c757d',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: '100%',
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
  };

  // Dummy data for the table
  const gateways = [
    { id: 1, name: 'Gateway 1', partner: 'Partner A', active: true },
    { id: 2, name: 'Gateway 2', partner: 'Partner B', active: false },
    { id: 3, name: 'Gateway 3', partner: 'Partner C', active: true },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: '50px',
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.header}>
              <input
                type="text"
                placeholder="Search..."
                style={styles.searchBar}
              />
            </div>

            <h2 style={styles.sectionHeader}>Payment Gateway List</h2>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>S.N</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Gateway Partner</th>
                  <th style={styles.th}>Active</th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((gateway) => (
                  <tr key={gateway.id}>
                    <td style={styles.td}>{gateway.id}</td>
                    <td style={styles.td}>{gateway.name}</td>
                    <td style={styles.td}>{gateway.partner}</td>
                    <td style={styles.td}>
                      {gateway.active ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.buttonContainer}>
              <button 
                style={styles.addButton}
                onClick={() => navigate('/add-payment-gateway')}
              >
                Add Gateway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 