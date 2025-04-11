import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export const RentalItem = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
    },
    main: {
      marginLeft: '280px',
      flex: 1,
      padding: '2rem',
      paddingTop: '80px',
    },
    searchContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      padding: '0.5rem',
      background: 'white',
      width: '100%',
      maxWidth: '300px',
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      flex: 1,
      padding: '0.25rem',
    },
    searchIcon: {
      color: '#6c757d',
      marginRight: '0.5rem',
    },
    reminderButton: {
      padding: '0.5rem 1rem',
      background: '#ffc107',
      color: '#212529',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    filterContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    dropdown: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      minWidth: '150px',
    },
    summaryCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    summaryItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    summaryLabel: {
      fontSize: '0.875rem',
      color: '#6c757d',
    },
    summaryAmount: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#28a745',
    },
    rentalCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rentalInfo: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    imagePlaceholder: {
      width: '60px',
      height: '60px',
      background: '#e9ecef',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
    },
    rentalDetails: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    rentalName: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    rentalTime: {
      fontSize: '0.875rem',
      color: '#6c757d',
    },
    rentalAmount: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#28a745',
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
    addButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
    },
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.searchContainer}>
            <div style={styles.searchBar}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search..."
                style={styles.searchInput}
              />
            </div>
            <button style={styles.reminderButton}>
              ⏰ Reminder
            </button>
          </div>

          <div style={styles.filterContainer}>
            <select style={styles.dropdown}>
              <option value="">Filter By</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="date">Date</option>
            </select>
            <select style={styles.dropdown}>
              <option value="">Sort By</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="date_desc">Date (Newest)</option>
            </select>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>You Give</span>
                <span style={styles.summaryAmount}>₹15,000</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Advance Amount</span>
                <span style={styles.summaryAmount}>₹5,000</span>
              </div>
            </div>
          </div>

          <div style={styles.rentalCard}>
            <div style={styles.rentalInfo}>
              <div style={styles.imagePlaceholder}>📷</div>
              <div style={styles.rentalDetails}>
                <div style={styles.rentalName}>Camera DSLR</div>
                <div style={styles.rentalTime}>Time: 2 hours</div>
              </div>
            </div>
            <div style={styles.rentalAmount}>₹2,500</div>
          </div>

          <div style={styles.rentalCard}>
            <div style={styles.rentalInfo}>
              <div style={styles.imagePlaceholder}>🎥</div>
              <div style={styles.rentalDetails}>
                <div style={styles.rentalName}>Video Camera</div>
                <div style={styles.rentalTime}>Day: 1</div>
              </div>
            </div>
            <div style={styles.rentalAmount}>₹3,500</div>
          </div>

          <div style={styles.rentalCard}>
            <div style={styles.rentalInfo}>
              <div style={styles.imagePlaceholder}>🎤</div>
              <div style={styles.rentalDetails}>
                <div style={styles.rentalName}>Microphone Set</div>
                <div style={styles.rentalTime}>Hour: 4</div>
              </div>
            </div>
            <div style={styles.rentalAmount}>₹1,500</div>
          </div>

          <div style={styles.addButtonContainer}>
            <button 
              style={styles.addButton}
              onClick={() => navigate('/rental/add')}
            >
              ➕ Add Rental Items
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 