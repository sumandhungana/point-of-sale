import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import {
  fetchPurchases,
  GetAllPurchaseBillResponse,
  getSinglePurchaseBill,
} from '../../services/purchaseBillService';
import { InvoiceModal, InvoiceModalData } from '../components/InvoiceModal';
import { ReportPdfModal, ReportModalData } from '../components/ReportPdfModal';
import { ViewPurchaseBillModal } from '../components/ViewPurchaseBillModal';
import { printInvoiceDirectly } from '../utils/printInvoice';
import { useAppSettings } from '@/context/AppSettingsContext';
import { usePermission } from '@/core/rbac/usePermission';
import '../../../styles/Sales.css';
import '../../../styles/Purchase.css';

export interface GroupedPurchaseBill {
  id: number;
  purchaseNo: string;
  date?: string;
  supplierId?: number;
  supplierName: string;
  paymentMode: string;
  paymentStatus?: string;
  remarks?: string;
  photoPath?: string;
  category?: {
    name?: string;
  };
  totalAmount: number;
  productNames: string[];
  items: GetAllPurchaseBillResponse[];
}

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
  const [viewingPurchase, setViewingPurchase] = useState<any | null>(null);
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
      void fetchPurchasesList();
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

  // Group line-item records by unique purchase bill number and sum their amounts
  const groupedPurchases: GroupedPurchaseBill[] = useMemo(() => {
    const groups: { [purchaseNo: string]: GroupedPurchaseBill } = {};

    purchases.forEach((item) => {
      const key = (item.purchaseNo && item.purchaseNo.trim() !== '') ? item.purchaseNo.trim() : `ID-${item.id}`;
      const itemAmount = Number(item.amount) || 0;

      if (!groups[key]) {
        groups[key] = {
          id: item.id ?? 0,
          purchaseNo: item.purchaseNo || 'PUR-N/A',
          date: item.date,
          supplierId: item.supplierId,
          supplierName: item.supplierName || 'Walk-In Supplier',
          paymentMode: item.paymentMode || 'CASH',
          paymentStatus: item.paymentStatus,
          remarks: item.remarks,
          photoPath: item.photoPath,
          category: item.category,
          totalAmount: 0,
          productNames: [],
          items: [],
        };
      }

      groups[key].totalAmount += itemAmount;
      const itemName = item.item?.name || (item as any).productName || '';
      if (itemName && !groups[key].productNames.includes(itemName)) {
        groups[key].productNames.push(itemName);
      }
      if ((!groups[key].supplierName || groups[key].supplierName === 'Walk-In Supplier') && item.supplierName) {
        groups[key].supplierName = item.supplierName;
      }
      if (!groups[key].remarks && item.remarks) {
        groups[key].remarks = item.remarks;
      }
      if (!groups[key].photoPath && item.photoPath) {
        groups[key].photoPath = item.photoPath;
      }
      if (!groups[key].date && item.date) {
        groups[key].date = item.date;
      }
      groups[key].items.push(item);
    });

    return Object.values(groups);
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    return groupedPurchases
        .filter((purchase) => {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
              purchase.purchaseNo.toLowerCase().includes(query) ||
              purchase.supplierName.toLowerCase().includes(query) ||
              (purchase.remarks ?? '').toLowerCase().includes(query) ||
              purchase.paymentMode.toLowerCase().includes(query) ||
              purchase.items.some((i) => (i.item?.name ?? '').toLowerCase().includes(query));

          const matchesPayment = filterBy
              ? purchase.paymentMode.toLowerCase() === filterBy.toLowerCase()
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
            return (b.totalAmount ?? 0) - (a.totalAmount ?? 0);
          }
          if (sortBy === 'amount_asc') {
            return (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
          }
          if (sortBy === 'name_asc') {
            return a.supplierName.localeCompare(b.supplierName);
          }
          if (sortBy === 'name_desc') {
            return b.supplierName.localeCompare(a.supplierName);
          }
          // Default: newest first
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
  }, [groupedPurchases, searchQuery, filterBy, sortBy]);

  const handleEditPurchase = (purchase: any) => {
    if (!hasEditAccess) return;
    setIsViewModalOpen(false);
    navigate('/bills/purchase/add', { state: { purchase } });
  };

  const handleViewPurchase = async (purchase: GroupedPurchaseBill) => {
    if (!canViewSingle) return;

    // Fast preview with all grouped items while single API loads
    const initialViewData: any = {
      id: purchase.id,
      purchaseNo: purchase.purchaseNo,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      date: purchase.date,
      amount: purchase.totalAmount,
      paymentMode: purchase.paymentMode,
      paymentStatus: purchase.paymentStatus,
      remarks: purchase.remarks,
      photoPath: purchase.photoPath,
      items: purchase.items,
      item: purchase.items[0]?.item || purchase.items[0],
      category: purchase.items[0]?.category || purchase.category,
    };

    setViewingPurchase(initialViewData);
    setIsViewModalOpen(true);

    // Fetch full bill details using purchaseNo string if available
    if (purchase.purchaseNo && purchase.purchaseNo !== 'PUR-N/A') {
      setIsSingleLoading(true);
      try {
        const fullData: any = await getSinglePurchaseBill(purchase.purchaseNo);
        if (fullData) {
          const itemsList = Array.isArray(fullData) ? fullData : (fullData.items || [fullData]);
          const totalSum = itemsList.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

          setViewingPurchase({
            ...initialViewData,
            items: itemsList,
            amount: totalSum > 0 ? totalSum : purchase.totalAmount,
            item: itemsList[0]?.item || itemsList[0],
            category: itemsList[0]?.category,
          });
        }
      } catch (err) {
        console.warn('Could not fetch single purchase bill from API, using cached data:', err);
      } finally {
        setIsSingleLoading(false);
      }
    }
  };

  const handlePurchaseClick = (purchase: GroupedPurchaseBill) => {
    if (canViewSingle) {
      void handleViewPurchase(purchase);
    } else if (hasEditAccess) {
      handleEditPurchase(purchase);
    }
  };

  const handleAddBill = () => {
    navigate('/bills/purchase/add');
  };

  const formatPurchaseForInvoice = (purchase: any): InvoiceModalData => {
    const itemsList = Array.isArray(purchase.items) ? purchase.items : [purchase];
    const amount = purchase.totalAmount ?? purchase.amount ?? itemsList.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
    const supplierName = purchase.supplierName || (purchase.category?.name ? `${purchase.category.name} Vendor` : 'Walk-In Supplier');

    return {
      type: 'PURCHASE',
      invoiceNumber: purchase.purchaseNo || 'PUR-N/A',
      date: purchase.date || purchase.createdAt || new Date().toISOString(),
      partyName: supplierName,
      partyType: 'Supplier',
      paymentMode: purchase.paymentMode || 'CASH',
      remarks: purchase.remarks,
      items: itemsList.map((i: any, idx: number) => ({
        id: i.id || idx,
        name: i.item?.name || i.productName || 'Inventory Product',
        category: i.category?.name || 'General',
        quantity: i.quantity || 1,
        unitPrice: i.unitPrice || i.amount || 0,
        totalAmount: i.amount ?? 0,
      })),
      subtotal: amount,
      grandTotal: amount,
    };
  };

  const handleDownloadPurchasePdf = (purchase: GroupedPurchaseBill) => {
    const invData = formatPurchaseForInvoice(purchase);
    setSelectedInvoice(invData);
    setAutoDownloadInvoice(true);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintPurchaseDirectly = (purchase: GroupedPurchaseBill) => {
    const invData = formatPurchaseForInvoice(purchase);
    printInvoiceDirectly(invData);
  };

  const handlePrintFromModal = (p: any) => {
    const invData = formatPurchaseForInvoice(p);
    printInvoiceDirectly(invData);
  };

  const handleDownloadPdfFromModal = (p: any) => {
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
      party: p.supplierName || (p.category?.name ? `${p.category.name} Vendor` : 'Supplier'),
      itemsSummary: p.productNames.join(', ') || `${p.items.length} Product${p.items.length > 1 ? 's' : ''}`,
      paymentMode: p.paymentMode ?? 'CASH',
      amount: p.totalAmount ?? 0,
    }));

    setReportData({
      reportType: 'PURCHASE',
      title: 'Vendor Purchases Summary Report',
      subtitle: 'Comprehensive record of all inventory purchases and vendor invoices',
      totalAmount: filteredPurchases.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0),
      totalCount: filteredPurchases.length,
      rows,
    });
    setIsReportModalOpen(true);
  };

  const totalPurchases = groupedPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount ?? 0), 0);
  const cashPurchases = groupedPurchases
      .filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CASH')
      .reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
  const onlinePurchases = groupedPurchases
      .filter((p) => {
        const mode = (p.paymentMode || '').trim().toUpperCase();
        return ['CARD', 'UPI', 'BANK', 'BANK_TRANSFER', 'ONLINE', 'DIGITAL', 'QR', 'WALLET'].includes(mode) || (mode !== 'CASH' && mode !== 'CREDIT' && mode !== 'DUE' && mode !== '');
      })
      .reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);

  const cashCount = groupedPurchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CASH').length;
  const cardCount = groupedPurchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CARD').length;
  const upiCount = groupedPurchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'UPI').length;
  const bankCount = groupedPurchases.filter((p) => {
    const m = (p.paymentMode || '').trim().toUpperCase();
    return m === 'BANK' || m === 'BANK_TRANSFER';
  }).length;
  const creditCount = groupedPurchases.filter((p) => (p.paymentMode || '').trim().toUpperCase() === 'CREDIT').length;

  return (
      <div className="user-management-page-wrapper">
        <Sidebar />
        <div className="user-management-container">
          <Navbar />

          <div className="user-management-content">
            <div className="purchase-bill-page-header">
              <div className="purchase-bill-header-info">
                <div className="purchase-bill-header-icon">
                  <i className="bi bi-cart-check-fill" />
                </div>
                <div>
                  <h1 className="purchase-bill-header-title">Purchase Bills</h1>
                </div>
              </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="role-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <div className="stat-label">Total Spend</div>
                  <div className="stat-value" style={{ color: '#255DCE' }}>
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
                <div className="stat-icon-box green">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div>
                  <div className="stat-label">Cash Purchases</div>
                  <div className="stat-value" style={{ color: '#16a34a' }}>
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
                  <i className="bi bi-receipt"></i>
                  Invoices ({groupedPurchases.length})
                </button>

                <div className="sales-search-input-wrapper">
                  <i className="bi bi-search search-icon"></i>
                  <input
                      type="text"
                      placeholder="Search by purchase #, supplier name, item..."
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
                    <option value="name_asc">Supplier: A-Z</option>
                    <option value="name_desc">Supplier: Z-A</option>
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
                    const supplierName = purchase.supplierName || 'Walk-In Supplier';
                    const initials = supplierName
                        ? supplierName
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'PB';

                    return (
                        <div
                            className="role-item-card clickable-card"
                            key={purchase.purchaseNo || purchase.id}
                            onClick={() => handlePurchaseClick(purchase)}
                        >
                          {purchase.photoPath ? (
                              <img
                                  src={purchase.photoPath}
                                  alt={supplierName}
                                  className="role-avatar"
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                              />
                          ) : null}
                          <div
                              className="role-avatar"
                              style={{ display: purchase.photoPath ? 'none' : 'flex' }}
                          >
                            {initials}
                          </div>

                          <div className="role-main-details">
                            <div className="role-title-row">
                              <span className="role-card-name">{purchase.purchaseNo || 'PUR-N/A'}</span>
                              <span className="sales-item-box" title={purchase.productNames.join(', ') || 'N/A'}>
                                <i className="bi bi-box-seam me-1"></i>
                                {purchase.productNames.join(', ') || 'N/A'}
                              </span>
                            </div>

                            <div className="sales-customer-payment-row">
                              <span className="sales-customer-box" title={supplierName}>
                                <i className="bi bi-truck me-1"></i>
                                {supplierName}
                              </span>
                              <span className="sales-payment-mode-box">
                                {(purchase.paymentMode || 'CASH').toUpperCase()}
                              </span>
                            </div>

                            {purchase.remarks && (
                                <div className="sales-notes-row">
                                  <i className="bi bi-chat-left-text me-1"></i>
                                  <span>Notes: {purchase.remarks}</span>
                                </div>
                            )}
                          </div>

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

                            <div className="sales-amount-tag" style={{ color: '#255DCE', fontWeight: 'bold', fontSize: '16px' }}>
                              Rs. {formatNumber(purchase.totalAmount)}
                            </div>
                          </div>
                        </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

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

        <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            data={selectedInvoice}
            autoDownload={autoDownloadInvoice}
        />

        <ReportPdfModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            data={reportData}
        />
      </div>
  );
};
