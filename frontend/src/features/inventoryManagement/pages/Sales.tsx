import '../../../styles/Sales.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { getAllSalesBill as fetchSalesBillsService, GetAllSalesBillResponse } from '../../services/salesBillService';

interface GroupedSalesBill {
  id: number;
  billNumber: string;
  billDate: string;
  customerName: string;
  paymentMode: string;
  remarks?: string;
  createdBy?: string;
  createdAt?: string;
  totalAmount: number;
  productNames: string[];
  items: GetAllSalesBillResponse[];
}

export const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [salesBills, setSalesBills] = useState<GetAllSalesBillResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('');
  const [dateSort, setDateSort] = useState<string>('newest');

  useEffect(() => {
    fetchSalesBills();
  }, []);

  const fetchSalesBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSalesBillsService();
      setSalesBills(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales bills');
    } finally {
      setLoading(false);
    }
  };

  // Group individual line item records by unique `billNumber`
  const groupedBills: GroupedSalesBill[] = useMemo(() => {
    const groups: { [billNumber: string]: GroupedSalesBill } = {};

    salesBills.forEach((item) => {
      const key = item.billNumber || `ID-${item.id}`;
      // Fallback to item.amount if item.billAmount is undefined
      const itemAmount = item.amount ?? item.amount ?? 0;

      if (!groups[key]) {
        groups[key] = {
          id: item.id ?? 0,
          billNumber: item.billNumber || 'BILL-N/A',
          billDate: item.billDate || '',
          customerName: item.customerName || 'Walk-in Customer',
          paymentMode: item.paymentMode || 'CASH',
          remarks: item.remarks,
          createdBy: item.createdBy || 'System',
          createdAt: item.createdAt,
          totalAmount: 0,
          productNames: [],
          items: [],
        };
      }

      groups[key].totalAmount += itemAmount;
      if (item.productName && !groups[key].productNames.includes(item.productName)) {
        groups[key].productNames.push(item.productName);
      }
      groups[key].items.push(item);
    });

    return Object.values(groups);
  }, [salesBills]);

  // Search and Filter Logic
  const filteredSalesBills = useMemo(() => {
    return groupedBills
        .filter((bill) => {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
              bill.billNumber.toLowerCase().includes(query) ||
              bill.customerName.toLowerCase().includes(query) ||
              bill.paymentMode.toLowerCase().includes(query) ||
              bill.productNames.some((p) => p.toLowerCase().includes(query));

          const matchesPaymentMode = paymentModeFilter
              ? bill.paymentMode.toLowerCase() === paymentModeFilter.toLowerCase()
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
  }, [groupedBills, searchQuery, paymentModeFilter, dateSort]);

  const handleBillClick = (groupedBill: GroupedSalesBill) => {
    const formattedBill = {
      id: groupedBill.id,
      billNumber: groupedBill.billNumber,
      billDate: groupedBill.billDate,
      amount: groupedBill.totalAmount,
      paymentMode: groupedBill.paymentMode,
      remarks: groupedBill.remarks || null,
      photoPath: null,
      customer: {
        customerId: groupedBill.items[0]?.customerId || 0,
        name: groupedBill.customerName,
      },
      items: groupedBill.items.map((i) => ({
        itemId: i.productId,
        name: i.productName,
        unit: 'pcs',
        availableStock: 0,
        quantity: i.quantity || 1,
        unitPrice: i.unitPrice || 0,
        taxPercentage: i.taxPercentage || 0,
        vatPercentage: i.vatPercentage || 0,
        taxAmount: i.taxAmount || 0,
        vatAmount: i.vatAmount || 0,
        totalPrice: i.amount ?? i.amount ?? 0,
      })),
    };

    navigate('/bills/sales/add', { state: { bill: formattedBill } });
  };

  const handleAddBill = () => {
    navigate('/bills/sales/add');
  };

  // Metric aggregates
  const totalRevenue = groupedBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalInvoices = groupedBills.length;
  const cashRevenue = groupedBills
      .filter((b) => b.paymentMode.toUpperCase() === 'CASH')
      .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
      <div className="user-management-page-wrapper">
        <Sidebar />
        <div className="user-management-container">
          <Navbar />

          <div className="user-management-content">
            {/* Header Card */}
            <div className="user-management-header">
              <div>
                <h2 className="text-navy fw-bold">Sales Management</h2>
                <p className="text-muted">Track sales bills, review total revenue, and issue customer invoices.</p>
              </div>
              <button className="btn-primary" onClick={handleAddBill}>
                <i className="bi bi-plus-lg me-1"></i> Create New Invoice
              </button>
            </div>

            {/* Stats Summary Cards */}
            <div className="role-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value" style={{ color: '#255DCE' }}>
                    Rs. {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box navy">
                  <i className="bi bi-receipt"></i>
                </div>
                <div>
                  <div className="stat-label">Total Invoices</div>
                  <div className="stat-value">{totalInvoices}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box blue">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div>
                  <div className="stat-label">Cash Revenue</div>
                  <div className="stat-value" style={{ color: '#255DCE' }}>
                    Rs. {cashRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls & Search Bar */}
            <div className="sales-filter-card">
              <div className="sales-search-input-wrapper">
                <i className="bi bi-search search-icon"></i>
                <input
                    type="text"
                    placeholder="Search by invoice #, customer name, product, or payment mode..."
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
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI / Digital</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div className="filter-select-group">
                  <label>Sort:</label>
                  <select
                      value={dateSort}
                      onChange={(e) => setDateSort(e.target.value)}
                      className="table-role-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sales Invoice List */}
            <div className="role-list-container">
              {loading ? (
                  <div className="loading-container p-4 text-center">
                    <i className="bi bi-arrow-repeat spin me-2"></i>Loading sales invoices...
                  </div>
              ) : error ? (
                  <div className="empty-container p-4 text-center text-danger">{error}</div>
              ) : filteredSalesBills.length === 0 ? (
                  <div className="empty-container p-4 text-center text-muted">No sales invoices found.</div>
              ) : (
                  filteredSalesBills.map((bill) => {
                    const initials = bill.customerName
                        ? bill.customerName
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'SB';

                    return (
                        <div
                            className="role-item-card clickable-card"
                            key={bill.billNumber}
                            onClick={() => handleBillClick(bill)}
                        >
                          {/* Avatar Badge */}
                          <div className="role-avatar">{initials}</div>

                          {/* Main Invoice Information */}
                          <div className="role-main-details">
                            <div className="role-title-row">
                              <span className="role-card-name">{bill.billNumber}</span>
                              <span className="badge-role">{bill.paymentMode.toUpperCase()}</span>
                            </div>

                            <div className="role-sub-text">
                              <span>Customer: <strong>{bill.customerName}</strong></span>
                              <span>•</span>
                              <span>Items: {bill.productNames.join(', ') || 'N/A'}</span>
                              {bill.remarks && (
                                  <>
                                    <span>•</span>
                                    <span>Notes: {bill.remarks}</span>
                                  </>
                              )}
                            </div>
                          </div>

                          {/* Right-aligned Section: User & Date before Amount */}
                          <div className="role-card-right d-flex align-items-center gap-3">
                            <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
                              <div>By: <strong>{bill.createdBy}</strong></div>
                              <div>
                                {bill.billDate ||
                                    (bill.createdAt
                                        ? new Date(bill.createdAt).toLocaleDateString()
                                        : 'N/A')}
                              </div>
                            </div>

                            <div className="vertical-divider"></div>

                            <div className="sales-amount-tag" style={{ color: '#255DCE', fontWeight: 'bold', fontSize: '16px' }}>
                              Rs. {bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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