import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchCashbooks as fetchCashbooksApi } from '../services/cashbookService';
import '../styles/Cashbook.css';

interface Cashbook {
  id: number;
  cashbookNo: string;
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

export const Cashbook = () => {
  const navigate = useNavigate();
  const [cashbooks, setCashbooks] = useState<Cashbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('');

  useEffect(() => {
    fetchCashbooks();
  }, []);

  const fetchCashbooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCashbooksApi();
      setCashbooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredCashbooks = cashbooks.filter(cashbook => {
    const matchesSearch = 
      cashbook.cashbookNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashbook.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashbook.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashbook.paymentMode.toLowerCase().includes(searchQuery.toLowerCase());

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

  const handleCashbookClick = (cashbook: Cashbook) => {
    navigate('/bills/cashbook/add', { state: { cashbook } });
  };



  const totalCashbook = cashbooks.reduce((sum, cashbook) => sum + cashbook.amount, 0);
  const pendingAmount = 0; // This would be calculated based on business logic

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="cashbook-container">
        <Navbar />
        <div className="cashbook-card">
          <div className="cashbook-search-container">
            <div className="cashbook-search-bar">
              <div style={{ position: 'relative', flex: 2 }}>
                <i className="bi bi-search cashbook-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search cashbooks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="cashbook-search-input"
                />
              </div>
              <div className="cashbook-filter-group">
                <label className="cashbook-label">Filter:</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="cashbook-select"
                >
                  <option value="">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="cashbook-filter-group">
                <label className="cashbook-label">Sort:</label>
                <select
                  value={dateSort}
                  onChange={handleDateSortChange}
                  className="cashbook-select"
                >
                  <option value="">Date Added</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="cashbook-action-buttons">
                <button className="cashbook-button cashbook-primary-button">
                  <i className="bi bi-file-earmark-text"></i>
                  Bulk Reminder
                </button>
                <button className="cashbook-button cashbook-secondary-button">
                  <i className="bi bi-file-pdf"></i>
                  PDF
                </button>
              </div>
            </div>
            <div className="cashbook-info-card">
              <div className="cashbook-info-section">
                <div className="cashbook-info-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="cashbook-info-header">
                  <div className="cashbook-info-title">Total Cashbook</div>
                </div>
                <div className="cashbook-info-value">₹{totalCashbook.toLocaleString()}</div>
                <button className="cashbook-view-more-button">
                  <i className="bi bi-eye"></i>
                  View More
                </button>
              </div>
              <div className="cashbook-info-section">
                <div className="cashbook-info-icon">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="cashbook-info-header">
                  <div className="cashbook-info-title">Pending Amount</div>
                </div>
                <div className="cashbook-info-value">₹{pendingAmount.toLocaleString()}</div>
                <button className="cashbook-view-more-button">
                  <i className="bi bi-eye"></i>
                  View More
                </button>
              </div>
              <div className="cashbook-info-section">
                <div className="cashbook-info-icon">
                  <i className="bi bi-list-ul"></i>
                </div>
                <div className="cashbook-info-header">
                  <div className="cashbook-info-title">Total Bills</div>
                </div>
                <div className="cashbook-info-value">{cashbooks.length}</div>
                <button className="cashbook-view-more-button">
                  <i className="bi bi-eye"></i>
                  View More
                </button>
              </div>
            </div>
          </div>

          <div className="cashbook-list">
            {loading ? (
              <div className="cashbook-loading-message">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Loading cashbooks...
              </div>
            ) : error ? (
              <div className="cashbook-error-message">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : filteredCashbooks.length === 0 ? (
              <div className="cashbook-loading-message">
                <i className="bi bi-inbox me-2"></i>
                No cashbooks found
              </div>
            ) : (
              filteredCashbooks.map((cashbook) => (
                <div 
                  key={cashbook.id} 
                  className="cashbook-item"
                  onClick={() => handleCashbookClick(cashbook)}
                >
                  <div className="cashbook-image-container">
                    {cashbook.photoPath ? (
                      <img 
                        src={cashbook.photoPath} 
                        alt={cashbook.item.name}
                        className="cashbook-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const next = e.currentTarget.nextElementSibling as HTMLElement;
                          if (next) next.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="cashbook-placeholder-image">
                      <i className="bi bi-image"></i>
                    </div>
                  </div>
                  <div className="cashbook-details-container">
                    <div className="cashbook-number">{cashbook.cashbookNo}</div>
                    <div className="cashbook-details-row">
                      <span className="cashbook-detail-pill">
                        <i className="bi bi-tag me-1"></i>
                        {cashbook.category.name}
                      </span>
                      <span className="cashbook-detail-pill">
                        <i className="bi bi-box me-1"></i>
                        {cashbook.item.name}
                      </span>
                      <span className="cashbook-detail-pill">
                        <i className="bi bi-credit-card me-1"></i>
                        {cashbook.paymentMode}
                      </span>
                    </div>
                    <div className="cashbook-date">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(cashbook.date).toLocaleDateString()}
                    </div>
                    {cashbook.remarks && (
                      <div className="cashbook-remarks">
                        <i className="bi bi-chat-text me-1"></i>
                        {cashbook.remarks}
                      </div>
                    )}
                  </div>
                  <div className="cashbook-amount">
                    ₹{cashbook.amount.toLocaleString()}
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