import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { fetchRental, RentalItemDto } from '@/features/services/rentalItemService';
import {
  getRentalSummary,
  getGlobalRentalSummary,
  syncAllRentalPayments,
  RentalPaymentTransaction
} from '@/features/services/rentalPaymentService';
import { usePermission } from '@/core/rbac/usePermission';
import { useAppSettings } from '@/context/AppSettingsContext';
import '@/styles/RentalItem.css';

export const RentalItem: React.FC = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useAppSettings();
  const { hasPermission } = usePermission();
  const canAddRental = hasPermission('rental:add') || hasPermission('rental:create');

  const [rentalItems, setRentalItems] = useState<RentalItemDto[]>([]);
  const [paymentsMap, setPaymentsMap] = useState<Record<number, RentalPaymentTransaction[]>>({});
  const [totalRentalAmount, setTotalRentalAmount] = useState<number>(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);
  const [totalRemainingDue, setTotalRemainingDue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive UI States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sort, setSort] = useState<string>('');

  const loadRentalItems = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRental(forceRefresh);
      const items = data || [];
      setRentalItems(items);

      // 1. Calculate initial totals from any existing cached payments
      const initialSummary = getGlobalRentalSummary(items);
      setTotalRentalAmount(initialSummary.totalAmount);
      setTotalPaidAmount(initialSummary.totalPaid);
      setTotalRemainingDue(initialSummary.remainingDue);

      // 2. Sync all payment records from backend API so Paid data displays immediately
      if (items.length > 0) {
        const itemIds = items.map((item) => item.id);
        const syncedMap = await syncAllRentalPayments(itemIds, forceRefresh);
        setPaymentsMap(syncedMap);

        const syncedSummary = getGlobalRentalSummary(items, syncedMap);
        setTotalRentalAmount(syncedSummary.totalAmount);
        setTotalPaidAmount(syncedSummary.totalPaid);
        setTotalRemainingDue(syncedSummary.remainingDue);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rental items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentalItems();
  }, []);

  const handleRefresh = () => {
    loadRentalItems(true);
  };

  const getRentalStatus = (item: RentalItemDto): string => {
    const currentDate = new Date();
    const endDate = new Date(item.endDate);

    if (currentDate > endDate) {
      return 'Completed';
    }

    const startDate = new Date(item.startDate);
    if (currentDate < startDate) {
      return 'Not Started';
    }

    return 'In Progress';
  };


  // Filtering by search query and status
  const filteredItems = rentalItems.filter(item => {
    const matchesSearch = (item?.rentalItemName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item?.phoneNumber ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item?.address ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    const status = getRentalStatus(item);
    const matchesStatus = statusFilter ? status.toLowerCase() === statusFilter.toLowerCase() : true;

    return matchesSearch && matchesStatus;
  });

  // Sorting logic (Default: created date desc)
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sort) {
      case 'name_asc':
        return (a?.rentalItemName ?? '').localeCompare(b?.rentalItemName ?? '');
      case 'name_desc':
        return (b?.rentalItemName ?? '').localeCompare(a?.rentalItemName ?? '');
      case 'date_asc':
        return new Date(a?.startDate || 0).getTime() - new Date(b?.startDate || 0).getTime();
      case 'date_desc':
        return new Date(b?.startDate || 0).getTime() - new Date(a?.startDate || 0).getTime();
      case 'created_asc':
        return new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime();
      case 'created_desc':
      default: {
        const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (Number(b?.id) || 0) - (Number(a?.id) || 0);
      }
    }
  });

  if (loading) {
    return (
        <div className="rental-item-container">
          <Sidebar />
          <div className="rental-item-main">
            <div className="rental-item-loading-message">
              <i className="bi bi-arrow-clockwise spin"></i>
              Loading rental items...
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="rental-item-container">
        <Sidebar />
        <div className="rental-item-main">

            {/* Error Banner if any */}
            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
            )}

            {/* Search and Filters Toolbar */}
            <div className="rental-item-search-container">
              <div className="rental-item-search-bar">
                <i className="bi bi-search rental-item-search-icon"></i>
                <input
                    type="text"
                    placeholder="Search item, phone, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rental-item-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="rental-item-clear-btn"
                    title="Clear search"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
              <div className="rental-item-filters-wrap">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rental-item-dropdown"
                >
                  <option value="">All Status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rental-item-dropdown"
                >
                  <option value="">Created Date (Newest)</option>
                  <option value="created_asc">Created Date (Oldest)</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="date_desc">Rental Start (Newest)</option>
                  <option value="date_asc">Rental Start (Oldest)</option>
                </select>
              </div>
              <button
                type="button"
                className="rental-item-reminder-button"
                onClick={handleRefresh}
                title="Refresh Rental Items"
              >
                <i className="bi bi-arrow-clockwise"></i>
                Refresh
              </button>
              <button className="rental-item-reminder-button" onClick={() => alert('Reminders feature coming soon!')}>
                <i className="bi bi-alarm"></i>
                Reminder
              </button>
            </div>

            {/* Summary Card */}
            <div className="rental-item-summary-card">
              <div className="rental-item-summary-grid">
                <div className="rental-item-summary-item" style={{ borderLeftColor: '#3b82f6' }}>
                  <span className="rental-item-summary-label">
                    <i className="bi bi-cash-stack me-1"></i>
                    Total Rental
                  </span>
                  <span className="rental-item-summary-amount" style={{ color: '#1e293b' }}>
                    {formatCurrency(totalRentalAmount)}
                  </span>
                </div>
                <div className="rental-item-summary-item" style={{ borderLeftColor: '#10b981' }}>
                  <span className="rental-item-summary-label">
                    <i className="bi bi-check-circle me-1"></i>
                    Total Paid / Settled
                  </span>
                  <span className="rental-item-summary-amount" style={{ color: '#10b981' }}>
                    {formatCurrency(totalPaidAmount)}
                  </span>
                </div>
                <div className="rental-item-summary-item" style={{ borderLeftColor: '#ef4444' }}>
                  <span className="rental-item-summary-label">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    Remaining Balance Due
                  </span>
                  <span className="rental-item-summary-amount" style={{ color: totalRemainingDue > 0 ? '#ef4444' : '#10b981' }}>
                    {formatCurrency(totalRemainingDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Items List or Empty State */}
            {sortedItems.length === 0 ? (
                <div className="rental-item-loading-message">
                  <i className="bi bi-inbox me-2"></i>
                  No rental items found.
                </div>
            ) : (
                sortedItems.map(item => {
                  const status = getRentalStatus(item);
                  const itemSummary = getRentalSummary(item.id, item.rentalAmount || 0, paymentsMap[item.id]);
                  const isItemSettled = itemSummary.isFullyPaid;
                  
                  const statusClass = isItemSettled ? 'rental-item-status-completed' :
                      status === 'Completed' ? 'rental-item-status-completed' :
                      status === 'Not Started' ? 'rental-item-status-not-started' :
                          'rental-item-status-in-progress';

                  return (
                      <div
                        key={item?.id ?? Math.random()}
                        className="rental-item-card"
                        onClick={() => navigate(`/rental-items/statement/${item.id}`, { state: { rentalItem: item } })}
                        title="Click to view Statement and Record Payments"
                      >
                        <div className="rental-item-info">
                          <div className="rental-item-image-placeholder">
                            <i className="bi bi-box-seam"></i>
                          </div>
                          <div className="rental-item-details">
                            <div className="rental-item-name">{item?.rentalItemName ?? 'Unnamed Item'}</div>
                            <div className="rental-item-time">
                              <i className="bi bi-calendar-event me-1"></i>
                              Period: {item?.rentalPeriod || '-'} |
                              Start: {item?.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} |
                              End: {item?.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="rental-item-time">
                              <i className="bi bi-telephone me-1"></i>
                              Phone: {item?.phoneNumber || 'N/A'} |
                              <i className="bi bi-geo-alt me-1 ms-1"></i>
                              Address: {item?.address || 'N/A'}
                            </div>
                            {item?.remarks && (
                                <div className="rental-item-time">
                                  <i className="bi bi-chat-text me-1"></i>
                                  Remarks: {item.remarks}
                                </div>
                            )}
                            <div className={`rental-item-status ${statusClass}`}>
                              <i className="bi bi-circle-fill me-1" style={{ fontSize: '8px' }}></i>
                              Status: {isItemSettled ? 'Fully Settled' : status}
                            </div>
                          </div>
                        </div>
                        <div className="rental-item-amount">
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>
                            {formatCurrency(item?.rentalAmount ?? 0)}
                          </div>
                          <div className="rental-card-balance-row">
                            <span className="rental-card-paid-text">
                              Paid: {formatCurrency(itemSummary.netPaid)}
                            </span>
                            {isItemSettled ? (
                              <span className="rental-card-settled-text">
                                <i className="bi bi-check-circle-fill me-1"></i>Settled
                              </span>
                            ) : (
                              <span className="rental-card-due-text">
                                Due: {formatCurrency(itemSummary.remainingBalance)}
                              </span>
                            )}
                          </div>
                          <div className="rental-card-statement-btn">
                            <i className="bi bi-file-earmark-text"></i>
                            Statement & Pay <i className="bi bi-chevron-right ms-1"></i>
                          </div>
                        </div>
                      </div>
                  );
                })
            )}

            {/* Add Button Container */}
            {canAddRental && (
              <div className="rental-item-add-button-container">
                <button
                    className="rental-item-add-button"
                    onClick={() => navigate('/rental/add')}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Rental Items
                </button>
              </div>
            )}

          </div>
        </div>
  );
};