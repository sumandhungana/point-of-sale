import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { billsConfig } from '@/config/bills';
import {AddPurchaseBillRequest, savePurchase, fetchPurchaseBillNumber} from '../../services/purchaseBillService'
import { getSuppliers } from '@/features/services/supplierService';
import '../../../styles/AddPurchase.css';
import '../../../styles/AddSalesBill.css';
import { Item, getProduct } from '../../services/productService';

interface Supplier {
  id: number;
  name: string;
  phone?: string;
}

interface PurchaseLineItem {
  itemId: number;
  name: string;
  categoryName: string;
  quantity: number | '';
  enteredAmount: number | '';
  unitPrice: number;
  taxAmount: number;
  vatAmount: number;
  totalPrice: number;
}



export const AddPurchase: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.purchase;
  const isEditMode = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Master Data
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Form State
  const [purchaseNo, setPurchaseNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [remarks, setRemarks] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Global Calculation Settings (Applies to New Products)
  const [pricingMode, setPricingMode] = useState<'unit' | 'gross'>('unit');
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [enableTax, setEnableTax] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState<number | ''>('');
  const [enableVat, setEnableVat] = useState(true);
  const [vatPercentage, setVatPercentage] = useState<number | ''>(13);

  // Supplier Search Dropdown
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Item Search & Purchase Basket
  const [itemSearch, setItemSearch] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsData, suppliersData] = await Promise.all([
          getProduct(),
          getSuppliers().catch(() => []),
        ]);

        setItems(itemsData?.items || []);
        setSuppliers(suppliersData || []);

        if (isEditMode && initialData) {
          setPurchaseNo(initialData.purchaseNo || initialData.billNumber);
          setDate(initialData.date || initialData.billDate || new Date().toISOString().split('T')[0]);
          setPaymentMode(initialData.paymentMode || 'cash');
          setRemarks(initialData.remarks || '');
          if (initialData.supplier) {
            setSelectedSupplier(initialData.supplier);
            setSupplierSearch(initialData.supplier.name);
          }
          if (initialData.items) {
            setLineItems(
                initialData.items.map((i: any) => ({
                  ...i,
                  quantity: i.quantity ?? 1,
                  enteredAmount: i.enteredAmount ?? '',
                }))
            );
          }
          if (initialData.photoPath) {
            setSelectedImage(initialData.photoPath);
          }
        } else {
          const prefix = billsConfig?.purchase?.prefix || 'PB-';
          const padding = billsConfig?.purchase?.padding || 4;
          const billData = await fetchPurchaseBillNumber();
          const lastNo = billData?.purchaseNo ?? '0';

// Extract numeric portion, increment by 1, and pad with leading zeros
          const numericPart = parseInt(lastNo.replace(/[^0-9]/g, '') || '0', 10) + 1;
          const newPurchaseNo = `${prefix}${numericPart.toString().padStart(padding, '0')}`;

          setPurchaseNo(newPurchaseNo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize purchase form');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, initialData]);

  // Core Pricing & Tax Calculation Logic
  const computeLineItem = (quantity: number | '', enteredAmount: number | '') => {
    const qty = typeof quantity === 'number' ? Math.max(1, quantity) : 1;
    const amt = typeof enteredAmount === 'number' ? Math.max(0, enteredAmount) : 0;

    const activeTaxPct = enableTax && typeof taxPercentage === 'number' ? Math.max(0, taxPercentage) : 0;
    const activeVatPct = enableVat && typeof vatPercentage === 'number' ? Math.max(0, vatPercentage) : 0;
    const combinedRate = (activeTaxPct + activeVatPct) / 100;

    let subtotal = 0;
    let taxAmount = 0;
    let vatAmount = 0;
    let totalPrice = 0;
    let baseUnitPrice = 0;

    if (enteredAmount === '') {
      return { unitPrice: 0, taxAmount: 0, vatAmount: 0, totalPrice: 0 };
    }

    if (pricingMode === 'gross') {
      if (isTaxInclusive) {
        totalPrice = amt;
        const baseGross = amt / (1 + combinedRate);
        taxAmount = baseGross * (activeTaxPct / 100);
        vatAmount = baseGross * (activeVatPct / 100);
        subtotal = baseGross;
      } else {
        subtotal = amt;
        taxAmount = subtotal * (activeTaxPct / 100);
        vatAmount = (subtotal + taxAmount) * (activeVatPct / 100);
        totalPrice = subtotal + taxAmount + vatAmount;
      }
      baseUnitPrice = subtotal / qty;
    } else {
      if (isTaxInclusive) {
        const unitBase = amt / (1 + combinedRate);
        baseUnitPrice = unitBase;
        subtotal = unitBase * qty;
        taxAmount = subtotal * (activeTaxPct / 100);
        vatAmount = subtotal * (activeVatPct / 100);
        totalPrice = amt * qty;
      } else {
        baseUnitPrice = amt;
        subtotal = amt * qty;
        taxAmount = subtotal * (activeTaxPct / 100);
        vatAmount = (subtotal + taxAmount) * (activeVatPct / 100);
        totalPrice = subtotal + taxAmount + vatAmount;
      }
    }

    return {
      unitPrice: Number(baseUnitPrice.toFixed(4)),
      taxAmount: Number(taxAmount.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  };

  const handleSelectItem = (item: Item) => {
    setShowItemDropdown(false);
    setItemSearch('');

    const existingIndex = lineItems.findIndex((li) => li.itemId === item.id);
    if (existingIndex > -1) return;

    const computed = computeLineItem(1, '');

    const newItem: PurchaseLineItem = {
      itemId: item.id,
      name: item.name,
      categoryName: item.category?.name || 'General',
      quantity: 1,
      enteredAmount: '',
      ...computed,
    };

    setLineItems((prev) => [...prev, newItem]);
  };

  const handleUpdateLineItem = (index: number, field: keyof PurchaseLineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      const computed = computeLineItem(item.quantity, item.enteredAmount);
      updated[index] = { ...item, ...computed };
      return updated;
    });
  };

  // Whenever global calculation settings change, re-compute all table rows
  useEffect(() => {
    setLineItems((prev) =>
        prev.map((item) => ({
          ...item,
          ...computeLineItem(item.quantity, item.enteredAmount),
        }))
    );
  }, [pricingMode, isTaxInclusive, enableTax, taxPercentage, enableVat, vatPercentage]);

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [lineItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      setError('Please add at least one item to save the purchase bill.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Map all line items to the request payload structure
      const payload: AddPurchaseBillRequest = {
        purchaseNo: purchaseNo,
        purchaseDate: date,
        paymentMode: paymentMode,
        supplierId: selectedSupplier?.id,
        remarks: remarks,
        photoPath: selectedImage || undefined,
        items: lineItems.map((item) => ({
          productId: item.itemId,
          itemCount: typeof item.quantity === 'number' ? item.quantity : 1,
          perUnitPurchasePrice: item.unitPrice,
        })),
      };

      await savePurchase(payload, isEditMode, initialData?.id);
      navigate('/bills/purchase');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the purchase bill.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter((sup) =>
      sup.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
      <div className="invoice-layout-root">
        <Sidebar />
        <div className="invoice-page-wrapper">
          <div className="purchase-navbar-spacer">
            <Navbar />
          </div>

          <div className="invoice-container">
            {error && (
                <div className="purchase-alert-danger d-flex align-items-center mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="purchase-grid-main">
              {/* Left Column: Form Info, Global Tax/Mode Settings, Product Search & Table */}
              <div className="purchase-column-left">
                {/* Invoice Info Card */}
                <div className="purchase-card mb-3">
                  <h3 className="purchase-card-title">
                    <i className="bi bi-receipt"></i> Invoice Information
                  </h3>
                  <div className="purchase-form-grid">
                    <div className="input-field-group">
                      <label>Purchase No.</label>
                      <div className="input-with-icon">
                        <i className="bi bi-hash"></i>
                        <input type="text" className="read-only-input" value={purchaseNo} readOnly disabled />
                      </div>
                    </div>

                    <div className="input-field-group">
                      <label>Purchase Date</label>
                      <div className="input-with-icon">
                        <i className="bi bi-calendar3"></i>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                      </div>
                    </div>

                    <div className="input-field-group">
                      <label>Supplier / Vendor</label>
                      <div className="autocomplete-wrapper">
                        <div className="input-with-icon">
                          <i className="bi bi-truck"></i>
                          <input
                              type="text"
                              placeholder="Search supplier..."
                              value={supplierSearch}
                              onChange={(e) => {
                                setSupplierSearch(e.target.value);
                                setShowSupplierDropdown(true);
                                setSelectedSupplier(null);
                              }}
                              onFocus={() => setShowSupplierDropdown(true)}
                          />
                        </div>
                        {showSupplierDropdown && supplierSearch && (
                            <div className="autocomplete-dropdown">
                              {filteredSuppliers.length > 0 ? (
                                  filteredSuppliers.map((sup) => (
                                      <div
                                          key={sup.id}
                                          className="autocomplete-item"
                                          onClick={() => {
                                            setSelectedSupplier(sup);
                                            setSupplierSearch(sup.name);
                                            setShowSupplierDropdown(false);
                                          }}
                                      >
                                        <span className="item-title">{sup.name}</span>
                                        {sup.phone && <span className="item-badge">{sup.phone}</span>}
                                      </div>
                                  ))
                              ) : (
                                  <div className="autocomplete-empty">
                                    No supplier found.{' '}
                                    <span
                                        style={{ color: '#255dce', cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => navigate('/suppliers/add')}
                                    >
                                Add new
                              </span>
                                  </div>
                              )}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Settings Card: Pricing Mode & Tax/VAT Options */}
                <div className="purchase-card mb-3">
                  <h3 className="purchase-card-title mb-2">
                    <i className="bi bi-sliders"></i> Tax & Pricing Settings
                  </h3>
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small fw-bold">Mode:</span>
                      <div className="toggle-btn-group">
                        <button
                            type="button"
                            className={`toggle-pill ${pricingMode === 'unit' ? 'active' : ''}`}
                            onClick={() => setPricingMode('unit')}
                        >
                          Per Unit
                        </button>
                        <button
                            type="button"
                            className={`toggle-pill ${pricingMode === 'gross' ? 'active' : ''}`}
                            onClick={() => setPricingMode('gross')}
                        >
                          Gross
                        </button>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small fw-bold">Tax Status:</span>
                      <button
                          type="button"
                          className={`toggle-inc-badge ${isTaxInclusive ? 'inc' : 'exc'}`}
                          style={{ padding: '4px 10px' }}
                          onClick={() => setIsTaxInclusive(!isTaxInclusive)}
                      >
                        {isTaxInclusive ? 'Tax Included' : '+ Tax Extra'}
                      </button>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      <button
                          type="button"
                          className={`badge-toggle ${enableTax ? 'active' : ''}`}
                          onClick={() => setEnableTax(!enableTax)}
                      >
                        TAX
                      </button>
                      {enableTax && (
                          <input
                              type="number"
                              min="0"
                              className="table-input input-compact"
                              style={{ width: '65px' }}
                              placeholder="%"
                              value={taxPercentage === '' ? '' : taxPercentage}
                              onChange={(e) => setTaxPercentage(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                          />
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      <button
                          type="button"
                          className={`badge-toggle ${enableVat ? 'active' : ''}`}
                          onClick={() => setEnableVat(!enableVat)}
                      >
                        VAT
                      </button>
                      {enableVat && (
                          <input
                              type="number"
                              min="0"
                              className="table-input input-compact"
                              style={{ width: '65px' }}
                              placeholder="%"
                              value={vatPercentage === '' ? '' : vatPercentage}
                              onChange={(e) => setVatPercentage(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                          />
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Search Card */}
                <div className="purchase-card mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="purchase-card-title mb-0">
                      <i className="bi bi-box-seam"></i> Select Products
                    </h3>
                    <button
                        type="button"
                        className="btn-outline-primary btn-sm"
                        onClick={() => navigate('/inventory/products/add')}
                    >
                      <i className="bi bi-plus-lg"></i> New Product
                    </button>
                  </div>

                  <div className="autocomplete-wrapper">
                    <div className="input-with-icon">
                      <i className="bi bi-search"></i>
                      <input
                          type="text"
                          placeholder="Search product by name or SKU..."
                          value={itemSearch}
                          onChange={(e) => {
                            setItemSearch(e.target.value);
                            setShowItemDropdown(true);
                          }}
                          onFocus={() => setShowItemDropdown(true)}
                      />
                    </div>
                    {showItemDropdown && itemSearch && (
                        <div className="autocomplete-dropdown">
                          {filteredItems.length > 0 ? (
                              filteredItems.map((item) => (
                                  <div
                                      key={item.id}
                                      className="autocomplete-item-row"
                                      onClick={() => handleSelectItem(item)}
                                  >
                                    <div>
                                      <span className="item-title">{item.name}</span>
                                      <span className="item-badge ms-2">{item.category?.name || 'General'}</span>
                                    </div>
                                    <span className="item-price">Rs. {item.perUnitPurchasePrice || 0}</span>
                                  </div>
                              ))
                          ) : (
                              <div className="autocomplete-empty">No product matches query.</div>
                          )}
                        </div>
                    )}
                  </div>
                </div>

                {/* Simplified Items Table */}
                <div className="purchase-card no-padding">
                  <div className="responsive-table-wrapper">
                    <table className="purchase-table">
                      <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Product</th>
                        <th style={{ width: '15%' }}>Qty</th>
                        <th style={{ width: '25%' }}>Amount (Rs)</th>
                        <th style={{ width: '16%' }} className="text-end">Total</th>
                        <th style={{ width: '4%' }}></th>
                      </tr>
                      </thead>
                      <tbody>
                      {lineItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="table-empty-state">
                              No items added yet. Search products above to populate line items.
                            </td>
                          </tr>
                      ) : (
                          lineItems.map((item, idx) => (
                              <tr key={item.itemId}>
                                <td>
                                  <div className="table-item-name">{item.name}</div>
                                  <span className="stock-pill">{item.categoryName}</span>
                                </td>

                                <td>
                                  <input
                                      type="number"
                                      min="1"
                                      className="table-input"
                                      value={item.quantity === '' ? '' : item.quantity}
                                      onChange={(e) =>
                                          handleUpdateLineItem(
                                              idx,
                                              'quantity',
                                              e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1)
                                          )
                                      }
                                  />
                                </td>

                                <td>
                                  <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      className="table-input"
                                      placeholder={pricingMode === 'unit' ? 'Unit Price' : 'Gross Total'}
                                      value={item.enteredAmount === '' ? '' : item.enteredAmount}
                                      onChange={(e) =>
                                          handleUpdateLineItem(
                                              idx,
                                              'enteredAmount',
                                              e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                                          )
                                      }
                                  />
                                </td>

                                <td className="text-end fw-bold" style={{ color: '#255dce' }}>
                                  Rs. {item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>

                                <td className="text-center">
                                  <button
                                      type="button"
                                      className="btn-icon-danger"
                                      onClick={() => handleRemoveLineItem(idx)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                          ))
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Summary & Payment Details */}
              <div className="purchase-column-right" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start' }}>
                <div className="purchase-card summary-card mb-3">
                  <div className="summary-label">Total Amount Payable</div>
                  <div className="summary-price-display">
                    Rs. {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="summary-breakdown">
                    <div className="breakdown-row">
                      <span>Line Items Count</span>
                      <span>{lineItems.length}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Currency</span>
                      <span>NPR (Rs.)</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-card">
                  <h3 className="purchase-card-title">
                    <i className="bi bi-credit-card"></i> Payment Details
                  </h3>

                  <div className="input-field-group mb-3">
                    <label>Payment Mode</label>
                    <div className="input-with-icon">
                      <i className="bi bi-wallet2"></i>
                      <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                        <option value="cash">Cash</option>
                        <option value="card">Card / POS</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">Digital Wallet / UPI</option>
                        <option value="credit">Credit / Payable</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-field-group mb-3">
                    <label>Remarks / Notes</label>
                    <textarea
                        rows={3}
                        className="purchase-textarea"
                        placeholder="Context or bill notes..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="input-field-group mb-3">
                    <label>Bill Attachment</label>
                    <input type="file" accept="image/*" className="table-input" onChange={handleFileChange} />
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Bill Document Preview"
                            style={{ maxHeight: '100px', objectFit: 'contain', marginTop: '8px', borderRadius: '6px' }}
                        />
                    )}
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button type="button" className="btn-secondary w-50" onClick={() => navigate(-1)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary w-50" disabled={loading}>
                      {loading ? 'Saving...' : isEditMode ? 'Update Purchase' : 'Save Purchase'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};