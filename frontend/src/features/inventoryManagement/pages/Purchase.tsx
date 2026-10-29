import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { fetchPurchases, GetAllPurchaseBillResponse } from '../../services/purchaseBillService';
import { InvoiceModal, InvoiceModalData } from '../components/InvoiceModal';
import { ReportPdfModal, ReportModalData } from '../components/ReportPdfModal';
import { printInvoiceDirectly } from '../utils/printInvoice';
import { useAppSettings } from '@/context/AppSettingsContext';
import '../../../styles/Sales.css';
import '../../../styles/Purchase.css';


export const Purchase = () => {
  const navigate = useNavigate();
  const { formatNumber } = useAppSettings();
  const [purchases, setPurchases] = useState<GetAllPurchaseBillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateSort, setDateSort] = useState('');

  // PDF Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceModalData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [autoDownloadInvoice, setAutoDownloadInvoice] = useState(false);

  const [reportData, setReportData] = useState<ReportModalData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  const formatPurchaseForInvoice = (purchase: GetAllPurchaseBillResponse): InvoiceModalData => {
    const amount = purchase.amount ?? 0;
    return {
      type: 'PURCHASE',
      invoiceNumber: purchase.purchaseNo || 'PUR-N/A',
      date: purchase.date || purchase.createdAt || new Date().toISOString(),
      partyName: purchase.category?.name ? `${purchase.category.name} Vendor` : 'Supplier / Vendor',
      partyType: 'Registered Supplier',
      paymentMode: purchase.paymentMode || 'CASH',
      remarks: purchase.remarks,
      items: [
        {
          name: purchase.item?.name || 'Inventory Product',
          category: purchase.category?.name || 'General',
          quantity: 1,
          unitPrice: amount,
          totalAmount: amount,
        },
      ],
      subtotal: amount,
      grandTotal: amount,
    };
  };

  const handleDownloadPurchasePdf = (purchase: GetAllPurchaseBillResponse) => {
    const invData = formatPurchaseForInvoice(purchase);
    setSelectedInvoice(invData);
    setAutoDownloadInvoice(true);
    setIsInvoiceModalOpen(true);
  };


  const handlePrintPurchaseDirectly = (purchase: GetAllPurchaseBillResponse) => {
    const invData = formatPurchaseForInvoice(purchase);
    printInvoiceDirectly(invData);
  };

  const handleExportReportPDF = () => {
    const rows = filteredPurchases.map((p) => ({
      id: p.id ?? Math.random(),
      number: p.purchaseNo ?? 'N/A',
      date: p.date ?? '',
      party: p.category?.name ? `${p.category.name} Vendor` : 'Supplier',
      itemsSummary: `${p.item?.name ?? 'Item'} (${p.category?.name ?? 'General'})`,
      paymentMode: p.paymentMode ?? 'CASH',
      amount: p.amount ?? 0,
    }));

    setReportData({
      reportType: 'PURCHASE',
      title: 'Vendor Purchases Summary Report',
      subtitle: 'Comprehensive record of all inventory purchases and vendor invoices',
      totalAmount: filteredPurchases.reduce((sum, p) => sum + (p.amount ?? 0), 0),
      totalCount: filteredPurchases.length,
      rows,
    });
    setIsReportModalOpen(true);
  };

  const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.amount ?? 0), 0);
  const cashPurchases = purchases
      .filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CASH')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const onlinePurchases = purchases
      .filter((p) => {
        const mode = (p.paymentMode || '').trim().toUpperCase();
        return ['CARD', 'UPI', 'BANK', 'BANK_TRANSFER', 'ONLINE', 'DIGITAL', 'QR', 'WALLET'].includes(mode) || (mode !== 'CASH' && mode !== 'CREDIT' && mode !== 'DUE' && mode !== '');
      })
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
      <div className="user-management-page-wrapper">
        <Sidebar />
        <div className="user-management-container">
          <Navbar />

          <div className="user-management-content">
            {/* Top Page Header - Clean Add Purchase Bill Style */}
            <div className="purchase-bill-page-header">
              <div className="purchase-bill-header-info">
                <div className="purchase-bill-header-icon">
                  <i className="bi bi-cart-check-fill" />
                </div>
                <div>
                  <h1 className="purchase-bill-header-title">Purchase Bills</h1>
                </div>
              </div>

              {/*<div className="purchase-bill-header-actions">*/}
              {/*  <button*/}
              {/*    type="button"*/}
              {/*    className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"*/}
              {/*    onClick={() => navigate('/bills/purchase/add')}*/}
              {/*  >*/}
              {/*    <i className="bi bi-plus-lg" />*/}
              {/*    <span>Add Purchase Bill</span>*/}
              {/*  </button>*/}
              {/*</div>*/}
            </div>

            {/* Stats Summary Cards */}
            <div className="role-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box red">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <div className="stat-label">Total Spend</div>
                  <div className="stat-value" style={{ color: '#dc2626' }}>
                    Rs. {formatNumber(totalPurchases)}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box purple">
                  <i className="bi bi-globe2"></i>
                </div>
                <div>
                  <div className="stat-label">Online Purchases</div>
                  <div className="stat-value" style={{ color: '#7c3aed' }}>
                    Rs. {formatNumber(onlinePurchases)}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box red">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div>
                  <div className="stat-label">Cash Purchases</div>
                  <div className="stat-value" style={{ color: '#dc2626' }}>
                    Rs. {formatNumber(cashPurchases)}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls & Search Bar */}
            <div className="sales-filter-card">
              <div className="sales-search-section">
                <div className="sales-search-input-wrapper">
                  <i className="bi bi-search search-icon"></i>
                  <input
                      type="text"
                      placeholder="Search by purchase no, item, category, or payment mode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-control"
                  />
                </div>

                <div className="sales-total-invoices-badge" title="Total Bills Count">
                  <span className="invoices-badge-label">Total Bills</span>
                  <span className="invoices-badge-count">{purchases.length}</span>
                </div>
              </div>

              <div className="sales-filter-actions">
                <div className="filter-select-group">
                  <label>Payment:</label>
                  <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="table-role-select"
                  >
                    <option value="">All Payment Modes</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI / Wallet</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div className="filter-select-group">
                  <label>Sort:</label>
                  <select
                      value={dateSort}
                      onChange={(e) => setDateSort(e.target.value)}
                      className="table-role-select"
                  >
                    <option value="">Sort By Date</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn-export-pdf"
                  onClick={handleExportReportPDF}
                  title="Export PDF Report"
                >
                  <i className="bi bi-file-earmark-arrow-down me-1"></i>
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Purchase Bills List */}
            <div className="role-list-container">
              {loading ? (
                  <div className="loading-container p-4 text-center">
                    <i className="bi bi-arrow-repeat spin me-2"></i>Loading purchase bills...
                  </div>
              ) : error ? (
                  <div className="empty-container p-4 text-center text-danger">{error}</div>
              ) : filteredPurchases.length === 0 ? (
                  <div className="empty-container p-4 text-center text-muted">No purchase bills found.</div>
              ) : (
                  filteredPurchases.map((purchase) => {
                    const categoryName = purchase.category?.name || 'General';
                    const itemName = purchase.item?.name || 'Item';
                    const initials = categoryName
                        ? categoryName
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'PB';

                    return (
                        <div
                            className="role-item-card clickable-card"
                            key={purchase?.id ?? Math.random()}
                            onClick={() => handlePurchaseClick(purchase)}
                        >
                          {/* Avatar Badge */}
                          <div className="role-avatar">{initials}</div>

                          {/* Main Purchase Information */}
                          <div className="role-main-details">
                            <div className="role-title-row">
                              <span className="role-card-name">{purchase.purchaseNo || 'PUR-N/A'}</span>
                              <span className="badge-role">{(purchase.paymentMode || 'CASH').toUpperCase()}</span>
                            </div>

                            <div className="role-sub-text">
                              <span>Item: <strong>{itemName}</strong></span>
                              <span>•</span>
                              <span>Category: {categoryName}</span>
                              {purchase.remarks && (
                                  <>
                                    <span>•</span>
                                    <span>Remarks: {purchase.remarks}</span>
                                  </>
                              )}
                            </div>
                          </div>

                          {/* Right-aligned Section: Actions before User & Date before Amount */}
                          <div className="role-card-right d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                  type="button"
                                  className="btn-row-action pdf"
                                  title="Download Purchase Invoice PDF"
                                  onClick={() => handleDownloadPurchasePdf(purchase)}
                              >
                                <i className="bi bi-file-earmark-pdf"></i> PDF
                              </button>
                              <button
                                  type="button"
                                  className="btn-row-action"
                                  title="Print Invoice"
                                  onClick={() => handlePrintPurchaseDirectly(purchase)}
                              >
                                <i className="bi bi-printer"></i>
                              </button>
                            </div>

                            <div className="vertical-divider"></div>

                            <div className="sales-amount-tag" style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '16px' }}>
                              Rs. {formatNumber(purchase.amount ?? 0)}
                            </div>
                          </div>
                        </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom-Right + New Purchase Button */}
        <button
            type="button"
            className="sales-add-sticky-button"
            onClick={handleAddBill}
            title="New Purchase Bill"
        >
            <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
            <span>New Purchase</span>
        </button>

        {/* Invoice PDF & Print Modal */}
        <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            data={selectedInvoice}
            autoDownload={autoDownloadInvoice}
        />

        {/* Purchase List Summary Report PDF Modal */}
        <ReportPdfModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            data={reportData}
        />
      </div>
  );
};
