import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CSSProperties } from 'react';

export const AddPayments: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'online'>('cash');

  const styles: Record<string, CSSProperties> = {
    container: {
      display: 'flex',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    main: {
      flex: 1,
      padding: '2rem',
    },
  
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      marginTop: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#495057',
      fontSize: '0.875rem',
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '0.875rem',
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '0.875rem',
      minHeight: '100px',
      resize: 'vertical' as const,
    },
    paymentModeContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    paymentModeButton: {
      flex: 1,
      padding: '0.5rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      background: 'white',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    activePaymentMode: {
      background: '#28a745',
      color: 'white',
      borderColor: '#28a745',
    },
    saveButton: {
      padding: '0.5rem 1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      marginLeft: 'auto',
      display: 'block',
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
       
        <div style={styles.card}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Enter Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              placeholder="Enter amount"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Add Any Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
              placeholder="Add any notes here..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.paymentModeContainer}>
            <button
              style={{
                ...styles.paymentModeButton,
                ...(paymentMode === 'cash' ? styles.activePaymentMode : {}),
              }}
              onClick={() => setPaymentMode('cash')}
            >
              Cash
            </button>
            <button
              style={{
                ...styles.paymentModeButton,
                ...(paymentMode === 'online' ? styles.activePaymentMode : {}),
              }}
              onClick={() => setPaymentMode('online')}
            >
              Online
            </button>
          </div>
          <button style={styles.saveButton}>Save Payment</button>
        </div>
      </div>
    </div>
  );
}; 