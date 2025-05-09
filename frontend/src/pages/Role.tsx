import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface Role {
  id: number;
  name: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions: any[];
}

export const Role = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/Role');
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const data = await response.json();
        setRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
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
    divider: {
      borderBottom: '1px solid #dee2e6',
      marginBottom: '2rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1.5rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem',
    },
    roleName: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '0.5rem',
    },
    status: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
    },
    activeStatus: {
      background: '#d4edda',
      color: '#155724',
    },
    inactiveStatus: {
      background: '#f8d7da',
      color: '#721c24',
    },
    manageStaffStatus: {
      background: '#cce5ff',
      color: '#004085',
    },
    description: {
      color: '#6c757d',
      fontSize: '0.9rem',
      marginBottom: '0.5rem',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
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
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return styles.activeStatus;
      case 'manage_staff':
        return styles.manageStaffStatus;
      default:
        return styles.inactiveStatus;
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Inactive';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
          <div style={styles.loadingMessage}>Loading roles...</div>
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
          <div style={styles.header}>
            <input
              type="text"
              placeholder="Search role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchBar}
            />
          </div>

          <div style={styles.divider} />

          <h2 style={styles.sectionHeader}>Role List</h2>

          {filteredRoles.map((role) => (
            <div key={role.id} style={styles.card}>
              <div style={styles.roleName}>{role.name}</div>
              <div style={{
                ...styles.status,
                ...getStatusStyle(role.status),
              }}>
                {formatStatus(role.status)}
              </div>
              <div style={styles.description}>
                {role.description || 'No description available'}
              </div>
            </div>
          ))}

          <div style={styles.buttonContainer}>
            <button 
              style={styles.addButton}
              onClick={() => navigate('/add-role')}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 