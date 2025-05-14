import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchPaymentGateways } from '../services/paymentGatewayService';

interface PaymentGateway {
  id: number;
  name: string;
  paymentMode: string;
  description: string;
  isActive: boolean;
  imagePath: string | null;
  verificationUrl: string;
  publicKey: string;
  secretKey: string;
  createdAt: string;
  updatedAt: string;
}

export const PaymentGateway = () => {
  const navigate = useNavigate();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGatewaysList = async () => {
      try {
        const data = await fetchPaymentGateways();
        setGateways(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchGatewaysList();
  }, []);

  const filteredGateways = gateways.filter(gateway =>
    gateway.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gateway.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
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
      marginTop: '1rem',
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
    loadingMessage: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: '#6c757d',
    },
    errorMessage: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: '#dc3545',
    },
    statusBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    activeBadge: {
      background: '#d4edda',
      color: '#155724',
    },
    inactiveBadge: {
      background: '#f8d7da',
      color: '#721c24',
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ 
          flex: 1, 
          marginLeft: '50px',
          
          minHeight: '100vh',
          background: '#f8f9fa',
        }}>
          <Navbar />
          <div style={styles.loadingMessage}>Loading payment gateways...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ 
          flex: 1, 
          marginLeft: '50px',
          
          minHeight: '100vh',
          background: '#f8f9fa',
        }}>
          <Navbar />
          <div style={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '40px', 
        marginLeft: '50px',
        
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.header}>
              <input
                type="text"
                placeholder="Search by name or payment mode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchBar}
              />
            </div>

            <h2 style={styles.sectionHeader}>Payment Gateway List</h2>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Payment Mode</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredGateways.map((gateway) => (
                  <tr key={gateway.id}>
                    <td style={styles.td}>{gateway.id}</td>
                    <td style={styles.td}>{gateway.name}</td>
                    <td style={styles.td}>{gateway.paymentMode}</td>
                    <td style={styles.td}>{gateway.description}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(gateway.isActive ? styles.activeBadge : styles.inactiveBadge)
                      }}>
                        {gateway.isActive ? 'Active' : 'Inactive'}
                      </span>
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