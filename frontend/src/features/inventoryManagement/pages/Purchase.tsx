import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import {
  fetchPurchases,
  GetAllPurchaseBillResponse,
  getSinglePurchaseBill,
  GetSinglePurchaseBillResponse
} from '../../services/purchaseBillService';
import { InvoiceModal, InvoiceModalData } from '../components/InvoiceModal';
import { ReportPdfModal, ReportModalData } from '../components/ReportPdfModal';
import { ViewPurchaseBillModal } from '../components/ViewPurchaseBillModal';
import { printInvoiceDirectly } from '../utils/printInvoice';
import { useAppSettings } from '@/context/AppSettingsContext';
import { usePermission } from '@/core/rbac/usePermission';
import '../../../styles/Sales.css';
import '../../../styles/Purchase.css';


export const Purchase = () => {
  const navigate = useNavigate();
  const { formatNumber } = useAppSettings();
  const { hasPermission, isSuperAdmin } = usePermission();

  // RBAC permissions
  const canViewAll = isSuperAdmin || hasPermission('purchaseBill:all');
  const canViewSingle = isSuperAdmin || hasPermission('purchaseBill:single') || hasPermission('purchaseBill:all');
  const canAdd = isSuperAdmin || hasPermission('purchaseBill:add');
  const canEdit = isSuperAdmin || hasPermission('purchaseBill:update');
  const hasEditAccess = canEdit || canAdd;

  const [purchases, setPurchases] = useState<GetAllPurchaseBillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Single Purchase View Modal State
  const [viewingPurchase, setViewingPurchase] = useState<GetSinglePurchaseBillResponse | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSingleLoading, setIsSingleLoading] = useState(false);

  // PDF Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceModalData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [autoDownloadInvoice, setAutoDownloadInvoice] = useState(false);

  const [reportData, setReportData] = useState<ReportModalData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (canViewAll) {
      fetchPurchasesList();
    } else {
      setLoading(false);
    }
  }, [canViewAll]);

  const fetchPurchasesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPurchases();
      setPurchases(data || []);
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

        const matchesPayment = filterBy
            ? (purchase.paymentMode ?? '').toLowerCase() === filterBy.toLowerCase()
            : true;

        return matchesSearch && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        }
        if (sortBy === 'amount_desc') {
          return (b.amount ?? 0) - (a.amount ?? 0);
        }
        if (sortBy === 'amount_asc') {
          return (a.amount ?? 0) - (b.amount ?? 0);
        }
        if (sortBy === 'name_asc') {
          const nameA = a.item?.name || a.category?.name || '';
          const nameB = b.item?.name || b.category?.name || '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'name_desc') {
          const nameA = a.item?.name || a.category?.name || '';
          const nameB = b.item?.name || b.category?.name || '';
          return nameB.localeCompare(nameA);
        }
        // Default: newest first
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

  const handleEditPurchase = (purchase: GetAllPurchaseBillResponse | GetSinglePurchaseBillResponse) => {
    if (!hasEditAccess) return;
    setIsViewModalOpen(false);
    navigate('/bills/purchase/add', { state: { purchase } });
  };

  const handleViewPurchase = async (purchase: GetAllPurchaseBillResponse) => {
    if (!canViewSingle) return;

    // Fast preview while single API loads
    const initialViewData: GetSinglePurchaseBillResponse = {
      id: purchase.id,
      purchaseNo: purchase.purchaseNo,
      date: purchase.date,
      amount: purchase.amount,
      paymentMode: purchase.paymentMode,
      paymentStatus: purchase.paymentStatus,
      remarks: purchase.remarks,
      photoPath: purchase.photoPath,
      item: purchase.item,
      category: purchase.category,
    };

    setViewingPurchase(initialViewData);
    setIsViewModalOpen(true);

    if (purchase.id && purchase.id > 0) {
      setIsSingleLoading(true);
      try {
        const fullData = await getSinglePurchaseBill(purchase.id);
        if (fullData) {
          setViewingPurchase(fullData);
        }
      } catch (err) {
        console.warn('Could not fetch single purchase bill from API, using cached data:', err);
      } finally {
        setIsSingleLoading(false);
      }
    }
  };

  const handlePurchaseClick = (purchase: GetAllPurchaseBillResponse) => {
    if (canViewSingle) {
      handleViewPurchase(purchase);
    } else if (hasEditAccess) {
      handleEditPurchase(purchase);
    }
  };

  const handleAddBill = () => {
    navigate('/bills/purchase/add');
  };

  const formatPurchaseForInvoice = (purchase: GetAllPurchaseBillResponse | GetSinglePurchaseBillResponse): InvoiceModalData => {
    const amount = purchase.amount ?? 0;
    return {
      type: 'PURCHASE',
      invoiceNumber: purchase.purchaseNo || 'PUR-N/A',
      date: purchase.date || (purchase as any).createdAt || new Date().toISOString(),
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

  const handlePrintFromModal = (p: GetSinglePurchaseBillResponse) => {
    const invData = formatPurchaseForInvoice(p);
    printInvoiceDirectly(invData);
  };

  const handleDownloadPdfFromModal = (p: GetSinglePurchaseBillResponse) => {
    const invData = formatPurchaseForInvoice(p);
    setSelectedInvoice(invData);
    setAutoDownloadInvoice(true);
    setIsInvoiceModalOpen(true);
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

  const cashCount = purchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CASH').length;
  const cardCount = purchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CARD').length;
  const upiCount = purchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'UPI').length;
  const bankCount = purchases.filter((p) => {
    const m = (p.paymentMode || '').trim().toUpperCase();
    return m === 'BANK' || m === 'BANK_TRANSFER';
  }).length;
  const creditCount = purchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CREDIT').length;

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
                <button
                  type="button"
                  className="toolbar-btn staff-btn"
                  onClick={() => {
                    setFilterBy('');
                    setSearchQuery('');
                    setSortBy('newest');
                  }}
                  title="Click to reset filters and view all purchase bills"
                >
                  <i className="bi bi-bag-check"></i>
                   Invoices ({purchases.length})
                </button>

                <div className="sales-search-input-wrapper">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search by purchase no, item, category, or mode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="sales-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                      title="Clear search"
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="sales-filter-actions">
                <div className="toolbar-select-wrap">
                  <i className="bi bi-sort-down"></i>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="toolbar-select"
                    title="Sort purchase bills"
                  >
                    <option value="newest">Sort (Newest)</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount_desc">Amount: High to Low</option>
                    <option value="amount_asc">Amount: Low to High</option>
                    <option value="name_asc">Item: A-Z</option>
                    <option value="name_desc">Item: Z-A</option>
                  </select>
                </div>

                <div className="toolbar-select-wrap">
                  <i className="bi bi-funnel"></i>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="toolbar-select"
                    title="Filter purchase bills"
                  >
                    <option value="">Filter (All)</option>
                    <option value="cash">Cash ({cashCount})</option>
                    <option value="card">Card ({cardCount})</option>
                    <option value="bank_transfer">Bank Transfer ({bankCount})</option>
                    <option value="upi">UPI / Wallet ({upiCount})</option>
                    <option value="credit">Credit ({creditCount})</option>
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
              {!canViewAll ? (
                  <div className="empty-container p-4 text-center text-danger">
                    <i className="bi bi-shield-lock me-2"></i>You do not have permission to view purchase bills (purchaseBill:all).
                  </div>
              ) : loading ? (
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
                              {canViewSingle && (
                                <button
                                    type="button"
                                    className="btn-row-action"
                                    title="View Purchase Details"
                                    onClick={() => handleViewPurchase(purchase)}
                                >
                                  <i className="bi bi-eye"></i> View
                                </button>
                              )}
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

        {/* Sticky Bottom-Right + New Purchase Button (permission-checked) */}
        {canAdd && (
          <button
              type="button"
              className="sales-add-sticky-button"
              onClick={handleAddBill}
              title="New Purchase Bill"
          >
              <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
              <span>New Purchase</span>
          </button>
        )}

        {/* View Single Purchase Bill Modal */}
        <ViewPurchaseBillModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            purchase={viewingPurchase}
            isLoading={isSingleLoading}
            onPrint={handlePrintFromModal}
            onDownloadPdf={handleDownloadPdfFromModal}
            onEdit={hasEditAccess ? handleEditPurchase : undefined}
            canEdit={hasEditAccess}
        />

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
