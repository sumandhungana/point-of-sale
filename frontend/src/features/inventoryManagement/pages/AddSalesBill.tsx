import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { salesConfig } from '@/config/sales';
import { Customer, getCustomers } from '../../services/customerService';
import { fetchBillNumber, addSalesBill } from '@/features/services/salesBillService';
import { Item, getProduct } from '../../services/productService';
import '../../../styles/AddPurchase.css';
import '../../../styles/AddSalesBill.css';

interface BillItem {
  itemId: number;
  name: string;
  sku?: string;
  unit: string;
  availableStock: number;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  vatPercentage: number;
  taxAmount: number;
  vatAmount: number;
  totalPrice: number;
}

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
    const calculatedTotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
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
          if (initialData.items) setSelectedProducts(initialData.items);
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

    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      const newQty = updated[existingIndex].quantity + 1;
      const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
          newQty,
          updated[existingIndex].unitPrice,
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
        unit: item.unit || 'pcs',
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

  const handleItemChange = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const updated = [...selectedProducts];
    const item = updated[index];
    const qty = field === 'quantity' ? value : item.quantity;
    const price = field === 'unitPrice' ? value : item.unitPrice;

    const { taxAmount, vatAmount, totalPrice } = calculateItemTotal(
        qty,
        price,
        item.taxPercentage,
        item.vatPercentage
    );

    updated[index] = {
      ...item,
      [field]: value,
      taxAmount,
      vatAmount,
      totalPrice,
    };
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
      const requestData = {
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        customerId: selectedCustomer ? selectedCustomer.customerId : 0,
        customerName: partySearch || 'Walk-in Customer',
        paymentMode: formData.paymentMode,
        amount: formData.amount,
        remarks: formData.remarks,
        photoPath: selectedImage,
        items: selectedProducts,
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
                  <h1 className="form-header-title">{isEditMode ? 'Edit Sales Invoice' : 'Add Sales Bill'}</h1>
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
                                  Rs. {(item.fixedSellingPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                      <table className="purchase-table">
                        <thead>
                          <tr>
                            <th style={{ width: '32%' }}>Product</th>
                            <th style={{ width: '12%' }}>Stock</th>
                            <th style={{ width: '14%' }}>Qty</th>
                            <th style={{ width: '18%' }}>Price (Rs)</th>
                            <th style={{ width: '10%' }}>Tax/VAT</th>
                            <th style={{ width: '10%' }} className="text-end">Total</th>
                            <th style={{ width: '4%' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="table-empty-state">
                                <i className="bi bi-cart-dash fs-4 d-block mb-1"></i>
                                No line items selected. Search products above to populate bill.
                              </td>
                            </tr>
                          ) : (
                            selectedProducts.map((item, index) => (
                              <tr key={item.itemId}>
                                <td>
                                  <div className="table-item-name">{item.name}</div>
                                  {item.sku && <span className="stock-pill">SKU: {item.sku}</span>}
                                </td>
                                <td>
                                  <span className="stock-pill">
                                    {item.availableStock} {item.unit}
                                  </span>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="1"
                                    className="table-input text-center"
                                    value={item.quantity === 0 ? '' : item.quantity}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        'quantity',
                                        Math.max(1, parseFloat(e.target.value) || 0)
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="table-input"
                                    value={item.unitPrice === 0 ? '' : item.unitPrice}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        'unitPrice',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <div className="small text-muted">
                                    {item.taxPercentage > 0 && <div>Tax: {item.taxPercentage}%</div>}
                                    {item.vatPercentage > 0 && <div>VAT: {item.vatPercentage}%</div>}
                                    {item.taxPercentage === 0 && item.vatPercentage === 0 && <span>None</span>}
                                  </div>
                                </td>
                                <td className="text-end fw-bold" style={{ color: '#255DCE' }}>
                                  Rs. {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="btn-icon-danger"
                                    onClick={() => handleRemoveProduct(index)}
                                    title="Remove line item"
                                  >
                                    <i className="bi bi-trash3"></i>
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

                {/* Right Column: Sticky Summary & Remarks */}
                <div
                  className="purchase-column-right"
                  style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start' }}
                >
                  {/* Summary Card */}
                  <div className="purchase-card summary-card mb-3">
                    <div className="summary-label">Grand Total</div>
                    <div className="summary-price-display">
                      Rs. {formData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="summary-breakdown">
                      <div className="breakdown-row">
                        <span>Selected Products</span>
                        <span>{selectedProducts.length} Items</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Total Unit Quantity</span>
                        <span>{selectedProducts.reduce((sum, i) => sum + i.quantity, 0)} Units</span>
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
                              <td className="text-end">Rs. {p.unitPrice.toFixed(2)}</td>
                              <td className="text-end">Rs. {(p.taxAmount + p.vatAmount).toFixed(2)}</td>
                              <td className="text-end fw-semibold">Rs. {p.totalPrice.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="d-flex justify-content-between pt-3 border-top">
                        <div className="small text-muted">
                          {formData.remarks && <div><strong>Remarks:</strong> {formData.remarks}</div>}
                        </div>
                        <div className="text-end fw-bold text-navy fs-5">
                          Total: Rs. {formData.amount.toFixed(2)}
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