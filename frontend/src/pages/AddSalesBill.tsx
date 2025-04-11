import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const AddSalesBill = () => {
  const navigate = useNavigate();
  const [showPartySearch, setShowPartySearch] = useState(false);
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [partySearch, setPartySearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  // Dummy data for parties and items
  const parties = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Robert Johnson' },
  ];

  const items = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 200 },
    { id: 3, name: 'Product C', price: 300 },
  ];

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
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
    },
    formGroup: {
      marginBottom: '1rem',
    },
    formRow: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    formColumn: {
      flex: 1,
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#212529',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '1rem',
    },
    searchContainer: {
      position: 'relative' as const,
    },
    searchResults: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      maxHeight: '200px',
      overflowY: 'auto' as const,
      zIndex: 100,
    },
    searchItem: {
      padding: '0.5rem',
      cursor: 'pointer',
      '&:hover': {
        background: '#f8f9fa',
      },
    },
    addButton: {
      position: 'absolute' as const,
      right: '0.5rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.25rem',
      color: '#28a745',
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '1rem',
      minHeight: '100px',
    },
    fileInput: {
      display: 'none',
    },
    fileLabel: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '1rem',
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '2rem',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
  };

  const handleCancel = () => {
    navigate('/sales');
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
       
        <div style={styles.card}>
          <div style={styles.formRow}>
            <div style={styles.formColumn}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sales Bill Number</label>
                <input type="text" style={styles.input} />
              </div>
            </div>
            <div style={styles.formColumn}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input type="date" style={styles.input} />
              </div>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Bill To</label>
            <div style={styles.searchContainer}>
              <input
                type="text"
                style={styles.input}
                value={partySearch}
                onChange={(e) => setPartySearch(e.target.value)}
                onFocus={() => setShowPartySearch(true)}
                onBlur={() => setTimeout(() => setShowPartySearch(false), 200)}
              />
              <button style={styles.addButton}>+</button>
              {showPartySearch && partySearch && (
                <div style={styles.searchResults}>
                  {filteredParties.map(party => (
                    <div
                      key={party.id}
                      style={styles.searchItem}
                      onClick={() => {
                        setPartySearch(party.name);
                        setShowPartySearch(false);
                      }}
                    >
                      {party.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Items</label>
            <div style={styles.searchContainer}>
              <input
                type="text"
                style={styles.input}
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                onFocus={() => setShowItemSearch(true)}
                onBlur={() => setTimeout(() => setShowItemSearch(false), 200)}
              />
              <button style={styles.addButton}>+</button>
              {showItemSearch && itemSearch && (
                <div style={styles.searchResults}>
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      style={styles.searchItem}
                      onClick={() => {
                        setItemSearch(item.name);
                        setShowItemSearch(false);
                      }}
                    >
                      {item.name} - ₹{item.price}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formColumn}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Mode</label>
                <select style={styles.input}>
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>
            <div style={styles.formColumn}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount</label>
                <input type="number" style={styles.input} />
              </div>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Remarks</label>
            <textarea style={styles.textarea} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Photo Upload</label>
            <label style={styles.fileLabel}>
              Choose File
              <input type="file" style={styles.fileInput} accept="image/*" />
            </label>
          </div>

          <div style={styles.actionButtons}>
            <button style={styles.saveButton}>
              Save Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 