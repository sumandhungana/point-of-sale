import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchPurchases } from '../services/purchaseListService';
import '../styles/Purchase.css';

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

  const handleAddBill = () => {
    navigate('/bills/purchase/add');
  };

  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const pendingAmount = purchases.reduce((sum, purchase) => {
    // Calculate pending amount based on payment mode (simplified logic)
    if (purchase.paymentMode === 'Pending' || purchase.paymentMode === 'Credit') {
      return sum + purchase.amount;
    }
    return sum;
  }, 0);

  return (
    <div className="purchase-page-wrapper">
      <Sidebar />
      <div className="purchase-container">
        <Navbar />
        <div className="purchase-card">
          <div className="purchase-search-container">
            <div className="purchase-search-bar">
              <div className="purchase-search-input-container">
                <i className="bi bi-search purchase-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search by purchase number, category, item, or payment mode..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="purchase-search-input"
                />
                {searchQuery && (
                  <button 
                    className="purchase-clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
              <div className="purchase-filter-group">
                <label className="purchase-label">Filter:</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="purchase-select"
                >
                  <option value="">All Payment Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div className="purchase-filter-group">
                <label className="purchase-label">Sort:</label>
                <select
                  value={dateSort}
                  onChange={handleDateSortChange}
                  className="purchase-select"
                >
                  <option value="">Default</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="purchase-action-buttons">
                <button
                  className="purchase-button purchase-primary-button"
                  onClick={handleAddBill}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Purchase
                </button>
                <button className="purchase-button purchase-secondary-button">
                  <i className="bi bi-download"></i>
                  Export
                </button>
              </div>
            </div>
            <div className="purchase-info-card">
              <div className="purchase-info-section">
                <div className="purchase-info-title">Total Purchases</div>
                <div className="purchase-info-value">₹{totalPurchases.toLocaleString()}</div>
                <button className="purchase-view-report-button">
                  <i className="bi bi-graph-up me-1"></i>
                  View Report
                </button>
              </div>
              <div className="purchase-info-section">
                <div className="purchase-info-title">Pending Amount</div>
                <div className="purchase-info-value">₹{pendingAmount.toLocaleString()}</div>
                <button className="purchase-view-report-button">
                  <i className="bi bi-clock me-1"></i>
                  View Details
                </button>
              </div>
              <div className="purchase-info-section">
                <div className="purchase-info-title">Total Bills</div>
                <div className="purchase-info-value">{purchases.length}</div>
                <button className="purchase-view-report-button">
                  <i className="bi bi-list-ul me-1"></i>
                  View All
                </button>
              </div>
            </div>
          </div>

          <div className="purchase-list">
            {loading ? (
              <div className="purchase-loading-message">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Loading purchases...
              </div>
            ) : error ? (
              <div className="purchase-error-message">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="purchase-loading-message">
                <i className="bi bi-inbox me-2"></i>
                No purchases found
              </div>
            ) : (
              filteredPurchases.map((purchase) => (
                <div 
                  key={purchase.id} 
                  className="purchase-item"
                  onClick={() => handlePurchaseClick(purchase)}
                >
                  <div className="purchase-image-container">
                    {purchase.photoPath ? (
                      <img 
                        src={purchase.photoPath} 
                        alt={purchase.item.name}
                        className="purchase-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="purchase-placeholder-image">
                      <i className="bi bi-image"></i>
                    </div>
                  </div>
                  <div className="purchase-details-container">
                    <div className="purchase-number">{purchase.purchaseNo}</div>
                    <div className="purchase-details-row">
                      <span className="purchase-detail-pill">
                        <i className="bi bi-tag me-1"></i>
                        {purchase.category.name}
                      </span>
                      <span className="purchase-detail-pill">
                        <i className="bi bi-box me-1"></i>
                        {purchase.item.name}
                      </span>
                      <span className="purchase-detail-pill">
                        <i className="bi bi-credit-card me-1"></i>
                        {purchase.paymentMode}
                      </span>
                    </div>
                    <div className="purchase-date">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(purchase.date).toLocaleDateString()}
                    </div>
                    {purchase.remarks && (
                      <div className="purchase-remarks">
                        <i className="bi bi-chat-text me-1"></i>
                        {purchase.remarks}
                      </div>
                    )}
                  </div>
                  <div className="purchase-amount">
                    ₹{purchase.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
            <div className="purchase-bottom-actions">
              <button className="purchase-return-button">
                <i className="bi bi-arrow-return-left me-1"></i>
                Return Item
              </button>
              <button className="purchase-add-button" onClick={handleAddBill}>
                <i className="bi bi-plus-circle me-1"></i>
                Add New Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 