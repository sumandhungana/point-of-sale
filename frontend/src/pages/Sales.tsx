import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchSalesBills as fetchSalesBillsService } from '../services/salesBillService';
import '../styles/Sales.css';

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
      const data = await fetchSalesBillsService();
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

  const totalSales = salesBills.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = 0; // This would be calculated based on business logic

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="sales-container">
        <Navbar />
        <div className="sales-card">
          <div className="sales-search-container">
            <div className="sales-search-bar">
              <div style={{ position: 'relative', flex: 2 }}>
                <i className="bi bi-search sales-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search by bill number, customer name, or payment mode..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="sales-search-input"
                />
              </div>
              <div className="sales-filter-group">
                <label className="sales-label">Filter:</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="sales-select"
                >
                  <option value="">All Payment Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div className="sales-filter-group">
                <label className="sales-label">Sort:</label>
                <select
                  value={dateSort}
                  onChange={handleDateSortChange}
                  className="sales-select"
                >
                  <option value="">Default</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="sales-action-buttons">
                <button 
                  className="sales-button sales-primary-button"
                  onClick={handleAddBill}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Sales Bill
                </button>
                <button className="sales-button sales-secondary-button">
                  <i className="bi bi-download"></i>
                  Export
                </button>
              </div>
            </div>
            <div className="sales-info-card">
              <div className="sales-info-section">
                <div className="sales-info-title">Total Sales</div>
                <div className="sales-info-value">₹{totalSales.toLocaleString()}</div>
                <button className="sales-view-report-button">
                  <i className="bi bi-graph-up me-1"></i>
                  View Report
                </button>
              </div>
              <div className="sales-info-section">
                <div className="sales-info-title">Pending Amount</div>
                <div className="sales-info-value">₹{pendingAmount.toLocaleString()}</div>
                <button className="sales-view-report-button">
                  <i className="bi bi-clock me-1"></i>
                  View Details
                </button>
              </div>
              <div className="sales-info-section">
                <div className="sales-info-title">Total Bills</div>
                <div className="sales-info-value">{salesBills.length}</div>
                <button className="sales-view-report-button">
                  <i className="bi bi-list-ul me-1"></i>
                  View All
                </button>
              </div>
            </div>
          </div>
          
          <div className="sales-list">
            {loading ? (
              <div className="sales-loading-message">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Loading sales bills...
              </div>
            ) : error ? (
              <div className="sales-error-message">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : filteredSalesBills.length === 0 ? (
              <div className="sales-loading-message">
                <i className="bi bi-inbox me-2"></i>
                No sales bills found
              </div>
            ) : (
              filteredSalesBills.map(bill => (
                <div
                  key={bill.id}
                  className="sales-item"
                  onClick={() => handleBillClick(bill)}
                >
                  <div className="sales-image-container">
                    {bill.photoPath ? (
                      <img
                        src={bill.photoPath}
                        alt={bill.customer.name}
                        className="sales-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="sales-placeholder-image">
                      <i className="bi bi-image"></i>
                    </div>
                  </div>
                  <div className="sales-details-container">
                    <div className="sales-number">{bill.billNumber}</div>
                    <div className="sales-details-row">
                      <span className="sales-detail-pill">
                        <i className="bi bi-person me-1"></i>
                        {bill.customer.name}
                      </span>
                      <span className="sales-detail-pill">
                        <i className="bi bi-credit-card me-1"></i>
                        {bill.paymentMode}
                      </span>
                      {bill.customer.phone && (
                        <span className="sales-detail-pill">
                          <i className="bi bi-telephone me-1"></i>
                          {bill.customer.phone}
                        </span>
                      )}
                    </div>
                    <div className="sales-date">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(bill.billDate).toLocaleDateString()}
                    </div>
                    {bill.remarks && (
                      <div className="sales-remarks">
                        <i className="bi bi-chat-text me-1"></i>
                        {bill.remarks}
                      </div>
                    )}
                  </div>
                  <div className="sales-amount">
                    ₹{bill.amount.toLocaleString()}
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
