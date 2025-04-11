import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const Role = () => {
  const navigate = useNavigate();
  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
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
  };

  // Dummy data for roles
  const roles = [
    {
      id: 1,
      name: 'Administrator',
      status: 'active',
      description: 'Full access to all system features and settings',
    },
    {
      id: 2,
      name: 'Manager',
      status: 'active',
      description: 'Can manage staff and view reports',
    },
    {
      id: 3,
      name: 'Staff',
      status: 'inactive',
      description: 'Basic access to perform daily tasks',
    },
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
          <div style={styles.header}>
            <input
              type="text"
              placeholder="Search role..."
              style={styles.searchBar}
            />
          </div>

          <div style={styles.divider} />

          <h2 style={styles.sectionHeader}>Role List</h2>

          {roles.map((role) => (
            <div key={role.id} style={styles.card}>
              <div style={styles.roleName}>{role.name}</div>
              <div style={{
                ...styles.status,
                ...(role.status === 'active' ? styles.activeStatus : styles.inactiveStatus),
              }}>
                {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
              </div>
              <div style={styles.description}>{role.description}</div>
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