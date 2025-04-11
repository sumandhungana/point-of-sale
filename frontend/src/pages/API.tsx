import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const API = () => {
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
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1.5rem',
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
    },
    button: {
      flex: 1,
      padding: '1rem',
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: '#f8f9fa',
        borderColor: '#adb5bd',
      },
    },
    buttonIcon: {
      fontSize: '1.5rem',
    },
    buttonText: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#495057',
      margin: 0,
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
            <h1 style={styles.heading}>API</h1>
            <div style={styles.buttonContainer}>
              <button 
                style={styles.button}
                onClick={() => navigate('/sms')}
              >
                <span style={styles.buttonIcon}>📱</span>
                <span style={styles.buttonText}>SMS API</span>
              </button>
              <button style={styles.button}>
                <span style={styles.buttonIcon}>🌐</span>
                <span style={styles.buttonText}>Radius API</span>
              </button>
              <button 
                style={styles.button}
                onClick={() => navigate('/payment-gateway')}
              >
                <span style={styles.buttonIcon}>💳</span>
                <span style={styles.buttonText}>Payment Gateway</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 