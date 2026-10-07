import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { salesConfig } from '@/config/sales';
import { Customer, getCustomers } from '../../services/customerService';
import { fetchBillNumber, addSalesBill } from '@/features/services/salesBillService';
import { Item, getProduct } from '../../services/productService';
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
          getCustomers(),
          getProduct(),
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
          const billData = await fetchBillNumber();
          setFormData((prev) => ({
            ...prev,
            billNumber: `${salesConfig.billNumber.prefix}${billData.billNumber}`,
            customerId: 0,
          }));
        }
      } catch (err) {
        setError('Error initializing billing context data.');
        console.error(err);
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
      <div className="user-management-page-wrapper">
        <Sidebar />
        <div className="user-management-container">
          <div className="fixed-navbar-spacer">
            <Navbar />
          </div>

          <div className="user-management-content" style={{ paddingBottom: '3rem' }}>
            {/* Header Bar */}
            <div className="stat-card" style={{ marginBottom: '1.25rem', justifyContent: 'space-between' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-box navy">
                  <i className="bi bi-receipt-cutoff"></i>
                </div>
                <div>
                  <h3 className="text-navy m-0 fw-bold">{isEditMode ? 'Edit Sales Invoice' : 'New Sales Invoice'}</h3>
                  <span className="text-muted small">Manage items, stock quantities, applied VAT/Tax, and final totals.</span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn-secondary" onClick={() => navigate('/bills/sales')}>
                  Cancel
                </button>
                <button
                    type="button"
                    className="btn-secondary"
                    style={{ backgroundColor: '#EEF2FF', color: '#255DCE', borderColor: '#C7D2FE' }}
                    onClick={() => setShowPdfModal(true)}
                    disabled={selectedProducts.length === 0}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i> Preview PDF
                </button>
                <button type="button" className="btn-primary" onClick={handleSaveInvoice} disabled={loading}>
                  {loading ? <i className="bi bi-arrow-repeat spin me-1"></i> : <i className="bi bi-check2-circle me-1"></i>}
                  {isEditMode ? 'Update Invoice' : 'Save & Print'}
                </button>
              </div>
            </div>

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-octagon-fill"></i>
                  <div>{error}</div>
                </div>
            )}

            <div className="row g-3">
              {/* Left Main Form Area */}
              <div className="col-lg-8">
                {/* Invoice Metadata Card */}
                <div className="filter-controls-card mb-3">
                  <div className="fw-semibold text-navy mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                    <i className="bi bi-file-text"></i> Basic Invoice Info
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Invoice Number</label>
                      <input type="text" value={formData.billNumber} readOnly className="form-control bg-light" />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Billing Date</label>
                      <input
                          type="date"
                          name="billDate"
                          value={formData.billDate}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                      />
                    </div>

                    <div className="col-md-6 position-relative">
                      <label className="form-label text-muted small fw-semibold">Customer (Optional)</label>
                      <div className="search-input-wrapper">
                        <i className="bi bi-person search-icon"></i>
                        <input
                            type="text"
                            value={partySearch}
                            onChange={(e) => {
                              setPartySearch(e.target.value);
                              if (!e.target.value) setSelectedCustomer(null);
                            }}
                            onFocus={() => setShowPartySearch(true)}
                            onBlur={() => setTimeout(() => setShowPartySearch(false), 200)}
                            placeholder="Search customer name or leave blank..."
                            className="form-control search-input"
                        />
                      </div>
                      {showPartySearch && partySearch && (
                          <div className="position-absolute start-0 end-0 mt-1 bg-white border rounded-3 shadow-lg z-3 overflow-hidden" style={{ top: '100%' }}>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((c) => (
                                    <div
                                        key={c.id}
                                        className="p-2 border-bottom hover-bg-light cursor-pointer"
                                        style={{ cursor: 'pointer' }}
                                        onMouseDown={() => {
                                          setPartySearch(c.name);
                                          setSelectedCustomer(c);
                                          setShowPartySearch(false);
                                        }}
                                    >
                                      <div className="fw-semibold text-navy">{c.name}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 text-muted small text-center">No existing customer found (Will save as standard entry)</div>
                            )}
                          </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Payment Mode</label>
                      <select
                          name="paymentMode"
                          value={formData.paymentMode}
                          onChange={handleInputChange}
                          className="form-control"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="upi">UPI / Digital Payment</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Product Search Card */}
                <div className="filter-controls-card mb-3 position-relative">
                  <div className="fw-semibold text-navy mb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-search"></i> Quick Product Search
                  </div>
                  <div className="search-input-wrapper">
                    <i className="bi bi-box-seam search-icon"></i>
                    <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                        placeholder="Search by product name..."
                        className="form-control search-input"
                    />
                  </div>

                  {showProductDropdown && productSearch && (
                      <div
                          className="position-absolute start-0 end-0 mx-3 bg-white border rounded-3 shadow-lg z-3 overflow-auto"
                          style={{ maxHeight: '240px', top: '100%' }}
                      >
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-2 border-bottom d-flex align-items-center justify-content-between cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onMouseDown={() => handleAddProduct(item)}
                                >
                                  <div>
                                    <div className="fw-semibold text-navy">{item.name}</div>
                                    <span className="badge-role">{item.category?.name || 'General'}</span>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold" style={{ color: '#255DCE' }}>
                                      Rs. {(item.fixedSellingPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="small text-muted">
                                      Stock: {item.itemCount ?? 0} {item.unit || 'pcs'}
                                    </div>
                                  </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-muted text-center">No products found matching "{productSearch}"</div>
                        )}
                      </div>
                  )}
                </div>

                {/* Added Line Items Table */}
                <div className="user-table-card">
                  <table className="user-table">
                    <thead>
                    <tr>
                      <th>Product</th>
                      <th>Available Stock</th>
                      <th style={{ width: '120px' }}>Qty</th>
                      <th style={{ width: '140px' }}>Selling Price</th>
                      <th>Tax / VAT</th>
                      <th className="text-end">Total Price</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {selectedProducts.length > 0 ? (
                        selectedProducts.map((item, index) => (
                            <tr key={item.itemId}>
                              <td>
                                <div className="fw-semibold text-navy">{item.name}</div>
                                {item.sku && <div className="small text-muted">SKU: {item.sku}</div>}
                              </td>
                              <td>
                            <span className="badge-status active">
                              {item.availableStock} {item.unit}
                            </span>
                              </td>
                              <td>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control form-control-sm text-center"
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
                                    className="form-control form-control-sm"
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
                                    className="btn btn-link text-danger p-0"
                                    onClick={() => handleRemoveProduct(index)}
                                    title="Remove line item"
                                >
                                  <i className="bi bi-trash3"></i>
                                </button>
                              </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            <i className="bi bi-cart-dash fs-4 d-block mb-1"></i>
                            No line items selected. Search for a product above to add to bill.
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Summary Column */}
              <div className="col-lg-4">
                <div className="filter-controls-card mb-3" style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF' }}>
                  <div className="text-uppercase small fw-bold tracking-wider opacity-75 mb-1">Grand Total</div>
                  <div className="display-6 fw-bold mb-3" style={{ color: '#60A5FA' }}>
                    Rs. {formData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div className="pt-2 border-top border-secondary d-flex justify-content-between small opacity-75 mb-1">
                    <span>Selected Products</span>
                    <span>{selectedProducts.length} Items</span>
                  </div>
                  <div className="d-flex justify-content-between small opacity-75">
                    <span>Total Unit Quantity</span>
                    <span>{selectedProducts.reduce((sum, i) => sum + i.quantity, 0)} Units</span>
                  </div>
                </div>

                <div className="filter-controls-card">
                  <label className="form-label text-navy fw-semibold small">Remarks / Notes</label>
                  <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Additional payment notes, bill remarks, or extra billing information..."
                      className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Printable PDF Modal Preview */}
        {showPdfModal && (
            <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header border-bottom">
                    <h5 className="modal-title text-navy fw-bold">
                      <i className="bi bi-file-earmark-pdf me-2"></i>Sales Invoice Preview
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowPdfModal(false)}></button>
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
                    <button type="button" className="btn-secondary" onClick={() => setShowPdfModal(false)}>
                      Close
                    </button>
                    <button type="button" className="btn-primary" onClick={() => window.print()}>
                      <i className="bi bi-printer me-1"></i> Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};