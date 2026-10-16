import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { toast } from 'react-toastify';
import { fetchRental, RentalItemDto } from '@/features/services/rentalItemService';
import {
  getRentalPayments,
  fetchRentalPaymentsApi,
  addRentalPayment,
  deleteRentalPayment,
  getRentalSummary,
  RentalPaymentTransaction,
  RentalPaymentSummary,
} from '@/features/services/rentalPaymentService';
import { usePermission } from '@/core/rbac/usePermission';
import '@/styles/RentalStatement.css';

export const RentalStatement: React.FC = () => {
  const { hasPermission } = usePermission();
  const canPayRental = hasPermission('rental:payment');

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const rentalId = id ? parseInt(id, 10) : 0;

  // Rental Item details
  const [rentalItem, setRentalItem] = useState<RentalItemDto | null>(
    location.state?.rentalItem || null
  );
  const [loading, setLoading] = useState<boolean>(!rentalItem);
  const [error, setError] = useState<string | null>(null);

  // Transactions & Summary
  const [payments, setPayments] = useState<RentalPaymentTransaction[]>([]);
  const [summary, setSummary] = useState<RentalPaymentSummary>({
    totalRentalAmount: 0,
    totalGiven: 0,
    totalReceived: 0,
    netPaid: 0,
    remainingBalance: 0,
    isFullyPaid: false,
  });

  // Modal States
  const [showGaveModal, setShowGaveModal] = useState<boolean>(false);
  const [showReceivedModal, setShowReceivedModal] = useState<boolean>(false);

  // Payment Form States
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CARD' | 'QR' | 'BANK' | 'CHEQUE'>('CASH');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentRemarks, setPaymentRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [modeFilter, setModeFilter] = useState<string>('ALL');

  // Load rental item if not in location.state
  const loadRentalItem = useCallback(async () => {
    if (rentalItem && rentalItem.id === rentalId) return;

    setLoading(true);
    setError(null);
    try {
      const items = await fetchRental();
      const found = (items || []).find((item) => Number(item.id) === rentalId);
      if (found) {
        setRentalItem(found);
      } else {
        setError(`Rental item with ID #${rentalId} not found.`);
      }
    } catch (err) {
      console.error('Failed to fetch rental item:', err);
      setError('Unable to load rental item details.');
    } finally {
      setLoading(false);
    }
  }, [rentalId, rentalItem]);

  // Refresh payments and balances from backend API (with instant cache fallback)
  const refreshTransactions = useCallback(async () => {
    if (!rentalId) return;

    // 1. Immediately populate from local cache if present
    const cached = getRentalPayments(rentalId);
    if (cached && cached.length > 0) {
      setPayments(cached);
      const rentalAmount = rentalItem?.rentalAmount || 0;
      setSummary(getRentalSummary(rentalId, rentalAmount, cached));
    }

    // 2. Fetch fresh payment data from the shared backend payments table
    try {
      const freshPayments = await fetchRentalPaymentsApi(rentalId);
      setPayments(freshPayments);
      const rentalAmount = rentalItem?.rentalAmount || 0;
      setSummary(getRentalSummary(rentalId, rentalAmount, freshPayments));
    } catch (err) {
      console.error('Failed to load rental payments from backend API:', err);
    }
  }, [rentalId, rentalItem?.rentalAmount]);

  useEffect(() => {
    loadRentalItem();
  }, [loadRentalItem]);

  useEffect(() => {
    if (rentalItem) {
      refreshTransactions();
    }
  }, [rentalItem, refreshTransactions]);

  // Calculate rental status
  const getRentalStatus = (item: RentalItemDto | null): string => {
    if (!item) return 'Unknown';
    if (summary.isFullyPaid) return 'Settled';

    const currentDate = new Date();
    const endDate = new Date(item.endDate);
    const startDate = new Date(item.startDate);

    if (currentDate > endDate) return 'Completed';
    if (currentDate < startDate) return 'Not Started';
    return 'In Progress';
  };

  // Open modals with reset fields
  const handleOpenGaveModal = (prefillAmount?: number) => {
    setPaymentAmount(prefillAmount !== undefined ? prefillAmount.toString() : '');
    setPaymentMode('CASH');
    setPaymentDate(new Date().toISOString().substring(0, 10));
    setPaymentRef('');
    setPaymentRemarks('');
    setShowGaveModal(true);
  };

  const handleOpenReceivedModal = () => {
    setPaymentAmount('');
    setPaymentMode('CASH');
    setPaymentDate(new Date().toISOString().substring(0, 10));
    setPaymentRef('');
    setPaymentRemarks('');
    setShowReceivedModal(true);
  };

  // Handle Recording Payment ("You Gave" or "You Received")
  const handleSavePayment = async (category: 'GIVEN' | 'RECEIVED') => {
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }

    if (!rentalId) {
      toast.error('Rental ID is missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addRentalPayment(rentalId, {
        amount: amt,
        paymentCategory: category,
        paymentType: paymentMode,
        date: paymentDate,
        referenceNo: paymentRef,
        remarks: paymentRemarks,
      });

      toast.success(
        category === 'GIVEN'
          ? `Payment of रु ${amt.toLocaleString()} recorded successfully in payments table!`
          : `Advance/Deposit of रु ${amt.toLocaleString()} recorded in payments table!`
      );

      // Close modals
      setShowGaveModal(false);
      setShowReceivedModal(false);

      // Refresh transactions from backend
      await refreshTransactions();
    } catch (err) {
      console.error('Error saving payment:', err);
      toast.error('Failed to save payment record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete payment
  const handleDeletePayment = (paymentId: string) => {
    if (window.confirm('Are you sure you want to delete this payment transaction?')) {
      const ok = deleteRentalPayment(rentalId, paymentId);
      if (ok) {
        toast.info('Payment transaction removed.');
        refreshTransactions();
      } else {
        toast.error('Failed to delete payment transaction.');
      }
    }
  };

  // Filter transactions
  const filteredPayments = useMemo(() => {
    return payments.filter((tx) => {
      // Category filter
      if (categoryFilter !== 'ALL' && tx.paymentCategory !== categoryFilter) {
        return false;
      }
      // Mode filter
      if (modeFilter !== 'ALL' && tx.paymentType !== modeFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRemarks = (tx.remarks || '').toLowerCase().includes(q);
        const matchesRef = (tx.referenceNo || '').toLowerCase().includes(q);
        const matchesAmount = tx.amount.toString().includes(q);
        return matchesRemarks || matchesRef || matchesAmount;
      }
      return true;
    });
  }, [payments, categoryFilter, modeFilter, searchQuery]);

  const status = getRentalStatus(rentalItem);
  const statusClass =
    status === 'Settled'
      ? 'settled'
      : status === 'Completed'
      ? 'completed'
      : status === 'Not Started'
      ? 'not-started'
      : 'in-progress';

  const paidPercentage = summary.totalRentalAmount > 0
    ? Math.min(100, Math.round((summary.netPaid / summary.totalRentalAmount) * 100))
    : 0;

  if (loading) {
    return (
      <div className="rental-statement-container">
        <Sidebar />
        <div className="rental-statement-main">
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <i className="bi bi-arrow-clockwise spin" style={{ fontSize: '2rem' }}></i>
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading rental statement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="rental-statement-container">
        <Sidebar />
        <div className="rental-statement-main">
          {/* Top Navigation */}
          <div className="rental-statement-top-nav">
            <button
              type="button"
              className="rental-statement-back-btn"
              onClick={() => navigate('/rental-items')}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Rental Items
            </button>

            <div className="rental-statement-header-actions">
              <button
                type="button"
                className="rental-statement-action-btn"
                onClick={() => window.print()}
                title="Print Rental Statement"
              >
                <i className="bi bi-printer"></i>
                Print Statement
              </button>
              {canPayRental && (
                <button
                  type="button"
                  className="rental-statement-action-btn primary"
                  onClick={() => handleOpenGaveModal(summary.remainingBalance)}
                >
                  <i className="bi bi-plus-circle"></i>
                  Pay for Rental
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {rentalItem && (
            <>
              {/* Profile Card */}
              <div className="rental-statement-profile-card">
                <div className="rental-statement-profile-top">
                  <div className="rental-statement-item-identity">
                    <div className="rental-statement-icon-badge">
                      <i className="bi bi-box-seam"></i>
                    </div>
                    <div className="rental-statement-title-wrap">
                      <h1>{rentalItem.rentalItemName || 'Rental Item'}</h1>
                      <div className="rental-statement-badge-row">
                        <span className={`rental-status-pill ${statusClass}`}>
                          <i className="bi bi-circle-fill" style={{ fontSize: '7px' }}></i>
                          {status}
                        </span>
                        <span className="rental-statement-period-pill">
                          <i className="bi bi-clock-history me-1"></i>
                          Period: {rentalItem.rentalPeriod || 'Standard'}
                        </span>
                        <span className="rental-statement-period-pill">
                          <i className="bi bi-hash me-1"></i>
                          ID #{rentalItem.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="rental-statement-meta-grid">
                  <div className="rental-meta-cell">
                    <i className="bi bi-telephone"></i>
                    <div>
                      <div className="meta-label">Phone Number</div>
                      <div className="meta-value">
                        {rentalItem.phoneNumber ? (
                          <a
                            href={`tel:${rentalItem.phoneNumber}`}
                            className="meta-phone-link"
                          >
                            {rentalItem.phoneNumber}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rental-meta-cell">
                    <i className="bi bi-geo-alt"></i>
                    <div>
                      <div className="meta-label">Address / Location</div>
                      <div className="meta-value">{rentalItem.address || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="rental-meta-cell">
                    <i className="bi bi-calendar-event"></i>
                    <div>
                      <div className="meta-label">Rental Duration</div>
                      <div className="meta-value">
                        {rentalItem.startDate
                          ? new Date(rentalItem.startDate).toLocaleDateString()
                          : 'N/A'}{' '}
                        -{' '}
                        {rentalItem.endDate
                          ? new Date(rentalItem.endDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {rentalItem.remarks && (
                    <div className="rental-meta-cell">
                      <i className="bi bi-chat-left-quote"></i>
                      <div>
                        <div className="meta-label">Remarks / Note</div>
                        <div className="meta-value">{rentalItem.remarks}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="rental-statement-metrics-grid">
                {/* Total Rental Amount */}
                <div className="rental-metric-card total">
                  <div>
                    <div className="rental-metric-header">
                      <span className="rental-metric-title">Total Rental Amount</span>
                      <i className="bi bi-cash-stack rental-metric-icon"></i>
                    </div>
                    <div className="rental-metric-value">
                      रु {summary.totalRentalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="rental-progress-bar-bg">
                      <div
                        className="rental-progress-bar-fill"
                        style={{ width: `${paidPercentage}%` }}
                      ></div>
                    </div>
                    <div className="rental-metric-subtext">
                      {paidPercentage}% Paid ({summary.isFullyPaid ? 'Settled' : 'Ongoing'})
                    </div>
                  </div>
                </div>

                {/* Total Paid (You Gave) */}
                <div className="rental-metric-card paid">
                  <div>
                    <div className="rental-metric-header">
                      <span className="rental-metric-title">You Gave / Paid</span>
                      <i className="bi bi-arrow-up-circle rental-metric-icon"></i>
                    </div>
                    <div className="rental-metric-value">
                      रु {summary.totalGiven.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="rental-metric-subtext">
                    Total payments made towards this item
                  </div>
                </div>

                {/* Total Advance / Received */}
                <div className="rental-metric-card received">
                  <div>
                    <div className="rental-metric-header">
                      <span className="rental-metric-title">You Received / Advance</span>
                      <i className="bi bi-arrow-down-circle rental-metric-icon"></i>
                    </div>
                    <div className="rental-metric-value">
                      रु {summary.totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="rental-metric-subtext">
                    Advance deposit or payments collected
                  </div>
                </div>

                {/* Remaining Balance Due */}
                <div className="rental-metric-card due">
                  <div>
                    <div className="rental-metric-header">
                      <span className="rental-metric-title">Remaining Balance</span>
                      <i className="bi bi-exclamation-circle rental-metric-icon"></i>
                    </div>
                    <div
                      className="rental-metric-value"
                      style={{ color: summary.remainingBalance > 0 ? '#dc2626' : '#16a34a' }}
                    >
                      रु {summary.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="rental-metric-subtext">
                    {summary.remainingBalance <= 0
                      ? 'Rental amount fully settled'
                      : 'Pending amount to pay'}
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Card */}
              <div className="rental-transactions-card">
                <div className="rental-transactions-header">
                  <div className="rental-transactions-title">
                    <i className="bi bi-clock-history"></i>
                    Payment History & Ledger
                    <span className="rental-transactions-count-badge">
                      {filteredPayments.length} transactions
                    </span>
                  </div>

                  <div className="rental-transactions-filters">
                    <div className="rental-tx-search-box">
                      <i className="bi bi-search text-muted"></i>
                      <input
                        type="text"
                        placeholder="Search ref or remarks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <select
                      className="rental-tx-dropdown"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="GIVEN">You Gave (Paid)</option>
                      <option value="RECEIVED">You Received (Advance)</option>
                    </select>

                    <select
                      className="rental-tx-dropdown"
                      value={modeFilter}
                      onChange={(e) => setModeFilter(e.target.value)}
                    >
                      <option value="ALL">All Modes</option>
                      <option value="CASH">Cash</option>
                      <option value="QR">QR Code</option>
                      <option value="CARD">Card</option>
                      <option value="BANK">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                </div>

                {filteredPayments.length === 0 ? (
                  <div className="rental-tx-empty">
                    <div className="rental-tx-empty-icon">
                      <i className="bi bi-receipt"></i>
                    </div>
                    <h3>No Payment Transactions Recorded</h3>
                    <p>
                      Click the buttons below to record payments or advances made for this rental
                      item.
                    </p>
                    {canPayRental && (
                      <button
                        type="button"
                        className="rental-statement-action-btn primary"
                        onClick={() => handleOpenGaveModal(summary.remainingBalance)}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Record First Payment
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rental-tx-table-responsive">
                    <table className="rental-tx-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Payment Mode</th>
                          <th>Reference / Bill #</th>
                          <th>Remarks</th>
                          <th style={{ textAlign: 'right' }}>Amount (रु)</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((tx) => (
                          <tr key={tx.id}>
                            <td>
                              <i className="bi bi-calendar3 me-2 text-muted"></i>
                              {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              {tx.paymentCategory === 'GIVEN' ? (
                                <span className="rental-tx-badge given">
                                  <i className="bi bi-arrow-up-circle"></i>
                                  You Gave (Paid)
                                </span>
                              ) : (
                                <span className="rental-tx-badge received">
                                  <i className="bi bi-arrow-down-circle"></i>
                                  You Received
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="rental-mode-pill">{tx.paymentType}</span>
                            </td>
                            <td>{tx.referenceNo || '-'}</td>
                            <td>{tx.remarks || '-'}</td>
                            <td
                              style={{ textAlign: 'right' }}
                              className={`rental-amount-cell ${
                                tx.paymentCategory === 'GIVEN' ? 'positive' : 'received'
                              }`}
                            >
                              रु {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="rental-delete-btn"
                                onClick={() => handleDeletePayment(tx.id)}
                                title="Delete Payment"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Sleek Fixed Bottom Action Bar */}
          {canPayRental && (
            <div className="rental-bottom-bar">
              <button
                type="button"
                className="rental-btn-gave"
                onClick={() => handleOpenGaveModal(summary.remainingBalance)}
              >
                <i className="bi bi-arrow-up-circle"></i>
                You Gave (Pay Rental)
              </button>

              <button
                type="button"
                className="rental-btn-received"
                onClick={handleOpenReceivedModal}
              >
                <i className="bi bi-arrow-down-circle"></i>
                You Received (Advance)
              </button>
            </div>
          )}

          {/* Modal: You Gave (Pay for Rental) */}
          {showGaveModal && (
            <div className="rental-popup-overlay" onClick={() => setShowGaveModal(false)}>
              <div className="rental-popup-card" onClick={(e) => e.stopPropagation()}>
                <div className="rental-popup-header gave">
                  <h3>
                    <i className="bi bi-arrow-up-circle"></i>
                    Pay for Rental (You Gave)
                  </h3>
                  <button
                    type="button"
                    className="rental-popup-close"
                    onClick={() => setShowGaveModal(false)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="rental-popup-body">
                  {summary.remainingBalance > 0 && (
                    <div className="rental-quick-fill-row">
                      <span className="rental-quick-fill-label">Quick Presets:</span>
                      <button
                        type="button"
                        className="rental-quick-btn"
                        onClick={() => setPaymentAmount(summary.remainingBalance.toString())}
                      >
                        Full Balance (रु {summary.remainingBalance.toLocaleString()})
                      </button>
                      <button
                        type="button"
                        className="rental-quick-btn"
                        onClick={() =>
                          setPaymentAmount(Math.round(summary.remainingBalance / 2).toString())
                        }
                      >
                        50% (रु {Math.round(summary.remainingBalance / 2).toLocaleString()})
                      </button>
                    </div>
                  )}

                  <div className="rental-form-group">
                    <label className="rental-form-label">
                      Payment Amount (रु) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="rental-form-control"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Payment Mode</label>
                    <select
                      className="rental-form-control"
                      value={paymentMode}
                      onChange={(e) =>
                        setPaymentMode(
                          e.target.value as 'CASH' | 'CARD' | 'QR' | 'BANK' | 'CHEQUE'
                        )
                      }
                    >
                      <option value="CASH">Cash</option>
                      <option value="QR">QR Code</option>
                      <option value="CARD">Card / POS</option>
                      <option value="BANK">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Payment Date</label>
                    <input
                      type="date"
                      className="rental-form-control"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Reference / Bill No. (Optional)</label>
                    <input
                      type="text"
                      className="rental-form-control"
                      placeholder="e.g. REC-10294 or Txn ID"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                    />
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Remarks / Description</label>
                    <input
                      type="text"
                      className="rental-form-control"
                      placeholder="e.g. Weekly installment payment"
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rental-popup-footer">
                  <button
                    type="button"
                    className="rental-btn-cancel"
                    onClick={() => setShowGaveModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rental-btn-submit gave"
                    disabled={isSubmitting}
                    onClick={() => handleSavePayment('GIVEN')}
                  >
                    <i className="bi bi-check-circle"></i>
                    {isSubmitting ? 'Saving...' : 'Record Payment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: You Received (Advance / Deposit) */}
          {showReceivedModal && (
            <div className="rental-popup-overlay" onClick={() => setShowReceivedModal(false)}>
              <div className="rental-popup-card" onClick={(e) => e.stopPropagation()}>
                <div className="rental-popup-header received">
                  <h3>
                    <i className="bi bi-arrow-down-circle"></i>
                    Receive Payment / Advance (You Received)
                  </h3>
                  <button
                    type="button"
                    className="rental-popup-close"
                    onClick={() => setShowReceivedModal(false)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="rental-popup-body">
                  <div className="rental-form-group">
                    <label className="rental-form-label">
                      Received Amount (रु) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="rental-form-control"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Payment Mode</label>
                    <select
                      className="rental-form-control"
                      value={paymentMode}
                      onChange={(e) =>
                        setPaymentMode(
                          e.target.value as 'CASH' | 'CARD' | 'QR' | 'BANK' | 'CHEQUE'
                        )
                      }
                    >
                      <option value="CASH">Cash</option>
                      <option value="QR">QR Code</option>
                      <option value="CARD">Card / POS</option>
                      <option value="BANK">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Date</label>
                    <input
                      type="date"
                      className="rental-form-control"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Reference / Receipt No.</label>
                    <input
                      type="text"
                      className="rental-form-control"
                      placeholder="e.g. ADV-001 or Receipt #"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                    />
                  </div>

                  <div className="rental-form-group">
                    <label className="rental-form-label">Remarks / Description</label>
                    <input
                      type="text"
                      className="rental-form-control"
                      placeholder="e.g. Initial security deposit"
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rental-popup-footer">
                  <button
                    type="button"
                    className="rental-btn-cancel"
                    onClick={() => setShowReceivedModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rental-btn-submit received"
                    disabled={isSubmitting}
                    onClick={() => handleSavePayment('RECEIVED')}
                  >
                    <i className="bi bi-check-circle"></i>
                    {isSubmitting ? 'Saving...' : 'Record Received'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};
