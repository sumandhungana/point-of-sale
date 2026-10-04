import '../../../styles/Sales.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { getAllSalesBill as fetchSalesBillsService, GetAllSalesBillResponse } from '../../services/salesBillService';


export const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [salesBills, setSalesBills] = useState<GetAllSalesBillResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('');
  const [dateSort, setDateSort] = useState<string>('');

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
      setError(err instanceof Error ? err.message : 'Failed to fetch sales bills');
    } finally {
      setLoading(false);
    }
  };

  const filteredSalesBills = salesBills
      .filter((bill) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (bill.billNumber && bill.billNumber.toLowerCase().includes(query)) ||
            (bill.customerName && bill.customerName.toLowerCase().includes(query)) ||
            (bill.paymentMode && bill.paymentMode.toLowerCase().includes(query));

        const matchesPaymentMode = paymentModeFilter
            ? bill.paymentMode?.toLowerCase() === paymentModeFilter.toLowerCase()
            : true;

        return matchesSearch && matchesPaymentMode;
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        if (dateSort === 'newest') return dateB - dateA;
        if (dateSort === 'oldest') return dateA - dateB;
        return 0;
      });

  const handleBillClick = (bill: GetAllSalesBillResponse) => {
    navigate('/bills/sales/add', { state: { bill } });
  };

  const handleAddBill = () => {
    navigate('/bills/sales/add');
  };

  // Summary Metrics
  const totalSales = salesBills.reduce((sum, bill) => sum + (bill.billAmount || 0), 0);
  const totalBills = salesBills.length;
  const cashSales = salesBills
      .filter((b) => b.paymentMode?.toUpperCase() === 'CASH')
      .reduce((sum, b) => sum + (b.billAmount || 0), 0);

  return (
      <div className="user-management-page-wrapper">
        <Sidebar />
        <div className="user-management-container">
          <Navbar />

          <div className="user-management-content">
            {/* Header Card */}
            <div className="user-management-header">
              <div>
                <h2>Sales Management</h2>
                <p>Track sales bills, review total revenue, and issue new customer invoices.</p>
              </div>
              <button className="btn-add-user" onClick={handleAddBill}>
                + Create New Invoice
              </button>
            </div>

            {/* Stats Cards */}
            <div className="role-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue-bg">💰</div>
                <div className="stat-info">
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value blue-text">Rs. {totalSales.toLocaleString()}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box green-bg">📄</div>
                <div className="stat-info">
                  <span className="stat-label">Total Bills</span>
                  <span className="stat-value green-text">{totalBills}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box purple-bg">💵</div>
                <div className="stat-info">
                  <span className="stat-label">Cash Revenue</span>
                  <span className="stat-value purple-text">Rs. {cashSales.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Search, Filter & Controls Bar */}
            <div className="sales-filter-card">
              <div className="sales-search-input-wrapper">
                <i className="bi bi-search search-icon"></i>
                <input
                    type="text"
                    placeholder="Search by bill number, customer, or payment mode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control"
                />
              </div>

              <div className="sales-filter-actions">
                <div className="filter-select-group">
                  <label>Payment:</label>
                  <select
                      value={paymentModeFilter}
                      onChange={(e) => setPaymentModeFilter(e.target.value)}
                      className="table-role-select"
                  >
                    <option value="">All Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>

                <div className="filter-select-group">
                  <label>Sort:</label>
                  <select
                      value={dateSort}
                      onChange={(e) => setDateSort(e.target.value)}
                      className="table-role-select"
                  >
                    <option value="">Date Added</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sales Card Item List */}
            <div className="role-list-container">
              {loading ? (
                  <div className="loading-container">Loading sales bills...</div>
              ) : error ? (
                  <div className="empty-container" style={{ color: '#e03131' }}>
                    {error}
                  </div>
              ) : filteredSalesBills.length === 0 ? (
                  <div className="empty-container">No sales bills found.</div>
              ) : (
                  filteredSalesBills.map((bill) => {
                    const initials = bill.customerName
                        ? bill.customerName
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'SB';

                    return (
                        <div
                            className="role-item-card clickable-card"
                            key={bill.id || bill.billNumber}
                            onClick={() => handleBillClick(bill)}
                        >
                          {/* Avatar / Initials */}
                          <div className="role-avatar">{initials}</div>

                          {/* Main Bill Details */}
                          <div className="role-main-details">
                            <div className="role-title-row">
                              <span className="role-card-name">{bill.billNumber || 'BILL-N/A'}</span>
                              <span className="role-id-badge">#{bill.id ?? 'N/A'}</span>
                            </div>

                            <div className="role-sub-text">
                              <span>Customer: <strong>{bill.customerName || 'Walk-in Customer'}</strong></span>
                              <span>•</span>
                              <span>Product: {bill.productName || 'N/A'}</span>
                              {bill.remarks && (
                                  <>
                                    <span>•</span>
                                    <span>Remarks: {bill.remarks}</span>
                                  </>
                              )}
                            </div>
                          </div>

                          {/* Right Side Info & Badges */}
                          <div className="role-card-right">
                            <div className="sales-amount-tag">
                              Rs. {(bill.billAmount || 0).toLocaleString()}
                            </div>

                            <span className="badge-role">
                        {bill.paymentMode || 'CASH'}
                      </span>

                            <div className="vertical-divider"></div>

                            <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
                              <div>By: <strong>{bill.createdBy || 'System'}</strong></div>
                              <div>
                                {bill.createdAt
                                    ? new Date(bill.createdAt).toLocaleDateString()
                                    : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
  );
};
