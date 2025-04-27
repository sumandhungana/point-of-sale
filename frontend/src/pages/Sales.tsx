import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface SalesBill {
  id: number;
  billNumber: string;
  billDate: string;
  amount: number;
  paymentMode: string;
  remarks: string | null;
  photoPath: string | null;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export const Sales = () => {
  const navigate = useNavigate();
  const [salesBills, setSalesBills] = useState<SalesBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('');

  useEffect(() => {
    fetchSalesBills();
  }, []);

  const fetchSalesBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/SalesBill');
      if (!response.ok) {
        throw new Error('Failed to fetch sales bills');
      }
      const data = await response.json();
      setSalesBills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredSalesBills = salesBills.filter(bill => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.paymentMode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    if (dateSort === 'newest') {
      return new Date(b.billDate).getTime() - new Date(a.billDate).getTime();
    } else if (dateSort === 'oldest') {
      return new Date(a.billDate).getTime() - new Date(b.billDate).getTime();
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

  const handleAddBill = () => {
    navigate('/bills/sales/add');
  };

  const handleBillClick = (bill: SalesBill) => {
    navigate('/bills/sales/add', { state: { bill } });
  };

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
    },
    searchContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    searchInput: {
      flex: 1,
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '1rem',
    },
    reminderButton: {
      padding: '0.5rem 1rem',
      background: '#dc4c39',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    filterContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    dropdown: {
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      background: 'white',
      fontSize: '1rem',
      minWidth: '200px',
    },
    border: {
      border: '1px solid #dee2e6',
      marginTop: '1rem',
      marginBottom: '1rem',
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
    salesList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginTop: '1rem',
    },
    salesCard: {
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      },
    },
    imageContainer: {
      flex: '0 0 100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
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
    detailsContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    billNumber: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    detailsRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
    },
    detailPill: {
      padding: '0.25rem 0.75rem',
      background: '#f8f9fa',
      borderRadius: '20px',
      fontSize: '0.875rem',
      color: '#495057',
    },
    amountContainer: {
      flex: '0 0 120px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    amount: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#28a745',
      background: '#f0fff0',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
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
    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '2rem',
    },
    addButton: {
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search sales bills..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button style={styles.reminderButton}>
                <span>📝</span> Bulk Reminder
              </button>
            </div>
            <div style={styles.filterContainer}>
              <select 
                style={styles.dropdown}
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">Filter by Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
              <select 
                style={styles.dropdown}
                value={dateSort}
                onChange={handleDateSortChange}
              >
                <option value="">Sort by Date</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Total Sales</div>
                <div style={styles.infoValue}>
                  ₹{salesBills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}
                </div>
                <button style={styles.viewReportButton}>View Report</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Pending Amount</div>
                <div style={styles.infoValue}>₹0</div>
                <button style={styles.viewReportButton}>View Details</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Total Bills</div>
                <div style={styles.infoValue}>{salesBills.length}</div>
                <button style={styles.viewReportButton}>View All</button>
              </div>
            </div>
            <div style={styles.actionButtons}>
              <button style={styles.addButton} onClick={handleAddBill}>
                Add New Bill
              </button>
            </div>
          </div>
            <div style={styles.salesList}>
              {loading ? (
                <div style={styles.loadingMessage}>Loading sales bills...</div>
              ) : error ? (
                <div style={styles.errorMessage}>{error}</div>
              ) : (
                filteredSalesBills.map((bill) => (
                  <div 
                    key={bill.id} 
                    style={styles.salesCard}
                    onClick={() => handleBillClick(bill)}
                  >
                    <div style={styles.imageContainer}>
                      {bill.photoPath ? (
                        <img 
                          src={bill.photoPath} 
                          alt={bill.billNumber}
                          style={styles.image}
                        />
                      ) : (
                        <div style={styles.placeholderImage}>
                          No Photo
                        </div>
                      )}
                    </div>
                    <div style={styles.detailsContainer}>
                      <div style={styles.billNumber}>{bill.billNumber}</div>
                      <div style={styles.detailsRow}>
                        <span style={styles.detailPill}>
                          Customer: {bill.customer.name}
                        </span>
                        <span style={styles.detailPill}>
                          Payment: {bill.paymentMode}
                        </span>
                        <span style={styles.detailPill}>
                          Date: {new Date(bill.billDate).toLocaleDateString()}
                        </span>
                      </div>
                      {bill.remarks && (
                        <div style={styles.detailPill}>
                          Remarks: {bill.remarks}
                        </div>
                      )}
                    </div>
                    <div style={styles.amountContainer}>
                      <div style={styles.amount}>
                        ₹{bill.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}; 
