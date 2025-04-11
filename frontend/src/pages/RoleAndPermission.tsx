import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const RoleAndPermission = () => {
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
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    button: {
      padding: '0.75rem 2rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      minWidth: '150px',
    },
  };

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
            <div style={styles.buttonContainer}>
              <button 
                style={styles.button}
                onClick={() => navigate('/role')}
              >
                Role
              </button>
              <button 
                style={styles.button}
                onClick={() => navigate('/permission')}
              >
                Permission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 