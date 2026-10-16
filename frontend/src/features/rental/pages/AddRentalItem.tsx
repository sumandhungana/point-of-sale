import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addRental } from '@/features/services/rentalItemService';
import { addRentalPayment } from '@/features/services/rentalPaymentService';
import { usePermission } from '@/core/rbac/usePermission';
import '@/styles/AddRentalItem.css';

export const AddRentalItem: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canAddRental = hasPermission('rental:add') || hasPermission('rental:create');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format Date to date string (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    return `${y}-${m}-${d}`;
  };

  // Default dates: Start today, End 7 days from today
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Core Form State
  const [formData, setFormData] = useState({
    rentalItemName: '',
    phoneNumber: '',
    address: '',
    rentalAmount: '',
    rentalPeriod: 'Daily',
    startDate: formatDate(now),
    endDate: formatDate(sevenDaysLater),
    remarks: '',
  });

  // Rental Direction: 'OUT' (I am renting out to customer) or 'IN' (I am renting in from owner/vendor)
  type RentalDirection = 'OUT' | 'IN';
  const [rentalDirection, setRentalDirection] = useState<RentalDirection>('OUT');

  // Pricing Mode: 'TOTAL' (enter full rental amount directly) or 'RATE' (rate per unit * duration)
  const [pricingMode, setPricingMode] = useState<'TOTAL' | 'RATE'>('TOTAL');
  const [unitRate, setUnitRate] = useState<string>('');

  // Advance Payment / Security Deposit at creation
  const [recordAdvance, setRecordAdvance] = useState<boolean>(false);
  const [advanceCategory, setAdvanceCategory] = useState<'RECEIVED' | 'GIVEN'>('RECEIVED');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [advancePaymentType, setAdvancePaymentType] = useState<'CASH' | 'CARD' | 'QR' | 'BANK' | 'CHEQUE'>('CASH');
  const [advanceRef, setAdvanceRef] = useState<string>('');
  const [advanceRemarks, setAdvanceRemarks] = useState<string>('');

  // --------------------------------------------------------------------------
  // Duration & Timeline Analysis
  // --------------------------------------------------------------------------
  const durationAnalysis = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return { isValid: false, totalDays: 0, label: 'Select dates', breakdown: '' };
    }

    const start = new Date(formData.startDate + 'T00:00:00');
    const end = new Date(formData.endDate + 'T00:00:00');

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, totalDays: 0, label: 'Invalid dates', breakdown: '' };
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      return {
        isValid: false,
        totalDays: 0,
        label: 'Return date cannot be before Start date',
        breakdown: '0 days',
      };
    }

    const diffDaysRaw = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const totalDays = Math.max(1, diffDaysRaw === 0 ? 1 : diffDaysRaw);
    const totalWeeks = (totalDays / 7).toFixed(1);
    const totalMonths = (totalDays / 30).toFixed(1);

    let label = `${totalDays} Day${totalDays > 1 ? 's' : ''}`;
    if (diffDaysRaw === 0) {
      label = '1 Day (Same Day)';
    } else if (totalDays === 7) {
      label = '1 Week (7 Days)';
    } else if (totalDays > 7 && totalDays % 7 === 0) {
      label = `${totalDays / 7} Weeks (${totalDays} Days)`;
    } else if (totalDays === 30) {
      label = '1 Month (30 Days)';
    } else if (totalDays > 30) {
      label = `${totalMonths} Months (${totalDays} Days)`;
    } else if (totalDays > 7) {
      label = `${totalDays} Days (~${totalWeeks} wks)`;
    }

    return {
      isValid: true,
      totalDays,
      totalWeeks: parseFloat(totalWeeks),
      totalMonths: parseFloat(totalMonths),
      label,
      breakdown: `${totalDays} Day${totalDays > 1 ? 's' : ''}`,
    };
  }, [formData.startDate, formData.endDate]);

  // --------------------------------------------------------------------------
  // Auto-recalculate rental amount if PricingMode is RATE
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (pricingMode === 'RATE' && durationAnalysis.isValid) {
      const rate = parseFloat(unitRate);
      if (!isNaN(rate) && rate > 0) {
        let calculated = 0;
        if (formData.rentalPeriod === 'Daily') {
          calculated = rate * durationAnalysis.totalDays;
        } else if (formData.rentalPeriod === 'Weekly') {
          calculated = Math.round(rate * (durationAnalysis.totalDays / 7));
        } else if (formData.rentalPeriod === 'Monthly') {
          calculated = Math.round(rate * (durationAnalysis.totalDays / 30));
        } else {
          calculated = rate * durationAnalysis.totalDays;
        }
        setFormData((prev) => ({ ...prev, rentalAmount: String(calculated) }));
      }
    }
  }, [pricingMode, unitRate, formData.rentalPeriod, durationAnalysis.totalDays, durationAnalysis.isValid]);

  // When switching from TOTAL to RATE, prefill unitRate based on current total / duration
  const handlePricingModeToggle = (mode: 'TOTAL' | 'RATE') => {
    setPricingMode(mode);
    if (mode === 'RATE') {
      const total = parseFloat(formData.rentalAmount);
      if (!isNaN(total) && total > 0 && durationAnalysis.totalDays > 0) {
        if (formData.rentalPeriod === 'Daily') {
          setUnitRate(String(Math.round(total / durationAnalysis.totalDays)));
        } else if (formData.rentalPeriod === 'Weekly') {
          setUnitRate(String(Math.round(total / (durationAnalysis.totalDays / 7))));
        } else if (formData.rentalPeriod === 'Monthly') {
          setUnitRate(String(Math.round(total / (durationAnalysis.totalDays / 30))));
        } else {
          setUnitRate(String(Math.round(total / durationAnalysis.totalDays)));
        }
      }
    }
  };

  // --------------------------------------------------------------------------
  // Quick Duration Extension Preset Buttons
  // --------------------------------------------------------------------------
  const applyDurationPreset = (daysToAdd: number) => {
    const start = new Date(formData.startDate + 'T00:00:00');
    const baseTime = isNaN(start.getTime()) ? new Date() : start;
    const newEnd = new Date(baseTime.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    setFormData((prev) => ({
      ...prev,
      endDate: formatDate(newEnd),
    }));
  };

  // Input Change Handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------------------------------
  // Live Financial Breakdown Analysis
  // --------------------------------------------------------------------------
  const financialSummary = useMemo(() => {
    const total = parseFloat(formData.rentalAmount) || 0;
    const advance = recordAdvance ? parseFloat(advanceAmount) || 0 : 0;
    const remainingDue = Math.max(0, total - advance);

    let effectiveDailyRate = 0;
    if (durationAnalysis.isValid && durationAnalysis.totalDays > 0 && total > 0) {
      effectiveDailyRate = Math.round(total / durationAnalysis.totalDays);
    }

    return {
      total,
      advance,
      remainingDue,
      effectiveDailyRate,
      isFullyPaid: total > 0 && advance >= total,
    };
  }, [formData.rentalAmount, recordAdvance, advanceAmount, durationAnalysis]);

  // Status computation for live preview
  const rentalScheduleStatus = useMemo(() => {
    const todayStr = formatDate(new Date());
    if (formData.startDate > todayStr) return { text: 'Scheduled (Future)', class: 'status-scheduled', icon: 'bi-clock-history' };
    if (formData.endDate < todayStr) return { text: 'Completed', class: 'status-completed', icon: 'bi-check2-circle' };
    return { text: 'Active Rental', class: 'status-active', icon: 'bi-play-circle-fill' };
  }, [formData.startDate, formData.endDate]);

  // --------------------------------------------------------------------------
  // Submit Handler
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.rentalItemName.trim()) {
      setError('Please provide a Rental Item Name.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Please enter a valid contact Phone Number.');
      return;
    }
    const parsedAmount = parseFloat(formData.rentalAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Rental Amount must be greater than 0.');
      return;
    }
    if (!durationAnalysis.isValid) {
      setError('Return Date must be on or after Start Date.');
      return;
    }

    const parsedAdvance = recordAdvance ? parseFloat(advanceAmount) : 0;
    if (recordAdvance) {
      if (isNaN(parsedAdvance) || parsedAdvance < 0) {
        setError('Please enter a valid Advance Payment amount.');
        return;
      }
      if (parsedAdvance > parsedAmount) {
        setError('Advance Payment cannot exceed the Total Rental Amount.');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Create Rental Item
      const directionTag = rentalDirection === 'OUT' ? '[Rental Out: Customer]' : '[Rental In: Vendor]';
      const finalRemarks = formData.remarks.trim()
        ? `${directionTag} ${formData.remarks.trim()}`
        : directionTag;

      const response = await addRental({
        rentalItemName: formData.rentalItemName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim() || 'N/A',
        rentalAmount: parsedAmount,
        rentalPeriod: formData.rentalPeriod,
        startDate: new Date(formData.startDate + 'T00:00:00').toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59').toISOString(),
        remarks: finalRemarks,
      });

      const rentalItemId = response?.id;

      // 2. If Advance Payment was requested and created, record it to backend payments table
      if (recordAdvance && parsedAdvance > 0 && rentalItemId) {
        try {
          const defaultRemark = rentalDirection === 'OUT'
            ? 'Initial Advance Received from Customer'
            : 'Initial Advance Paid to Owner/Vendor';

          await addRentalPayment(rentalItemId, {
            amount: parsedAdvance,
            paymentCategory: advanceCategory,
            paymentType: advancePaymentType,
            date: new Date().toISOString(),
            referenceNo: advanceRef.trim() || undefined,
            remarks: advanceRemarks.trim() || defaultRemark,
          });
          toast.success(
            `Rental Item "${formData.rentalItemName}" created with initial advance of रु ${parsedAdvance.toLocaleString()}!`
          );
        } catch (payErr) {
          console.warn('Advance payment recording failed:', payErr);
          toast.warning(
            `Rental created, but recording the initial advance payment failed. You can record it from the Statement page.`
          );
        }
      } else {
        toast.success(`Rental Item "${formData.rentalItemName}" created successfully!`);
      }

      navigate('/rental-items');
    } catch (err) {
      console.error('Error saving rental item:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the rental item.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="add-rental-page-container">
        <Sidebar />
        <div className="add-rental-page-main">
          
          {/* Top Breadcrumb & Actions Bar */}
          <div className="add-rental-top-bar">
            <div className="add-rental-breadcrumb">
              <span className="breadcrumb-link" onClick={() => navigate('/rental-items')}>
                <i className="bi bi-box-seam me-1"></i> Rental Items
              </span>
              <i className="bi bi-chevron-right breadcrumb-separator"></i>
              <span className="breadcrumb-current">New Rental Agreement</span>
            </div>
            <button
              type="button"
              className="add-rental-header-close-btn"
              onClick={() => navigate('/rental-items')}
              aria-label="Back to Rental Items"
              title="Cancel & Back"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div className="add-rental-error-banner" role="alert">
              <i className="bi bi-exclamation-octagon-fill me-2"></i>
              <div>
                <strong>Notice: </strong>
                {error}
              </div>
            </div>
          )}

          {/* Main 2-Column Grid */}
          <div className="add-rental-grid-layout">
            
            {/* Left Column: Comprehensive Form */}
            <div className="add-rental-form-column">
              <form onSubmit={handleSubmit} noValidate>

                {/* Rental Direction / Nature Selector */}
                <div className="rental-direction-card">
                  <div className="rental-direction-header">
                    <span className="rental-direction-label">
                      <i className="bi bi-arrow-left-right me-2 text-primary"></i>
                      Select Rental Transaction Type:
                    </span>
                    <span className="rental-direction-hint">
                      {rentalDirection === 'OUT' ? 'You are renting out to a customer (Income)' : 'You are taking on rent from owner/vendor (Expense)'}
                    </span>
                  </div>
                  <div className="rental-direction-options">
                    <button
                      type="button"
                      className={`direction-option-btn ${rentalDirection === 'OUT' ? 'active-out' : ''}`}
                      onClick={() => {
                        setRentalDirection('OUT');
                        setAdvanceCategory('RECEIVED');
                      }}
                    >
                      <div className="direction-icon out">
                        <i className="bi bi-box-arrow-up-right"></i>
                      </div>
                      <div className="direction-text">
                        <span className="direction-title">Rental Out (To Customer)</span>
                        <span className="direction-desc">I am renting out my item / equipment to a customer</span>
                      </div>
                      {rentalDirection === 'OUT' && <i className="bi bi-check-circle-fill active-check text-primary"></i>}
                    </button>

                    <button
                      type="button"
                      className={`direction-option-btn ${rentalDirection === 'IN' ? 'active-in' : ''}`}
                      onClick={() => {
                        setRentalDirection('IN');
                        setAdvanceCategory('GIVEN');
                      }}
                    >
                      <div className="direction-icon in">
                        <i className="bi bi-box-arrow-in-down-left"></i>
                      </div>
                      <div className="direction-text">
                        <span className="direction-title">Rental In (From Vendor / Owner)</span>
                        <span className="direction-desc">I am the customer renting an item / space from an owner</span>
                      </div>
                      {rentalDirection === 'IN' && <i className="bi bi-check-circle-fill active-check text-primary"></i>}
                    </button>
                  </div>
                </div>
                
                {/* Section 1: Item & Party Details */}
                <div className="add-rental-section-card">
                  <div className="add-rental-section-header">
                    <div className="add-rental-section-badge">1</div>
                    <div>
                      <h3 className="add-rental-section-title">
                        {rentalDirection === 'OUT' ? 'Rental Item & Customer Information' : 'Rental Item & Owner / Vendor Information'}
                      </h3>
                      <p className="add-rental-section-subtitle">
                        {rentalDirection === 'OUT'
                          ? 'Item details, customer contact, and delivery location'
                          : 'Item / property details, owner / vendor contact, and pickup location'}
                      </p>
                    </div>
                  </div>

                  <div className="add-rental-fields-grid">
                    <div className="add-rental-field-group full-width">
                      <label className="add-rental-field-label">
                        <i className="bi bi-box-seam me-1 text-primary"></i>
                        {rentalDirection === 'OUT' ? 'Rental Item Name' : 'Rental Item / Space / Equipment Name'} <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        name="rentalItemName"
                        value={formData.rentalItemName}
                        onChange={handleInputChange}
                        className="add-rental-input"
                        placeholder={
                          rentalDirection === 'OUT'
                            ? 'e.g., Sony FX3 Cinema Camera / Scaffolding 50ft / 5kVA Generator'
                            : 'e.g., Shop Shutter #4 / Delivery Van / Construction Crane'
                        }
                        required
                        autoFocus
                      />
                    </div>

                    <div className="add-rental-field-group">
                      <label className="add-rental-field-label">
                        <i className="bi bi-telephone me-1 text-primary"></i>
                        {rentalDirection === 'OUT' ? 'Customer Phone' : 'Owner / Vendor Phone'} <span className="required-star">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="add-rental-input"
                        placeholder="e.g., 98XXXXXXXX"
                        required
                      />
                    </div>

                    <div className="add-rental-field-group">
                      <label className="add-rental-field-label">
                        <i className="bi bi-geo-alt me-1 text-primary"></i>
                        {rentalDirection === 'OUT' ? 'Customer / Delivery Address' : 'Owner / Property Address'}
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="add-rental-input"
                        placeholder="e.g., Putalisadak, Kathmandu"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Duration, Schedule & Timeline */}
                <div className="add-rental-section-card">
                  <div className="add-rental-section-header">
                    <div className="add-rental-section-badge">2</div>
                    <div>
                      <h3 className="add-rental-section-title">Schedule & Rental Duration</h3>
                      <p className="add-rental-section-subtitle">Set rental period type, start date, and return time</p>
                    </div>
                  </div>

                  <div className="add-rental-fields-grid">
                    <div className="add-rental-field-group">
                      <label className="add-rental-field-label">
                        <i className="bi bi-calendar-range me-1 text-primary"></i>
                        Billing Period Type <span className="required-star">*</span>
                      </label>
                      <select
                        name="rentalPeriod"
                        value={formData.rentalPeriod}
                        onChange={handleInputChange}
                        className="add-rental-select"
                        required
                      >
                        <option value="Daily">Daily Basis (per day)</option>
                        <option value="Weekly">Weekly Basis (per week)</option>
                        <option value="Monthly">Monthly Basis (per month)</option>
                        <option value="Hourly">Hourly / Custom</option>
                      </select>
                    </div>

                    {/* Duration Badge Pill */}
                    <div className="add-rental-field-group duration-badge-wrapper">
                      <label className="add-rental-field-label">
                        <i className="bi bi-stopwatch me-1 text-primary"></i>
                        Calculated Duration
                      </label>
                      <div className={`duration-pill ${durationAnalysis.isValid ? 'valid' : 'invalid'}`}>
                        <i className={`bi ${durationAnalysis.isValid ? 'bi-calendar-check-fill' : 'bi-exclamation-triangle-fill'} me-1`}></i>
                        <span>{durationAnalysis.label}</span>
                      </div>
                    </div>

                    <div className="add-rental-field-group">
                      <label className="add-rental-field-label">
                        <i className="bi bi-calendar-plus me-1 text-primary"></i>
                        Start Date <span className="required-star">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="add-rental-input"
                        required
                      />
                    </div>

                    <div className="add-rental-field-group">
                      <label className="add-rental-field-label">
                        <i className="bi bi-calendar-check me-1 text-primary"></i>
                        Return / End Date <span className="required-star">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={`add-rental-input ${!durationAnalysis.isValid ? 'input-error' : ''}`}
                        required
                      />
                    </div>
                  </div>

                  {/* Quick Extension Presets */}
                  <div className="add-rental-presets-row">
                    <span className="presets-label">
                      <i className="bi bi-lightning-charge me-1"></i> Quick Presets:
                    </span>
                    <div className="presets-buttons">
                      <button type="button" className="preset-pill-btn" onClick={() => applyDurationPreset(1)}>+1 Day</button>
                      <button type="button" className="preset-pill-btn" onClick={() => applyDurationPreset(3)}>+3 Days</button>
                      <button type="button" className="preset-pill-btn" onClick={() => applyDurationPreset(7)}>+1 Week</button>
                      <button type="button" className="preset-pill-btn" onClick={() => applyDurationPreset(14)}>+2 Weeks</button>
                      <button type="button" className="preset-pill-btn" onClick={() => applyDurationPreset(30)}>+1 Month</button>
                      <button type="button" className="preset-pill-btn" onClick={() => applyDurationPreset(90)}>+3 Months</button>
                    </div>
                  </div>
                </div>

                {/* Section 3: Smart Rental Amount & Pricing Analysis */}
                <div className="add-rental-section-card">
                  <div className="add-rental-section-header">
                    <div className="add-rental-section-badge">3</div>
                    <div>
                      <h3 className="add-rental-section-title">Rental Amount & Pricing Analysis</h3>
                      <p className="add-rental-section-subtitle">Choose fixed total or calculate automatically from rate per unit</p>
                    </div>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="pricing-mode-segmented">
                    <button
                      type="button"
                      className={`pricing-mode-btn ${pricingMode === 'TOTAL' ? 'active' : ''}`}
                      onClick={() => handlePricingModeToggle('TOTAL')}
                    >
                      <i className="bi bi-cash me-1"></i> Fixed Total Amount
                    </button>
                    <button
                      type="button"
                      className={`pricing-mode-btn ${pricingMode === 'RATE' ? 'active' : ''}`}
                      onClick={() => handlePricingModeToggle('RATE')}
                    >
                      <i className="bi bi-calculator me-1"></i> Calculate by Rate (Rate × Duration)
                    </button>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="add-rental-fields-grid mt-3">
                    {pricingMode === 'RATE' && (
                      <div className="add-rental-field-group">
                        <label className="add-rental-field-label">
                          <i className="bi bi-tag me-1 text-primary"></i>
                          Rate per {formData.rentalPeriod === 'Monthly' ? 'Month' : formData.rentalPeriod === 'Weekly' ? 'Week' : 'Day'} (रु)
                        </label>
                        <div className="input-with-prefix">
                          <span className="input-currency-prefix">रु</span>
                          <input
                            type="number"
                            value={unitRate}
                            onChange={(e) => setUnitRate(e.target.value)}
                            className="add-rental-input with-prefix"
                            placeholder="e.g., 1000"
                            min="0"
                            step="any"
                          />
                        </div>
                        <span className="field-hint">
                          {durationAnalysis.totalDays} day{durationAnalysis.totalDays > 1 ? 's' : ''} × रु {unitRate || '0'} = <strong>रु {(parseFloat(formData.rentalAmount) || 0).toLocaleString()}</strong>
                        </span>
                      </div>
                    )}

                    <div className="add-rental-field-group">
                      <label className="add-rental-field-label">
                        <i className="bi bi-cash-stack me-1 text-primary"></i>
                        Total Rental Amount (रु) <span className="required-star">*</span>
                      </label>
                      <div className="input-with-prefix">
                        <span className="input-currency-prefix">रु</span>
                        <input
                          type="number"
                          name="rentalAmount"
                          value={formData.rentalAmount}
                          onChange={handleInputChange}
                          className="add-rental-input with-prefix"
                          placeholder="e.g., 7000"
                          required
                          min="0.01"
                          step="0.01"
                          readOnly={pricingMode === 'RATE'}
                        />
                      </div>
                      {financialSummary.effectiveDailyRate > 0 && (
                        <span className="field-hint text-success">
                          <i className="bi bi-info-circle me-1"></i>
                          Effective rate: ~रु {financialSummary.effectiveDailyRate.toLocaleString()} / day for {durationAnalysis.totalDays} days
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 4: Advance Payment / Security Deposit (Optional Toggle) */}
                <div className="add-rental-section-card">
                  <div className="add-rental-section-header">
                    <div className="add-rental-section-badge">4</div>
                    <div className="advance-toggle-header-content">
                      <div>
                        <h3 className="add-rental-section-title">Advance / Security Deposit</h3>
                        <p className="add-rental-section-subtitle">
                          {rentalDirection === 'OUT'
                            ? 'Record advance deposit received from customer'
                            : 'Record advance deposit paid to owner / vendor'}
                        </p>
                      </div>
                      <label className="modern-switch" title="Toggle Advance Payment">
                        <input
                          type="checkbox"
                          checked={recordAdvance}
                          onChange={(e) => setRecordAdvance(e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>

                  {recordAdvance && (
                    <div className="advance-fields-wrapper mt-3 animate-fade-in">
                      
                      {/* Flow Direction Selector (Received vs Given) */}
                      <div className="advance-flow-selector mb-3">
                        <span className="field-hint mb-1 d-block font-weight-bold">
                          <strong>Accounting Direction:</strong>
                        </span>
                        <div className="advance-flow-buttons">
                          <button
                            type="button"
                            className={`flow-btn received ${advanceCategory === 'RECEIVED' ? 'active' : ''}`}
                            onClick={() => setAdvanceCategory('RECEIVED')}
                          >
                            <i className="bi bi-arrow-down-left-circle me-1"></i>
                            You Received (Money In / Customer Paid)
                          </button>
                          <button
                            type="button"
                            className={`flow-btn given ${advanceCategory === 'GIVEN' ? 'active' : ''}`}
                            onClick={() => setAdvanceCategory('GIVEN')}
                          >
                            <i className="bi bi-arrow-up-right-circle me-1"></i>
                            You Gave (Money Out / Paid to Owner)
                          </button>
                        </div>
                      </div>

                      <div className="add-rental-fields-grid">
                        <div className="add-rental-field-group">
                          <label className="add-rental-field-label">
                            <i className={`bi ${advanceCategory === 'RECEIVED' ? 'bi-arrow-down-circle text-success' : 'bi-arrow-up-circle text-danger'} me-1`}></i>
                            {advanceCategory === 'RECEIVED' ? 'Advance Amount Received (रु)' : 'Advance Amount Paid (रु)'} <span className="required-star">*</span>
                          </label>
                          <div className="input-with-prefix">
                            <span className="input-currency-prefix">रु</span>
                            <input
                              type="number"
                              value={advanceAmount}
                              onChange={(e) => setAdvanceAmount(e.target.value)}
                              className="add-rental-input with-prefix"
                              placeholder="e.g., 2000"
                              min="0"
                              step="0.01"
                              required={recordAdvance}
                            />
                          </div>
                        </div>

                        <div className="add-rental-field-group">
                          <label className="add-rental-field-label">
                            <i className="bi bi-credit-card me-1 text-primary"></i>
                            Payment Mode
                          </label>
                          <select
                            value={advancePaymentType}
                            onChange={(e) => setAdvancePaymentType(e.target.value as any)}
                            className="add-rental-select"
                          >
                            <option value="CASH">💵 Cash</option>
                            <option value="QR">📱 QR / Fonepay / eSewa</option>
                            <option value="CARD">💳 Debit / Credit Card</option>
                            <option value="BANK">🏦 Bank Transfer</option>
                            <option value="CHEQUE">📝 Cheque</option>
                          </select>
                        </div>

                        <div className="add-rental-field-group">
                          <label className="add-rental-field-label">
                            <i className="bi bi-hash me-1 text-primary"></i>
                            Transaction / Slip Reference No
                          </label>
                          <input
                            type="text"
                            value={advanceRef}
                            onChange={(e) => setAdvanceRef(e.target.value)}
                            className="add-rental-input"
                            placeholder="e.g., QR-TXN-87612"
                          />
                        </div>

                        <div className="add-rental-field-group">
                          <label className="add-rental-field-label">
                            <i className="bi bi-journal-text me-1 text-primary"></i>
                            Payment Note
                          </label>
                          <input
                            type="text"
                            value={advanceRemarks}
                            onChange={(e) => setAdvanceRemarks(e.target.value)}
                            className="add-rental-input"
                            placeholder="e.g., Advance deposit paid at pickup"
                          />
                        </div>
                      </div>

                      {/* Advance Summary Pill */}
                      <div className="advance-balance-pill">
                        <div>
                          <span>Advance Paid: </span>
                          <strong className="text-success">रु {financialSummary.advance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="divider-dot">•</div>
                        <div>
                          <span>Remaining Balance Due: </span>
                          <strong className={financialSummary.remainingDue > 0 ? 'text-danger' : 'text-success'}>
                            रु {financialSummary.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Remarks / Terms */}
                <div className="add-rental-section-card">
                  <div className="add-rental-section-header">
                    <div className="add-rental-section-badge">5</div>
                    <div>
                      <h3 className="add-rental-section-title">Remarks & Terms</h3>
                      <p className="add-rental-section-subtitle">Special condition notes, accessories included, or instructions</p>
                    </div>
                  </div>

                  <div className="add-rental-fields-grid">
                    <div className="add-rental-field-group full-width">
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        className="add-rental-textarea"
                        placeholder="e.g., Condition good, includes battery & charger, customer provided citizenship copy"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Sticky Form Action Footer */}
                <div className="add-rental-form-actions">
                  <button
                    type="button"
                    className="add-rental-btn-cancel"
                    onClick={() => navigate('/rental-items')}
                  >
                    <i className="bi bi-arrow-left me-1"></i> Cancel
                  </button>
                  <button
                    type="submit"
                    className="add-rental-btn-submit"
                    disabled={loading || !durationAnalysis.isValid || !canAddRental}
                    title={!canAddRental ? 'You do not have permission to add rental agreements' : undefined}
                  >
                    {loading ? (
                      <>
                        <i className="bi bi-arrow-repeat spin me-2"></i> Saving Agreement...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill me-2"></i> Save Rental Agreement
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column: Live Agreement & Financial Summary Preview Card */}
            <div className="add-rental-preview-column">
              <div className="add-rental-preview-sticky-card">
                
                <div className="preview-card-header">
                  <div className="preview-header-badge">
                    <i className="bi bi-file-earmark-text-fill me-1"></i> Live Summary Preview
                  </div>
                  <span className={`preview-status-pill ${rentalScheduleStatus.class}`}>
                    <i className={`bi ${rentalScheduleStatus.icon} me-1`}></i>
                    {rentalScheduleStatus.text}
                  </span>
                </div>

                {/* Item Details Preview */}
                <div className="preview-item-hero">
                  <div className="preview-item-icon">
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <div className="preview-item-content">
                    <h4 className="preview-item-name">
                      {formData.rentalItemName || 'Rental Item Name'}
                    </h4>
                    <p className="preview-customer-phone">
                      <i className="bi bi-telephone me-1 text-primary"></i>
                      {formData.phoneNumber || 'Contact Number'}
                    </p>
                    {formData.address && (
                      <p className="preview-address">
                        <i className="bi bi-geo-alt me-1 text-muted"></i>
                        {formData.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline Box */}
                <div className="preview-timeline-box">
                  <div className="timeline-node">
                    <span className="timeline-label">Start Date</span>
                    <span className="timeline-val">
                      {formData.startDate ? new Date(formData.startDate + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' }) : '-'}
                    </span>
                  </div>
                  <div className="timeline-arrow">
                    <i className="bi bi-arrow-right"></i>
                    <span className="timeline-duration-tag">{durationAnalysis.label}</span>
                  </div>
                  <div className="timeline-node text-end">
                    <span className="timeline-label">Return Date</span>
                    <span className="timeline-val">
                      {formData.endDate ? new Date(formData.endDate + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' }) : '-'}
                    </span>
                  </div>
                </div>

                {/* Financial Summary Card Box */}
                <div className="preview-financials-box">
                  <div className="financial-row">
                    <span className="financial-label">
                      <i className="bi bi-cash me-1 text-primary"></i> Total Rental Fee:
                    </span>
                    <span className="financial-value total">
                      रु {financialSummary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {recordAdvance && financialSummary.advance > 0 && (
                    <div className="financial-row advance-row">
                      <span className="financial-label">
                        <i className={`bi ${advanceCategory === 'RECEIVED' ? 'bi-check-circle text-success' : 'bi-arrow-up-circle text-danger'} me-1`}></i>
                        {advanceCategory === 'RECEIVED' ? 'Advance Received:' : 'Advance Paid:'}
                      </span>
                      <span className={`financial-value ${advanceCategory === 'RECEIVED' ? 'text-success' : 'text-danger'}`}>
                        - रु {financialSummary.advance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="financial-divider"></div>

                  <div className="financial-row balance-row">
                    <span className="financial-label-bold">Balance Due:</span>
                    <span className={`financial-value-bold ${financialSummary.remainingDue > 0 ? 'text-danger' : 'text-success'}`}>
                      रु {financialSummary.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {financialSummary.isFullyPaid && (
                    <div className="settled-alert">
                      <i className="bi bi-patch-check-fill me-1"></i> Fully Settled Upfront
                    </div>
                  )}
                </div>

                {/* Remarks preview if present */}
                {formData.remarks && (
                  <div className="preview-remarks-box">
                    <span className="preview-remarks-title">Notes / Instructions:</span>
                    <p className="preview-remarks-text">{formData.remarks}</p>
                  </div>
                )}

                {/* Help Tips */}
                <div className="preview-help-box">
                  <div className="help-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div className="help-text">
                    <strong>Automatic Statement Sync:</strong> Once saved, this item appears in your Rental Items list with live paid & remaining balance tracking.
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
  );
};