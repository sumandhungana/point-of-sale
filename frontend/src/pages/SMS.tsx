import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchSmsGateways } from '../services/smsService';

interface SmsGateway {
  id: number;
  partnerName: string;
  active: boolean;
  form: string;
  token: string;
  apiUrl: string;
  testSms: string | null;
  createdAt: string;
  updatedAt: string;
}

export const SMS = () => {
  const navigate = useNavigate();
  const [smsGateways, setSmsGateways] = useState<SmsGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSmsGatewaysList = async () => {
      try {
        const data = await fetchSmsGateways();
        setSmsGateways(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchSmsGatewaysList();
  }, []);

  const filteredGateways = smsGateways.filter(gateway =>
    gateway.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gateway.form.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div style={styles.loadingMessage}>Loading SMS gateways...</div>
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
                placeholder="Search by partner or form..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchBar}
              />
            </div>

            <h2 style={styles.sectionHeader}>SMS Gateway</h2>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Partner Name</th>
                  <th style={styles.th}>Form</th>
                  <th style={styles.th}>API URL</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Test SMS</th>
                </tr>
              </thead>
              <tbody>
                {filteredGateways.map((gateway) => (
                  <tr key={gateway.id}>
                    <td style={styles.td}>{gateway.id}</td>
                    <td style={styles.td}>{gateway.partnerName}</td>
                    <td style={styles.td}>{gateway.form}</td>
                    <td style={styles.td}>{gateway.apiUrl}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(gateway.active ? styles.activeBadge : styles.inactiveBadge)
                      }}>
                        {gateway.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>{gateway.testSms || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.buttonContainer}>
              <button 
                style={styles.addButton}
                onClick={() => navigate('/add-sms')}
              >
                Add SMS Gateway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 