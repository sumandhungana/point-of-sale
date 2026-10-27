import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { salesConfig } from '@/config/sales';
import { Customer, getCustomers } from '../../services/customerService';
import { fetchBillNumber, addSalesBill } from '@/features/services/salesBillService';
import { Item, getProduct } from '../../services/productService';
import { useAppSettings } from '@/context/AppSettingsContext';
import '../../../styles/AddPurchase.css';
import '../../../styles/AddSalesBill.css';

interface BillItem {
  itemId: number;
  name: string;
  sku?: string;
  unit: string;
  stockUnit?: string;
  availableStock: number;
  quantity: number | string;
  unitPrice: number | string;
  taxPercentage: number;
  vatPercentage: number;
  taxAmount: number;
  vatAmount: number;
  totalPrice: number;
}

// Available quantity unit options for dropdown
const QUANTITY_UNITS = [
  { value: 'pcs', label: 'Pcs (Pieces)' },
  { value: 'kg', label: 'kg (Kilograms)' },
  { value: 'g', label: 'g (Grams)' },
  { value: 'l', label: 'L (Liters)' },
  { value: 'ml', label: 'ml (Milliliters)' },
  { value: 'box', label: 'Box' },
  { value: 'packet', label: 'Packet' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'meter', label: 'Meter' },
  { value: 'bag', label: 'Bag' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'carton', label: 'Carton' },
  { value: 'roll', label: 'Roll' },
  { value: 'set', label: 'Set' },
  { value: 'pair', label: 'Pair' },
  { value: 'sq.ft', label: 'Sq. Ft' },
  { value: 'other', label: 'Other...' },
];

interface SalesBill {
  id: number;
  billNumber: string;
  billDate: string;
  amount: number;
  paymentMode: string;
  remarks: string | null;
  photoPath: string | null;
  customer?: Customer | null;
  items?: BillItem[];
}

