import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import {fetchPurchases, GetAllPurchaseBillResponse} from '../../services/purchaseBillService'
import '../../../styles/Purchase.css';


export const Purchase = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<GetAllPurchaseBillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
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

  const filteredPurchases = purchases
      .filter((purchase) => {
        const matchesSearch =
            (purchase.purchaseNo ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (purchase.category?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (purchase.item?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (purchase.paymentMode ?? '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPayment = paymentFilter
            ? (purchase.paymentMode ?? '').toLowerCase() === paymentFilter.toLowerCase()
            : true;

        return matchesSearch && matchesPayment;
      })
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;

        if (dateSort === 'newest') {
          return dateB - dateA;
        } else if (dateSort === 'oldest') {
          return dateA - dateB;
        }
        return 0;
      });

  const handlePurchaseClick = (purchase: GetAllPurchaseBillResponse) => {
    navigate('/bills/purchase/add', { state: { purchase } });
  };

  const handleAddBill = () => {
    navigate('/bills/purchase/add');
  };

  const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.amount ?? 0), 0);
  return (
      <div className="sales-layout-root">
        <Sidebar />
        <div className="sales-page-wrapper">
          <div className="purchase-navbar-spacer">
            <Navbar />
          </div>

          <div className="sales-container">
            {/* Top Header & Stats Overview */}
            <div className="sales-header-card">
              <div className="sales-header-title-row">
                <div>
                  <h2 className="sales-page-title">Purchase Bills</h2>
                  <p className="sales-page-subtitle">Manage and track all your vendor purchases and invoices</p>
                </div>
                <button className="btn-primary" onClick={handleAddBill}>
                  <i className="bi bi-plus-lg me-1"></i> Add Purchase Bill
                </button>
              </div>

              <div className="sales-stats-grid">
                <div className="sales-stat-box">
                  <div className="stat-icon bg-blue">
                    <i className="bi bi-wallet2"></i>
                  </div>
                  <div>
                    <div className="stat-label">Total Spend</div>
                    <div className="stat-value">Rs. {totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="sales-stat-box">
                  <div className="stat-icon bg-green">
                    <i className="bi bi-receipt"></i>
                  </div>
                  <div>
                    <div className="stat-label">Total Bills</div>
                    <div className="stat-value">{purchases.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters Toolbar */}
            <div className="sales-filter-card">
              <div className="sales-filter-row">
                <div className="search-input-wrapper flex-grow-1">
                  <i className="bi bi-search"></i>
                  <input
                      type="text"
                      placeholder="Search by purchase no, item, category, or payment mode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="sales-search-input"
                  />
                </div>

                <div className="sales-filter-controls-group">
                  <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="sales-select"
                  >
                    <option value="">All Payment Modes</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI / Wallet</option>
                    <option value="credit">Credit</option>
                  </select>

                  <select
                      value={dateSort}
                      onChange={(e) => setDateSort(e.target.value)}
                      className="sales-select"
                  >
                    <option value="">Sort By Date</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Purchases Table */}
            <div className="sales-table-card">
              {loading ? (
                  <div className="sales-state-message">
                    <i className="bi bi-arrow-clockwise fa-spin me-2"></i> Loading purchase bills...
                  </div>
              ) : error ? (
                  <div className="sales-state-message text-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                  </div>
              ) : filteredPurchases.length === 0 ? (
                  <div className="sales-state-message">
                    <i className="bi bi-inbox me-2"></i> No purchase bills found.
                  </div>
              ) : (
                  <div className="table-responsive">
                    <table className="sales-table">
                      <thead>
                      <tr>
                        <th>Purchase No.</th>
                        <th>Date</th>
                        <th>Item / Category</th>
                        <th>Payment Mode</th>
                        <th>Remarks</th>
                        <th className="text-end">Amount</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredPurchases.map((purchase) => (
                          <tr
                              key={purchase?.id ?? Math.random()}
                              onClick={() => handlePurchaseClick(purchase)}
                              style={{ cursor: 'pointer' }}
                          >
                            <td className="fw-bold text-primary">{purchase?.purchaseNo ?? 'N/A'}</td>
                            <td>
                              {purchase?.date
                                  ? new Date(purchase.date).toLocaleDateString()
                                  : 'N/A'}
                            </td>
                            <td>
                              <div className="fw-semibold">{purchase?.item?.name ?? 'N/A'}</div>
                              <span className="badge-category">{purchase?.category?.name ?? 'General'}</span>
                            </td>
                            <td>
                              <span className="badge-payment-mode">{purchase?.paymentMode ?? 'N/A'}</span>
                            </td>
                            <td className="text-muted text-truncate" style={{ maxWidth: '180px' }}>
                              {purchase?.remarks || '-'}
                            </td>
                            <td className="text-end fw-bold">
                              Rs. {(purchase?.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};