import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchRentalItems } from '../services/rentalItemService';

interface RentalItem {
  id: number;
  rentalItemName: string;
  phoneNumber: string;
  address: string;
  rentalAmount: number;
  rentalPeriod: string;
  startDate: string;
  endDate: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface RentalResponse {
  rentalItem: RentalItem[];
  youGive: number;
  advanceAmount: number;
}

export const RentalItem = () => {
  const navigate = useNavigate();
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  const [youGive, setYouGive] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    const fetchRentalItemsList = async () => {
      try {
        const data = await fetchRentalItems();
        setRentalItems(data.rentalItem);
        setYouGive(data.youGive);
        setAdvanceAmount(data.advanceAmount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchRentalItemsList();
  }, []);

  const filteredItems = rentalItems.filter(item => 
    item.rentalItemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sort) {
      case 'name_asc':
        return a.rentalItemName.localeCompare(b.rentalItemName);
      case 'name_desc':
        return b.rentalItemName.localeCompare(a.rentalItemName);
      case 'date_asc':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'date_desc':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      default:
        return 0;
    }
  });

  const calculateRentalAmount = (item: RentalItem) => {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    const currentDate = new Date();
    
    // If current date is before start date, return 0
    if (currentDate < startDate) {
      return 0;
    }
    
    // If current date is after end date, return total amount
    if (currentDate > endDate) {
      return item.rentalAmount;
    }
    
    // Calculate total days in rental period
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate days passed
    const daysPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate amount based on days passed
    const dailyRate = item.rentalAmount / totalDays;
    return Math.round(dailyRate * daysPassed);
  };

  const getRentalStatus = (item: RentalItem) => {
    const currentDate = new Date();
    const endDate = new Date(item.endDate);
    
    if (currentDate > endDate) {
      return 'Completed';
    }
    
    const startDate = new Date(item.startDate);
    if (currentDate < startDate) {
      return 'Not Started';
    }
    
    return 'In Progress';
  };

  const styles = {
    container: {
      display: 'flex',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    main: {
      marginLeft: '280px',
      flex: 1,
      padding: '2rem',
      paddingTop: '80px',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
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

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.loadingMessage}>Loading rental items...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={styles.dropdown}
            >
              <option value="">Filter By</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="date">Date</option>
            </select>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              style={styles.dropdown}
            >
              <option value="">Sort By</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="date_desc">Date (Newest)</option>
            </select>
            <button style={styles.reminderButton}>
              ⏰ Reminder
            </button>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>You Give</span>
                <span style={styles.summaryAmount}>रु{youGive.toFixed(2)}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Advance Amount</span>
                <span style={styles.summaryAmount}>रु{advanceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {sortedItems.map(item => {
            const calculatedAmount = calculateRentalAmount(item);
            const status = getRentalStatus(item);
            const statusColor = status === 'Completed' ? '#28a745' : 
                              status === 'Not Started' ? '#6c757d' : '#ffc107';

            return (
              <div key={item.id} style={styles.rentalCard}>
                <div style={styles.rentalInfo}>
                  <div style={styles.imagePlaceholder}>📷</div>
                  <div style={styles.rentalDetails}>
                    <div style={styles.rentalName}>{item.rentalItemName}</div>
                    <div style={styles.rentalTime}>
                      Period: {item.rentalPeriod} | 
                      Start: {new Date(item.startDate).toLocaleDateString()} | 
                      End: {new Date(item.endDate).toLocaleDateString()}
                    </div>
                    <div style={styles.rentalTime}>
                      Phone: {item.phoneNumber} | Address: {item.address}
                    </div>
                    {item.remarks && (
                      <div style={styles.rentalTime}>Remarks: {item.remarks}</div>
                    )}
                    <div style={{ 
                      ...styles.rentalTime, 
                      color: statusColor,
                      fontWeight: 'bold',
                      marginTop: '0.5rem'
                    }}>
                      Status: {status}
                    </div>
                  </div>
                </div>
                <div style={styles.rentalAmount}>
                  <div>रु{calculatedAmount.toFixed(2)}</div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6c757d',
                    textAlign: 'right'
                  }}>
                    of रु{item.rentalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}

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