export const AddSalesBill: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatNumber } = useAppSettings();
  const initialData = location.state?.bill as SalesBill | undefined;
  const isEditMode = !!initialData;

  const [showPartySearch, setShowPartySearch] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [partySearch, setPartySearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [availableProducts, setAvailableProducts] = useState<Item[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<BillItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // PDF Preview Modal state
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [formData, setFormData] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    customerId: 0,
    paymentMode: 'cash',
    amount: 0,
    remarks: '',
    photoPath: null as string | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage] = useState<string | null>(null);

  // Calculate bill total on item changes
  useEffect(() => {
    const calculatedTotal = selectedProducts.reduce((sum, item) => sum + (parseFloat(String(item.totalPrice)) || 0), 0);
    setFormData((prev) => ({ ...prev, amount: calculatedTotal }));
  }, [selectedProducts]);

  // Load backend data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [customersData, productsResponse] = await Promise.all([
          getCustomers().catch(() => []),
          getProduct().catch(() => ({ items: [] })),
        ]);

        setCustomers(customersData || []);
        setAvailableProducts(productsResponse?.items || []);

        if (isEditMode && initialData) {
          setFormData({
            billNumber: initialData.billNumber,
            billDate: initialData.billDate,
            amount: initialData.amount,
            paymentMode: initialData.paymentMode,
            remarks: initialData.remarks || '',
            photoPath: initialData.photoPath,
            customerId: initialData.customer?.customerId ?? 0,
          });
          if (initialData.customer) {
            setSelectedCustomer(initialData.customer);
            setPartySearch(initialData.customer.name || '');
          }
          if (initialData.items) {
            setSelectedProducts(
              initialData.items.map((it) => ({
                ...it,
                stockUnit: it.stockUnit || it.unit || 'pcs',
                unit: it.unit || 'pcs',
              }))
            );
          }
        } else {
          try {
            const billData = await fetchBillNumber();
            if (billData && billData.billNumber) {
              setFormData((prev) => ({
                ...prev,
                billNumber: `${salesConfig.billNumber.prefix}${billData.billNumber}`,
                customerId: 0,
              }));
            }
          } catch (e) {
            console.warn('Could not auto-fetch bill number:', e);
          }
        }
      } catch (err) {
        console.error('Error loading initial sales bill data:', err);
      }
    };

    loadInitialData();
  }, [isEditMode, initialData]);

  // Helper function to calculate item total inclusive of Tax and VAT percentages
  const calculateItemTotal = (
      quantity: number,
      unitPrice: number,
      taxPct: number,
      vatPct: number
  ) => {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxPct / 100);
    const vatAmount = (subtotal + taxAmount) * (vatPct / 100);
    const totalPrice = subtotal + taxAmount + vatAmount;

    return {
      taxAmount,
      vatAmount,
      totalPrice,
    };
  };

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (item: Item) => {
    const existingIndex = selectedProducts.findIndex((p) => p.itemId === item.id);
    const taxPct = item.taxPercentage || 0;
    const vatPct = item.vatPercentage || 0;
    const unitPrice = item.fixedSellingPrice || 0;
    const stockCount = item.itemCount || 0;
    const itemUnit = item.unit || 'pcs';

    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      const curQty = parseFloat(String(updated[existingIndex].quantity)) || 0;
      const newQty = curQty + 1;
      const curPrice = parseFloat(String(updated[existingIndex].unitPrice)) || 0;
      const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
          newQty,
          curPrice,
          taxPct,
          vatPct
      );

      updated[existingIndex].quantity = newQty;
      updated[existingIndex].taxAmount = taxAmount;
      updated[existingIndex].vatAmount = vatAmount;
      updated[existingIndex].totalPrice = totalPrice;
      setSelectedProducts(updated);
    } else {
      const initialQty = 1;
      const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
          initialQty,
          unitPrice,
          taxPct,
          vatPct
      );

      const newItem: BillItem = {
        itemId: item.id,
        name: item.name,
        sku: (item as any).sku,
        unit: itemUnit,
        stockUnit: itemUnit,
        availableStock: stockCount,
        quantity: initialQty,
        unitPrice: unitPrice,
        taxPercentage: taxPct,
        vatPercentage: vatPct,
        taxAmount,
        vatAmount,
        totalPrice,
      };
      setSelectedProducts([...selectedProducts, newItem]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  // Quantity change handler with single-digit removal support
  const handleQuantityChange = (index: number, val: string) => {
    const sanitized = val.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    const cleanVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;

    const updated = [...selectedProducts];
    const item = updated[index];
    const numericQty = cleanVal === '' ? 0 : parseFloat(cleanVal);
    const price = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0;

    const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
      numericQty,
      price,
      item.taxPercentage,
      item.vatPercentage
    );

    updated[index] = {
      ...item,
      quantity: cleanVal,
      taxAmount,
      vatAmount,
      totalPrice,
    };
    setSelectedProducts(updated);
  };

  // On blur, normalize quantity if empty or <= 0
  const handleQuantityBlur = (index: number) => {
    const updated = [...selectedProducts];
    const item = updated[index];
    const num = parseFloat(String(item.quantity));
    if (isNaN(num) || num <= 0) {
      const fallbackQty = 1;
      const price = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0;
      const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
        fallbackQty,
        price,
        item.taxPercentage,
        item.vatPercentage
      );
      updated[index] = {
        ...item,
        quantity: fallbackQty,
        taxAmount,
        vatAmount,
        totalPrice,
      };
      setSelectedProducts(updated);
    } else {
      updated[index] = {
        ...item,
        quantity: num,
      };
      setSelectedProducts(updated);
    }
  };

  // Quick stepper (+/-)
  const handleStepQty = (index: number, delta: number) => {
    const updated = [...selectedProducts];
    const item = updated[index];
    const current = parseFloat(String(item.quantity)) || 0;
    const next = Math.max(1, Math.round((current + delta) * 100) / 100);
    const price = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0;
    const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
      next,
      price,
      item.taxPercentage,
      item.vatPercentage
    );
    updated[index] = {
      ...item,
      quantity: next,
      taxAmount,
      vatAmount,
      totalPrice,
    };
    setSelectedProducts(updated);
  };

  // Price change handler with digit removal support
  const handlePriceChange = (index: number, val: string) => {
    const sanitized = val.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    const cleanVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;

    const updated = [...selectedProducts];
    const item = updated[index];
    const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0;
    const numericPrice = cleanVal === '' ? 0 : parseFloat(cleanVal);

    const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
      qty,
      numericPrice,
      item.taxPercentage,
      item.vatPercentage
    );

    updated[index] = {
      ...item,
      unitPrice: cleanVal,
      taxAmount,
      vatAmount,
      totalPrice,
    };
    setSelectedProducts(updated);
  };

  const handlePriceBlur = (index: number) => {
    const updated = [...selectedProducts];
    const item = updated[index];
    const num = parseFloat(String(item.unitPrice));
    updated[index] = {
      ...item,
      unitPrice: isNaN(num) ? 0 : num,
    };
    setSelectedProducts(updated);
  };

  // Unit dropdown change handler
  const handleUnitChange = (index: number, val: string) => {
    const updated = [...selectedProducts];
    const item = updated[index];
    if (val === 'other') {
      const customUnit = window.prompt('Enter custom quantity unit (e.g. tin, sack, drum):');
      if (customUnit && customUnit.trim()) {
        updated[index] = { ...item, unit: customUnit.trim() };
        setSelectedProducts(updated);
      }
      return;
    }
    updated[index] = { ...item, unit: val };
    setSelectedProducts(updated);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async () => {
    if (selectedProducts.length === 0) {
      setError('Please search and select at least one product.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanedItems = selectedProducts.map((p) => ({
        ...p,
        quantity: parseFloat(String(p.quantity)) || 1,
        unitPrice: parseFloat(String(p.unitPrice)) || 0,
      }));

      const requestData = {
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        customerId: selectedCustomer ? selectedCustomer.customerId : 0,
        customerName: partySearch || 'Walk-in Customer',
        paymentMode: formData.paymentMode,
        amount: formData.amount,
        remarks: formData.remarks,
        photoPath: selectedImage,
        items: cleanedItems,
        id: isEditMode ? initialData?.id : 0,
      };

      await addSalesBill(requestData, isEditMode, initialData?.id);
      navigate('/bills/sales');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process sales bill.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
      c.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  const filteredProducts = availableProducts.filter(
      (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
      <div className="invoice-layout-root">
        <Sidebar />
        <div className="invoice-page-wrapper">
          <div className="purchase-navbar-spacer">
            <Navbar />
          </div>

          <div className="invoice-container">
            {/* Header Banner - Clean Professional AddCustomer Style */}
            <div className="form-card-header mb-3">
              <div className="form-card-header-left">
                <div className="form-header-icon-wrap">
                  <i className="bi bi-receipt-cutoff" />
                </div>
                <div>
                  {/*<h1 className="form-header-title">{isEditMode ? 'Edit Sales Invoice' : 'Add Sales Bill'}</h1>*/}
                  <p className="form-header-subtitle">Manage items, stock quantities, applied VAT/Tax, and finalize invoice</p>
                </div>
              </div>

              {/* Top Right Cross Button */}
              <button
                type="button"
                className="form-close-btn"
                onClick={() => navigate('/bills/sales')}
                aria-label="Close"
                title="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {error && (
              <div className="purchase-alert-danger d-flex align-items-center mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSaveInvoice(); }}>
              <div className="purchase-grid-main">
                {/* Left Column: Form Info, Product Search & Table */}
                <div className="purchase-column-left">
                  {/* Invoice Info Card */}
                  <div className="purchase-card mb-3">
                    <h3 className="purchase-card-title">
                      <i className="bi bi-receipt"></i> Invoice Information
                    </h3>
                    <div className="purchase-form-grid">
                      <div className="input-field-group">
                        <label>Invoice Number</label>
                        <div className="input-with-icon">
                          <i className="bi bi-hash"></i>
                          <input type="text" className="read-only-input" value={formData.billNumber} readOnly disabled />
                        </div>
                      </div>

                      <div className="input-field-group">
                        <label>Billing Date</label>
                        <div className="input-with-icon">
                          <i className="bi bi-calendar3"></i>
                          <input
                            type="date"
                            name="billDate"
                            value={formData.billDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="input-field-group">
                        <label>Customer (Optional)</label>
                        <div className="autocomplete-wrapper">
                          <div className="input-with-icon">
                            <i className="bi bi-person"></i>
                            <input
                              type="text"
                              placeholder="Search customer name or leave blank..."
                              value={partySearch}
                              onChange={(e) => {
                                setPartySearch(e.target.value);
                                setShowPartySearch(true);
                                if (!e.target.value) setSelectedCustomer(null);
                              }}
                              onFocus={() => setShowPartySearch(true)}
                            />
                          </div>
                          {showPartySearch && partySearch && (
                            <div className="autocomplete-dropdown">
                              {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((c) => (
                                  <div
                                    key={c.id}
                                    className="autocomplete-item"
                                    onClick={() => {
                                      setPartySearch(c.name);
                                      setSelectedCustomer(c);
                                      setShowPartySearch(false);
                                    }}
                                  >
                                    <span className="item-title">{c.name}</span>
                                    {c.phone && <span className="item-badge">{c.phone}</span>}
                                  </div>
                                ))
                              ) : (
                                <div className="autocomplete-empty">
                                  No existing customer found (Will save as walk-in customer).
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="input-field-group">
                        <label>Payment Mode</label>
                        <div className="input-with-icon">
                          <i className="bi bi-wallet2"></i>
                          <select
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleInputChange}
                          >
                            <option value="cash">Cash</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="upi">UPI / Digital Payment</option>
                            <option value="bank">Bank Transfer</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Search Card */}
                  <div className="purchase-card mb-3">
                    <h3 className="purchase-card-title">
                      <i className="bi bi-search"></i> Quick Product Search
                    </h3>
                    <div className="autocomplete-wrapper">
                      <div className="input-with-icon">
                        <i className="bi bi-box-seam"></i>
                        <input
                          type="text"
                          placeholder="Search product by name..."
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                        />
                      </div>
                      {showProductDropdown && productSearch && (
                        <div className="autocomplete-dropdown">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((item) => (
                              <div
                                key={item.id}
                                className="autocomplete-item-row"
                                onClick={() => {
                                  handleAddProduct(item);
                                  setShowProductDropdown(false);
                                }}
                              >
                                <div>
                                  <span className="item-title">{item.name}</span>
                                  <span className="item-badge ms-2">{item.category?.name || 'General'}</span>
                                  <div className="small text-muted">Stock: {item.itemCount ?? 0} {item.unit || 'pcs'}</div>
                                </div>
                                <span className="item-price">
                                  Rs. {formatNumber(item.fixedSellingPrice || 0)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="autocomplete-empty">No products found matching "{productSearch}"</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Added Line Items Table */}
                  <div className="purchase-card no-padding">
                    <div className="responsive-table-wrapper">
                      <table className="purchase-table modern-sales-table">
                        <thead>
                          <tr>
                            <th className="th-product-info">Product & Stock</th>
                            <th className="th-qty-unit">Quantity & Unit</th>
                            <th className="th-price-tax">Price & Tax</th>
                            <th className="th-total-action text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="table-empty-state">
                                <i className="bi bi-cart-dash fs-4 d-block mb-1"></i>
                                No line items selected. Search products above to populate bill.
                              </td>
                            </tr>
                          ) : (
                            selectedProducts.map((item, index) => (
                              <tr key={item.itemId} className="sales-item-row">
                                <td className="td-product-info">
                                  <div className="table-item-name">{item.name}</div>
                                  <div className="sales-item-meta">
                                    <span
                                      className={`stock-pill ${
                                        (item.availableStock ?? 0) <= 0
                                          ? 'stock-pill-danger'
                                          : (item.availableStock ?? 0) <= 5
                                          ? 'stock-pill-warning'
                                          : 'stock-pill-success'
                                      }`}
                                      title={`Available in stock: ${item.availableStock} ${item.stockUnit || item.unit || 'pcs'}`}
                                    >
                                      <i className="bi bi-box-seam me-1"></i>
                                      Stock: {item.availableStock} {item.stockUnit || item.unit || 'pcs'}
                                    </span>
                                    {item.sku && (
                                      <span className="stock-pill sku-pill">
                                        SKU: {item.sku}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="td-qty-unit">
                                  <div className="sales-qty-unit-cluster">
                                    <div className="sales-stepper">
                                      <button
                                        type="button"
                                        className="sales-step-btn"
                                        onClick={() => handleStepQty(index, -1)}
                                        title="Decrease quantity"
                                        aria-label="Decrease quantity"
                                      >
                                        <i className="bi bi-dash"></i>
                                      </button>
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        className="sales-qty-input"
                                        value={item.quantity}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                        onBlur={() => handleQuantityBlur(index)}
                                        placeholder="1"
                                        title="Quantity"
                                      />
                                      <button
                                        type="button"
                                        className="sales-step-btn"
                                        onClick={() => handleStepQty(index, 1)}
                                        title="Increase quantity"
                                        aria-label="Increase quantity"
                                      >
                                        <i className="bi bi-plus"></i>
                                      </button>
                                    </div>
                                    <select
                                      className="sales-unit-select"
                                      value={item.unit || 'pcs'}
                                      onChange={(e) => handleUnitChange(index, e.target.value)}
                                      title="Quantity unit (pcs, kg, etc.)"
                                    >
                                      {!QUANTITY_UNITS.some(
                                        (u) => u.value.toLowerCase() === (item.unit || '').toLowerCase()
                                      ) && item.unit && (
                                        <option value={item.unit}>{item.unit}</option>
                                      )}
                                      {QUANTITY_UNITS.map((u) => (
                                        <option key={u.value} value={u.value}>
                                          {u.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </td>
                                <td className="td-price-tax">
                                  <div className="sales-price-wrap">
                                    <div className="sales-price-input-box">
                                      <span className="sales-price-prefix">Rs.</span>
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        className="sales-price-input"
                                        value={item.unitPrice}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => handlePriceChange(index, e.target.value)}
                                        onBlur={() => handlePriceBlur(index)}
                                        placeholder="0.00"
                                        title="Unit price"
                                      />
                                    </div>
                                    <div className="sales-tax-badge-row">
                                      {item.taxPercentage > 0 && (
                                        <span className="tax-tag tax-tag-blue">Tax {item.taxPercentage}%</span>
                                      )}
                                      {item.vatPercentage > 0 && (
                                        <span className="tax-tag tax-tag-green">VAT {item.vatPercentage}%</span>
                                      )}
                                      {item.taxPercentage === 0 && item.vatPercentage === 0 && (
                                        <span className="tax-tag tax-tag-gray">0% Tax</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="td-total-action text-end">
                                  <div className="sales-total-action-box">
                                    <span className="sales-total-amount">
                                      Rs. {formatNumber(item.totalPrice)}
                                    </span>
                                    <button
                                      type="button"
                                      className="btn-icon-danger sales-del-btn"
                                      onClick={() => handleRemoveProduct(index)}
                                      title="Remove line item"
                                      aria-label="Remove item"
                                    >
                                      <i className="bi bi-trash3"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Column: Sticky Summary & Remarks */}
                <div
                  className="purchase-column-right"
                  style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start' }}
                >
                  {/* Summary Card */}
                  <div className="purchase-card summary-card mb-3">
                    <div className="summary-label">Grand Total</div>
                    <div className="summary-price-display">
                      Rs. {formatNumber(formData.amount)}
                    </div>
                    <div className="summary-breakdown">
                      <div className="breakdown-row">
                        <span>Selected Products</span>
                        <span>{selectedProducts.length} Items</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Total Unit Quantity</span>
                        <span>{selectedProducts.reduce((sum, i) => sum + (parseFloat(String(i.quantity)) || 0), 0)} Units</span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks Card */}
                  <div className="purchase-card">
                    <h3 className="purchase-card-title">
                      <i className="bi bi-chat-left-text"></i> Remarks / Notes
                    </h3>
                    <textarea
                      rows={4}
                      className="purchase-textarea"
                      placeholder="Additional payment notes, bill remarks, or extra billing information..."
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Action Footer Below Form */}
              <div className="form-action-footer">
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={() => navigate('/bills/sales')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn-form-preview"
                    onClick={() => setShowPdfModal(true)}
                    disabled={selectedProducts.length === 0}
                  >
                    <i className="bi bi-file-earmark-pdf me-1" />
                    Preview PDF
                  </button>
                  <button
                    type="submit"
                    className="btn-form-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-printer me-1" />
                        Save and Print
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Printable PDF Modal Preview */}
            {showPdfModal && (
              <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header border-bottom">
                      <h5 className="modal-title text-navy fw-bold">
                        <i className="bi bi-file-earmark-pdf me-2"></i>Sales Invoice Preview
                      </h5>
                      <button
                        type="button"
                        className="form-close-btn"
                        onClick={() => setShowPdfModal(false)}
                        title="Close"
                        aria-label="Close"
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>

                    <div className="modal-body p-4" id="printable-invoice">
                      <div className="d-flex justify-content-between pb-3 mb-3 border-bottom">
                        <div>
                          <h3 className="text-navy fw-bold mb-1">SALES INVOICE</h3>
                          <div className="small text-muted">Invoice #: <strong>{formData.billNumber}</strong></div>
                          <div className="small text-muted">Date: {formData.billDate}</div>
                        </div>
                        <div className="text-end">
                          <h6 className="fw-bold mb-1">Customer Details</h6>
                          <div className="small">{partySearch || 'Walk-in Customer'}</div>
                          <div className="small text-muted text-uppercase">Payment: {formData.paymentMode}</div>
                        </div>
                      </div>

                      <table className="table table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Selling Price</th>
                            <th className="text-end">Tax/VAT</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((p) => (
                            <tr key={p.itemId}>
                              <td>{p.name}</td>
                              <td className="text-center">{p.quantity} {p.unit}</td>
                              <td className="text-end">Rs. {formatNumber(parseFloat(String(p.unitPrice)) || 0)}</td>
                              <td className="text-end">Rs. {formatNumber(p.taxAmount + p.vatAmount)}</td>
                              <td className="text-end fw-semibold">Rs. {formatNumber(p.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="d-flex justify-content-between pt-3 border-top">
                        <div className="small text-muted">
                          {formData.remarks && <div><strong>Remarks:</strong> {formData.remarks}</div>}
                        </div>
                        <div className="text-end fw-bold text-navy fs-5">
                          Total: Rs. {formatNumber(formData.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer border-top">
                      <button type="button" className="btn-form-cancel" onClick={() => setShowPdfModal(false)}>
                        Close
                      </button>
                      <button type="button" className="btn-form-submit" onClick={() => window.print()}>
                        <i className="bi bi-printer me-1"></i> Print Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};