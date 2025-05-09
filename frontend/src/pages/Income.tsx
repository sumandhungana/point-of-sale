import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface Income {
  id: number;
  incomeNo: string;
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

export const Income = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('');

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/Income');
      if (!response.ok) {
        throw new Error('Failed to fetch incomes');
      }
      const data = await response.json();
      setIncomes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleDateSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateSort(e.target.value);
  };

  const handleIncomeClick = (income: Income) => {
    navigate('/bills/income/add', { state: { income } });
  };

  const filteredIncomes = incomes
    .filter(income => {
      const matchesSearch = 
        income.incomeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || income.paymentMode === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (dateSort === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (dateSort === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

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
    incomeList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginTop: '1.5rem',
    },
    incomeCard: {
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      '&:hover': {
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
    incomeNo: {
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
      borderRadius: '9999px',
      fontSize: '0.875rem',
      color: '#495057',
    },
    amountContainer: {
      flex: '0 0 120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    amount: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#28a745',
      background: '#e8f5e9',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
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
                  placeholder="Search incomes..."
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
                <div style={styles.infoTitle}>Total Income</div>
                <div style={styles.infoValue}>
                  रु{incomes.reduce((sum, income) => sum + income.amount, 0).toLocaleString()}
                </div>
                <button style={styles.viewReportButton}>View Report</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Pending Amount</div>
                <div style={styles.infoValue}>रु0</div>
                <button style={styles.viewReportButton}>View Details</button>
              </div>
              <div style={styles.infoSection}>
                <div style={styles.infoTitle}>Total Entries</div>
                <div style={styles.infoValue}>{incomes.length}</div>
                <button style={styles.viewReportButton}>View All</button>
              </div>
            </div>
            
            <div style={styles.incomeList}>
              {loading ? (
                <div style={styles.loadingMessage}>Loading incomes...</div>
              ) : error ? (
                <div style={styles.errorMessage}>{error}</div>
              ) : (
                filteredIncomes.map((income) => (
                  <div 
                    key={income.id} 
                    style={styles.incomeCard}
                    onClick={() => handleIncomeClick(income)}
                  >
                    <div style={styles.imageContainer}>
                      {income.photoPath ? (
                        <img 
                          src={income.photoPath} 
                          alt={income.incomeNo}
                          style={styles.image}
                        />
                      ) : (
                        <div style={styles.placeholderImage}>
                          No Photo
                        </div>
                      )}
                    </div>
                    <div style={styles.detailsContainer}>
                      <div style={styles.incomeNo}>{income.incomeNo}</div>
                      <div style={styles.detailsRow}>
                        <span style={styles.detailPill}>
                          Category: {income.category.name}
                        </span>
                        <span style={styles.detailPill}>
                          Item: {income.item.name}
                        </span>
                        <span style={styles.detailPill}>
                          Payment: {income.paymentMode}
                        </span>
                        <span style={styles.detailPill}>
                          Date: {new Date(income.date).toLocaleDateString()}
                        </span>
                      </div>
                      {income.remarks && (
                        <div style={styles.detailPill}>
                          Remarks: {income.remarks}
                        </div>
                      )}
                    </div>
                    <div style={styles.amountContainer}>
                      <div style={styles.amount}>
                        रु{income.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div style={styles.actionButtons}>
              <button style={styles.addButton} onClick={() => navigate('/bills/income/add')}>
                Add New Income
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 