import '../../../styles/Sales.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  getAllSalesBill as fetchSalesBillsService,
  GetAllSalesBillResponse,
  getSingleSalesBill,
  GetSingleSalesBillResponse
} from '../../services/salesBillService';
import { InvoiceModal, InvoiceModalData } from '../components/InvoiceModal';
import { ReportPdfModal, ReportModalData } from '../components/ReportPdfModal';
import { ViewSalesBillModal } from '../components/ViewSalesBillModal';
import { printInvoiceDirectly } from '../utils/printInvoice';
import { useAppSettings } from '@/context/AppSettingsContext';
import { usePermission } from '@/core/rbac/usePermission';

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
  const { formatNumber } = useAppSettings();
  const { hasPermission, isSuperAdmin } = usePermission();

  // RBAC permissions
  const canViewAll = isSuperAdmin || hasPermission('salesBill:all');
  const canViewSingle = isSuperAdmin || hasPermission('salesBill:single') || hasPermission('salesBill:all');
  const canAdd = isSuperAdmin || hasPermission('salesBill:add');
  const canEdit = isSuperAdmin || hasPermission('salesBill:update');
  const hasEditAccess = canEdit || canAdd;

  const [salesBills, setSalesBills] = useState<GetAllSalesBillResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBy, setFilterBy] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Single Bill View Modal State
  const [viewingBill, setViewingBill] = useState<GetSingleSalesBillResponse | null>(null);
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
      fetchSalesBills();
    } else {
      setLoading(false);
    }
  }, [canViewAll]);

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

          const matchesFilter = filterBy
              ? bill.paymentMode.toLowerCase() === filterBy.toLowerCase()
              : true;

          return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
          if (sortBy === 'oldest') {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
          }
          if (sortBy === 'amount_desc') {
            return b.totalAmount - a.totalAmount;
          }
          if (sortBy === 'amount_asc') {
            return a.totalAmount - b.totalAmount;
          }
          if (sortBy === 'name_asc') {
            return a.customerName.localeCompare(b.customerName);
          }
          if (sortBy === 'name_desc') {
            return b.customerName.localeCompare(a.customerName);
          }
          // Default: newest first
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
  }, [groupedBills, searchQuery, filterBy, sortBy]);

  const handleEditBill = (groupedBill: GroupedSalesBill | GetSingleSalesBillResponse) => {
    if (!hasEditAccess) return;

    const isSingle = !('items' in groupedBill);
    const formattedBill = {
      id: groupedBill.id,
      billNumber: groupedBill.billNumber || '',
      billDate: groupedBill.billDate || '',
      amount: isSingle ? (groupedBill as GetSingleSalesBillResponse).amount ?? 0 : (groupedBill as GroupedSalesBill).totalAmount,
      paymentMode: groupedBill.paymentMode || 'CASH',
      remarks: groupedBill.remarks || null,
      photoPath: null,
      customer: {
        customerId: isSingle
          ? ((groupedBill as GetSingleSalesBillResponse).customerId || 0)
          : ((groupedBill as GroupedSalesBill).items[0]?.customerId || 0),
        name: isSingle
          ? ((groupedBill as GetSingleSalesBillResponse).customerName || 'Walk-in Customer')
          : (groupedBill as GroupedSalesBill).customerName,
      },
      items: isSingle
        ? [
            {
              itemId: (groupedBill as GetSingleSalesBillResponse).productId || 0,
              name: (groupedBill as GetSingleSalesBillResponse).productName || 'Product Item',
              unit: 'pcs',
              availableStock: 0,
              quantity: (groupedBill as GetSingleSalesBillResponse).quantity || 1,
              unitPrice: (groupedBill as GetSingleSalesBillResponse).unitPrice || 0,
              taxPercentage: (groupedBill as GetSingleSalesBillResponse).taxPercentage || 0,
              vatPercentage: (groupedBill as GetSingleSalesBillResponse).vatPercentage || 0,
              taxAmount: (groupedBill as GetSingleSalesBillResponse).taxAmount || 0,
              vatAmount: (groupedBill as GetSingleSalesBillResponse).vatAmount || 0,
              totalPrice: (groupedBill as GetSingleSalesBillResponse).amount || 0,
            },
          ]
        : (groupedBill as GroupedSalesBill).items.map((i) => ({
            itemId: i.productId || 0,
            name: i.productName || 'Product Item',
            unit: 'pcs',
            availableStock: 0,
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice || 0,
            taxPercentage: i.taxPercentage || 0,
            vatPercentage: i.vatPercentage || 0,
            taxAmount: i.taxAmount || 0,
            vatAmount: i.vatAmount || 0,
            totalPrice: i.amount ?? 0,
          })),
    };

    setIsViewModalOpen(false);
    navigate('/bills/sales/add', { state: { bill: formattedBill } });
  };

  const handleViewBill = async (groupedBill: GroupedSalesBill) => {
    if (!canViewSingle) return;

    // Fast preview while single API loads
    const firstItem = groupedBill.items[0];
    const initialViewData: GetSingleSalesBillResponse = {
      id: groupedBill.id,
      billNumber: groupedBill.billNumber,
      billDate: groupedBill.billDate,
      customerId: firstItem?.customerId,
      customerName: groupedBill.customerName,
      productId: firstItem?.productId,
      productName: groupedBill.productNames.join(', ') || firstItem?.productName,
      quantity: firstItem?.quantity || 1,
      unitPrice: firstItem?.unitPrice || 0,
      taxPercentage: firstItem?.taxPercentage || 0,
      vatPercentage: firstItem?.vatPercentage || 0,
      taxAmount: firstItem?.taxAmount || 0,
      vatAmount: firstItem?.vatAmount || 0,
      amount: groupedBill.totalAmount,
      paymentMode: groupedBill.paymentMode,
      paymentStatus: firstItem?.paymentStatus || 'PAID',
      remarks: groupedBill.remarks,
      createdAt: groupedBill.createdAt,
      createdBy: groupedBill.createdBy,
    };

    setViewingBill(initialViewData);
    setIsViewModalOpen(true);

    if (groupedBill.id && groupedBill.id > 0) {
      setIsSingleLoading(true);
      try {
        const fullDetails = await getSingleSalesBill(groupedBill.id);
        if (fullDetails) {
          setViewingBill(fullDetails);
        }
      } catch (err) {
        console.warn('Could not fetch single sales bill from API, using cached data:', err);
      } finally {
        setIsSingleLoading(false);
      }
    }
  };

  const handleBillClick = (groupedBill: GroupedSalesBill) => {
    if (canViewSingle) {
      handleViewBill(groupedBill);
    } else if (hasEditAccess) {
      handleEditBill(groupedBill);
    }
  };

  const handleAddBill = () => {
    navigate('/bills/sales/add');
  };

  const formatSalesForInvoice = (bill: GroupedSalesBill): InvoiceModalData => {
    return {
      type: 'SALES',
      invoiceNumber: bill.billNumber,
      date: bill.billDate || bill.createdAt || new Date().toISOString(),
      partyName: bill.customerName || 'Walk-in Customer',
      partyType: 'Customer',
      paymentMode: bill.paymentMode,
      remarks: bill.remarks,
      createdBy: bill.createdBy,
      items: bill.items.map((i, idx) => ({
        id: i.id || idx,
        name: i.productName || 'Product Item',
        quantity: i.quantity || 1,
        unitPrice: i.unitPrice || (i.amount ? i.amount / (i.quantity || 1) : 0),
        taxPercentage: i.taxPercentage,
        vatPercentage: i.vatPercentage,
        taxAmount: i.taxAmount,
        vatAmount: i.vatAmount,
        totalAmount: i.amount ?? 0,
      })),
      subtotal: bill.totalAmount,
      grandTotal: bill.totalAmount,
    };
  };

  const formatSingleSalesForInvoice = (b: GetSingleSalesBillResponse): InvoiceModalData => {
    const total = b.amount ?? 0;
    return {
      type: 'SALES',
      invoiceNumber: b.billNumber || 'BILL-N/A',
      date: b.billDate || b.createdAt || new Date().toISOString(),
      partyName: b.customerName || 'Walk-in Customer',
      partyType: 'Customer',
      paymentMode: b.paymentMode || 'CASH',
      remarks: b.remarks,
      items: [
        {
          name: b.productName || 'Product Item',
          quantity: b.quantity || 1,
          unitPrice: b.unitPrice || total,
          taxPercentage: b.taxPercentage,
          vatPercentage: b.vatPercentage,
          taxAmount: b.taxAmount,
          vatAmount: b.vatAmount,
          totalAmount: total,
        },
      ],
      subtotal: total,
      grandTotal: total,
    };
  };

  const handleDownloadSalesPdf = (bill: GroupedSalesBill) => {
    const invData = formatSalesForInvoice(bill);
    setSelectedInvoice(invData);
    setAutoDownloadInvoice(true);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintSalesDirectly = (bill: GroupedSalesBill) => {
    const invData = formatSalesForInvoice(bill);
    printInvoiceDirectly(invData);
  };

  const handlePrintFromModal = (b: GetSingleSalesBillResponse) => {
    const invData = formatSingleSalesForInvoice(b);
    printInvoiceDirectly(invData);
  };

  const handleDownloadPdfFromModal = (b: GetSingleSalesBillResponse) => {
    const invData = formatSingleSalesForInvoice(b);
    setSelectedInvoice(invData);
    setAutoDownloadInvoice(true);
    setIsInvoiceModalOpen(true);
  };

  const handleExportReportPDF = () => {
    const rows = filteredSalesBills.map((b) => ({
      id: b.id,
      number: b.billNumber,
      date: b.billDate || b.createdAt || '',
      party: b.customerName,
      itemsSummary: b.productNames.join(', ') || 'Inventory Items',
      paymentMode: b.paymentMode,
      amount: b.totalAmount,
    }));

    setReportData({
      reportType: 'SALES',
      title: 'Customer Sales Invoices Report',
      subtitle: 'Comprehensive ledger of all customer invoices and revenue receipts',
      totalAmount: filteredSalesBills.reduce((sum, b) => sum + b.totalAmount, 0),
      totalCount: filteredSalesBills.length,
      rows,
    });
    setIsReportModalOpen(true);
  };

  // Metric aggregates
  const totalRevenue = groupedBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalInvoices = groupedBills.length;
  const cashRevenue = groupedBills
      .filter((b) => (b.paymentMode || '').trim().toUpperCase() === 'CASH')
      .reduce((sum, b) => sum + b.totalAmount, 0);
  const onlineSales = groupedBills
      .filter((b) => {
        const mode = (b.paymentMode || '').trim().toUpperCase();
        return ['CARD', 'UPI', 'BANK', 'ONLINE', 'DIGITAL', 'QR', 'WALLET'].includes(mode) || (mode !== 'CASH' && mode !== 'CREDIT' && mode !== 'DUE' && mode !== '');
      })
      .reduce((sum, b) => sum + b.totalAmount, 0);

  const cashCount = groupedBills.filter((b) => (b.paymentMode || '').trim().toUpperCase() === 'CASH').length;
  const cardCount = groupedBills.filter((b) => (b.paymentMode || '').trim().toUpperCase() === 'CARD').length;
  const upiCount = groupedBills.filter((b) => (b.paymentMode || '').trim().toUpperCase() === 'UPI').length;
  const bankCount = groupedBills.filter((b) => (b.paymentMode || '').trim().toUpperCase() === 'BANK').length;

  return (
      <div className="user-management-page-wrapper">
        <Sidebar />
        <div className="user-management-container">
          <Navbar />

          <div className="user-management-content">
            {/* Top Page Header - Clean Add Purchase Bill Style */}
            <div className="sales-bill-page-header">
              <div className="sales-bill-header-info">
                <div className="sales-bill-header-icon">
                  <i className="bi bi-receipt-cutoff" />
                </div>
                <div>
                  <h1 className="sales-bill-header-title">Sales Bills</h1>
                </div>
              </div>

              {/*<div className="sales-bill-header-actions">*/}
              {/*  <button*/}
              {/*    type="button"*/}
              {/*    className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"*/}
              {/*    onClick={handleAddBill}*/}
              {/*  >*/}
              {/*    <i className="bi bi-plus-lg" />*/}
              {/*    <span>Add Sales Bill</span>*/}
              {/*  </button>*/}
              {/*</div>*/}
            </div>

            {/* Stats Summary Cards */}
            <div className="role-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <div className="stat-label">Total Sales</div>
                  <div className="stat-value" style={{ color: '#255DCE' }}>
                    Rs. {formatNumber(totalRevenue)}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box purple">
                  <i className="bi bi-globe2"></i>
                </div>
                <div>
                  <div className="stat-label">Online Sales</div>
                  <div className="stat-value" style={{ color: '#7c3aed' }}>
                    Rs. {formatNumber(onlineSales)}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box green">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div>
                  <div className="stat-label">Cash Sales</div>
                  <div className="stat-value" style={{ color: '#16a34a' }}>
                    Rs. {formatNumber(cashRevenue)}
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
                  title="Click to reset filters and view all invoices"
                >
                  <i className="bi bi-receipt"></i>
                   Invoices ({totalInvoices})
                </button>

                <div className="sales-search-input-wrapper">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search by invoice #, customer name, product..."
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
                    title="Sort invoices"
                  >
                    <option value="newest">Sort (Newest)</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount_desc">Amount: High to Low</option>
                    <option value="amount_asc">Amount: Low to High</option>
                    <option value="name_asc">Customer: A-Z</option>
                    <option value="name_desc">Customer: Z-A</option>
                  </select>
                </div>

                <div className="toolbar-select-wrap">
                  <i className="bi bi-funnel"></i>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="toolbar-select"
                    title="Filter invoices"
                  >
                    <option value="">Filter (All)</option>
                    <option value="cash">Cash ({cashCount})</option>
                    <option value="card">Card ({cardCount})</option>
                    <option value="upi">UPI / Digital ({upiCount})</option>
                    <option value="bank">Bank Transfer ({bankCount})</option>
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

            {/* Sales Invoice List */}
            <div className="role-list-container">
              {!canViewAll ? (
                  <div className="empty-container p-4 text-center text-danger">
                    <i className="bi bi-shield-lock me-2"></i>You do not have permission to view sales bills (salesBill:all).
                  </div>
              ) : loading ? (
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

                          {/* Right-aligned Section: Actions & Amount */}
                          <div className="role-card-right d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {canViewSingle && (
                                <button
                                    type="button"
                                    className="btn-row-action"
                                    title="View Bill Details"
                                    onClick={() => handleViewBill(bill)}
                                >
                                  <i className="bi bi-eye"></i> View
                                </button>
                              )}
                              <button
                                  type="button"
                                  className="btn-row-action pdf"
                                  title="Download Sales Invoice PDF"
                                  onClick={() => handleDownloadSalesPdf(bill)}
                              >
                                <i className="bi bi-file-earmark-pdf"></i> PDF
                              </button>
                              <button
                                  type="button"
                                  className="btn-row-action"
                                  title="Print Invoice"
                                  onClick={() => handlePrintSalesDirectly(bill)}
                              >
                                <i className="bi bi-printer"></i>
                              </button>
                            </div>

                            <div className="vertical-divider"></div>

                            <div className="sales-amount-tag" style={{ color: '#255DCE', fontWeight: 'bold', fontSize: '16px' }}>
                              Rs. {formatNumber(bill.totalAmount)}
                            </div>
                          </div>
                        </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom-Right + New Invoice Button (permission-checked) */}
        {canAdd && (
          <button
              type="button"
              className="sales-add-sticky-button"
              onClick={handleAddBill}
              title="New Invoice"
          >
              <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
              <span>New Invoice</span>
          </button>
        )}

        {/* View Single Sales Bill Modal */}
        <ViewSalesBillModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            bill={viewingBill}
            isLoading={isSingleLoading}
            onPrint={handlePrintFromModal}
            onDownloadPdf={handleDownloadPdfFromModal}
            onEdit={hasEditAccess ? handleEditBill : undefined}
            canEdit={hasEditAccess}
        />

        {/* Sales Invoice PDF & Print Modal */}
        <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            data={selectedInvoice}
            autoDownload={autoDownloadInvoice}
        />

        {/* Sales List Summary Report PDF Modal */}
        <ReportPdfModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            data={reportData}
        />
      </div>
  );
};
