import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  branch: string;
  permission: string;
  enable: boolean;
  parent: string;
  address: string;
  pan: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export const User = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [reseller, setReseller] = useState('');
  const [branch, setBranch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/User');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
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

  const getStatusStyle = (enabled: boolean) => {
    return enabled 
      ? { ...styles.statusBadge, backgroundColor: '#d4edda', color: '#155724' }
      : { ...styles.statusBadge, backgroundColor: '#f8d7da', color: '#721c24' };
  };

  const handleUserClick = (user: User) => {
    navigate('/add-user', { 
      state: { 
        isEdit: true,
        initialValues: {
          id: user.id,
          username: user.username,
          name: user.name,
          company: user.company,
          email: user.email,
          phone: user.phone,
          branch: user.branch,
          permission: user.permission,
          enable: user.enable,
          parent: user.parent,
          address: user.address,
          pan: user.pan,
          remarks: user.remarks
        }
      }
    });
  };

  if (loading) {
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
          <div style={styles.loadingMessage}>Loading users...</div>
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
          marginLeft: '300px',
          paddingTop: '60px',
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
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={styles.dropdown}
                >
                  <option value="">Sort</option>
                  <option value="name">Name</option>
                  <option value="company">Company</option>
                  <option value="branch">Branch</option>
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
                  <option value="parent1">Parent 1</option>
                  <option value="parent2">Parent 2</option>
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
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Company</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Phone</th>
                <th style={styles.tableHeader}>Branch</th>
                <th style={styles.tableHeader}>Permission</th>
                <th style={styles.tableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={styles.tableCell}>{user.name}</td>
                  <td style={styles.tableCell}>{user.company}</td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>{user.phone}</td>
                  <td style={styles.tableCell}>{user.branch}</td>
                  <td style={styles.tableCell}>{user.permission}</td>
                  <td style={styles.statusCell}>
                    <span style={getStatusStyle(user.enable)}>
                      {user.enable ? 'Active' : 'Inactive'}
                    </span>
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