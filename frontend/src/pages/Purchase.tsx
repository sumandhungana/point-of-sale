import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchPurchases } from '../services/purchaseListService';

interface Purchase {
  id: number;
  purchaseNo: string;
  date: string;
  amount: number;
  paymentMode: string;
  remarks: string | null;
  photoPath: string | null;
  category: {
    name: string;
  };
  item: {
    name: string;
    imageUrl: string | null;
  };
}

export const Purchase = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('');

  useEffect(() => {
    fetchPurchasesList();
  }, []);

  const fetchPurchasesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPurchases();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.purchaseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.paymentMode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    if (dateSort === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (dateSort === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleDateSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateSort(e.target.value);
  };

  const handlePurchaseClick = (purchase: Purchase) => {
    navigate('/bills/purchase/add', { state: { purchase } });
  };

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
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
    },
    searchContainer: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem',
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap' as const,
    },
    searchInput: {
      flex: 2,
      padding: '0.75rem 1rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      minWidth: '200px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:focus': {
        outline: 'none',
        borderColor: '#dc4c39',
        boxShadow: '0 0 0 2px rgba(220, 76, 57, 0.1)',
      },
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1,
      minWidth: '200px',
    },
    select: {
      padding: '0.75rem 1rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '0.875rem',
      flex: 1,
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:focus': {
        outline: 'none',
        borderColor: '#dc4c39',
        boxShadow: '0 0 0 2px rgba(220, 76, 57, 0.1)',
      },
    },
    label: {
      fontSize: '0.875rem',
      color: '#6c757d',
      whiteSpace: 'nowrap',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      marginLeft: 'auto',
    },
    button: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    primaryButton: {
      background: '#dc4c39',
      color: 'white',
    },
    secondaryButton: {
      background: '#f8f9fa',
      color: '#212529',
      border: '1px solid #dee2e6',
    },
    infoCard: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
    },
    infoSection: {
      flex: 1,
      padding: '1rem',
      background: '#f8f9fa',
      borderRadius: '4px',
      textAlign: 'center' as const,
    },
    infoTitle: {
      fontSize: '0.875rem',
      color: '#6c757d',
      marginBottom: '0.5rem',
    },
    infoValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    viewReportButton: {
      width: '100%',
      padding: '0.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
    detailCard: {
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginTop: '1rem',
    },
    imageSection: {
      flex: '0 0 100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      borderRadius: '4px',
    },
    placeholderImage: {
      width: '80px',
      height: '80px',
      background: '#e9ecef',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
      fontSize: '0.875rem',
    },
    infoRow: {
      display: 'flex',
      gap: '0.5rem',
    },
    infoLabel: {
      color: '#6c757d',
      minWidth: '80px',
    },
    infoText: {
      color: '#212529',
    },
    amountSection: {
      flex: '0 0 120px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    amountValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#28a745',
    },
    returnButton: {
      padding: '0.75rem 1.5rem',
      background: '#dc4c39',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
    addBillButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
    purchaseList: {
      marginTop: '2rem',
    },
    purchaseCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
      },
    },
    imageContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '8px',
      overflow: 'hidden',
      flexShrink: 0,
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    purchaseInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
    },
    purchaseHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    purchaseNo: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    purchaseDate: {
      fontSize: '0.9rem',
      color: '#6c757d',
      padding: '0.25rem 0.5rem',
      background: '#f8f9fa',
      borderRadius: '4px',
    },
    purchaseDetails: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      fontSize: '0.9rem',
      color: '#495057',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.75rem',
      background: '#f8f9fa',
      borderRadius: '4px',
    },
    detailLabel: {
      color: '#6c757d',
      fontWeight: '500',
    },
    purchaseAmount: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#28a745',
      padding: '0.5rem 1rem',
      background: '#e8f5e9',
      borderRadius: '6px',
    },
    loadingMessage: {
      textAlign: 'center' as const,
      color: '#495057',
      marginTop: '2rem',
    },
    errorMessage: {
      color: 'red',
      textAlign: 'center' as const,
      marginTop: '2rem',
    },
  };

  const handleAddBill = () => {
    navigate('/bills/purchase/add');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '40px', 
        
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.searchContainer}>
              <div style={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search purchases..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Filter:</label>
                  <select 
                    style={styles.select}
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Sort:</label>
                  <select 
                    style={styles.select}
                    value={dateSort}
                    onChange={handleDateSortChange}
                  >
                    <option value="">Date Added</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                <div style={styles.actionButtons}>
                  <button 
                    style={{ ...styles.button, ...styles.primaryButton }}
                  >
                    <span>📝</span> Bulk Reminder
                  </button>
                  <button 
                    style={{ ...styles.button, ...styles.secondaryButton }}
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Total Purchases</div>
                <div style={styles.infoValue}>रु1,23,456</div>
                <button style={styles.viewReportButton}>View Report</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Pending Amount</div>
                <div style={styles.infoValue}>रु45,678</div>
                <button style={styles.viewReportButton}>View Details</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Total Bills</div>
                <div style={styles.infoValue}>234</div>
                <button style={styles.viewReportButton}>View All</button>
              </div>
            </div>
          
          </div>

          <div style={styles.purchaseList}>
            {loading ? (
              <div style={styles.loadingMessage}>Loading purchases...</div>
            ) : error ? (
              <div style={styles.errorMessage}>{error}</div>
            ) : (
              filteredPurchases.map((purchase) => (
                <div 
                  key={purchase.id} 
                  style={styles.purchaseCard}
                  onClick={() => handlePurchaseClick(purchase)}
                >
                  <div style={styles.imageContainer}>
                    {purchase.photoPath ? (
                      <img 
                        src={purchase.photoPath} 
                        alt={purchase.item.name}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.placeholderImage}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={styles.purchaseInfo}>
                    <div style={styles.purchaseHeader}>
                      <span style={styles.purchaseNo}>{purchase.purchaseNo}</span>
                      <span style={styles.purchaseDate}>
                        {new Date(purchase.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={styles.purchaseDetails}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Category:</span>
                        {purchase.category.name}
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Item:</span>
                        {purchase.item.name}
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Payment:</span>
                        {purchase.paymentMode}
                      </div>
                      {purchase.remarks && (
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Remarks:</span>
                          {purchase.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={styles.purchaseAmount}>
                    ${purchase.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
              <div style={styles.actionButtons}>
                <button style={styles.returnButton}>Return Item</button>
                <button style={styles.addBillButton} onClick={handleAddBill}>
                  Add New Purchase
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 