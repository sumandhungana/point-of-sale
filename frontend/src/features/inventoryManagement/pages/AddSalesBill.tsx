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
  customer: Customer;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const calculatedTotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
    setFormData(prev => ({ ...prev, amount: calculatedTotal }));
  }, [selectedProducts]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [customersData, productsResponse] = await Promise.all([
          getCustomers(),
          getProduct()
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
          setSelectedCustomer(initialData.customer);
          setPartySearch(initialData.customer?.name || '');
          if (initialData.photoPath) setSelectedImage(initialData.photoPath);
          if (initialData.items) setSelectedProducts(initialData.items);
        } else {
          const billData = await fetchBillNumber();
          setFormData(prev => ({
            ...prev,
            billNumber: `${salesConfig.billNumber.prefix}${billData.billNumber}`,
            customerId: 0,
          }));
        }
      } catch (err) {
        setError('Error initializing bill data.');
        console.error(err);
      }
    };

    loadInitialData();
  }, [isEditMode, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (item: Item) => {
    const existingIndex = selectedProducts.findIndex(p => p.itemId === item.id);
    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      const newQty = updated[existingIndex].quantity + 1;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = newQty * updated[existingIndex].unitPrice;
      setSelectedProducts(updated);
    } else {
      const newItem: BillItem = {
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        unit: item.unit || 'Pcs',
        availableStock: item.openingStock || 0,
        quantity: 1,
        unitPrice: item.salesPrice || 0,
        totalPrice: item.salesPrice || 0,
      };
      setSelectedProducts([...selectedProducts, newItem]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleItemChange = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const updated = [...selectedProducts];
    const currentItem = { ...updated[index], [field]: value };
    currentItem.totalPrice = currentItem.quantity * currentItem.unitPrice;
    updated[index] = currentItem;
    setSelectedProducts(updated);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }
    if (selectedProducts.length === 0) {
      setError('Please select at least one product.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        customerId: selectedCustomer.customerId,
        paymentMode: formData.paymentMode,
        amount: formData.amount,
        remarks: formData.remarks,
        photoPath: selectedImage,
        items: selectedProducts,
        id: isEditMode ? initialData?.id : 0
      };

      await addSalesBill(requestData, isEditMode, initialData?.id);
      navigate('/bills/sales');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving invoice.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
      c.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  const filteredProducts = availableProducts.filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
      <div className="invoice-layout-root">
        <Sidebar />
        <div className="invoice-page-wrapper">
          <div className="fixed-navbar-spacer">
            <Navbar />
          </div>

          <div className="invoice-container">
            {/* Top Header Card */}
            <div className="invoice-header-card">
              <div className="invoice-header-title">
                <div className="invoice-icon-badge">
                  <i className="bi bi-receipt-cutoff"></i>
                </div>
                <div>
                  <h2>{isEditMode ? 'Edit Sales Invoice' : 'New Sales Invoice'}</h2>
                  <p>Create, review line items, and adjust payment details.</p>
                </div>
              </div>
              <div className="invoice-header-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/bills/sales')}>
                  Cancel
                </button>
                <button
                    type="button"
                    className="btn-outline-primary"
                    onClick={() => setShowPdfModal(true)}
                    disabled={selectedProducts.length === 0}
                >
                  <i className="bi bi-file-earmark-pdf"></i> Preview PDF
                </button>
                <button type="button" className="btn-primary" onClick={handleSaveInvoice} disabled={loading}>
                  {loading ? <i className="bi bi-arrow-repeat spin"></i> : <i className="bi bi-check2-circle"></i>}
                  {isEditMode ? 'Update Invoice' : 'Save & Print'}
                </button>
              </div>
            </div>

            {error && (
                <div className="invoice-alert-danger">
                  <i className="bi bi-exclamation-octagon-fill"></i> {error}
                </div>
            )}

            <div className="invoice-grid-main">
              {/* Left Main Section */}
              <div className="invoice-column-left">
                <div className="invoice-card">
                  <h3 className="invoice-card-title"><i className="bi bi-info-circle"></i> Invoice Details</h3>
                  <div className="invoice-form-grid">
                    <div className="input-field-group">
                      <label>Invoice Number</label>
                      <div className="input-with-icon">
                        <i className="bi bi-hash"></i>
                        <input type="text" value={formData.billNumber} readOnly className="read-only-input" />
                      </div>
                    </div>

                    <div className="input-field-group">
                      <label>Billing Date</label>
                      <div className="input-with-icon">
                        <i className="bi bi-calendar3"></i>
                        <input
                            type="date"
                            name="BillDate"
                            value={formData.billDate}
                            onChange={handleInputChange}
                            required
                        />
                      </div>
                    </div>

                    <div className="input-field-group">
                      <label>Customer Name</label>
                      <div className="autocomplete-wrapper">
                        <div className="input-with-icon">
                          <i className="bi bi-person"></i>
                          <input
                              type="text"
                              value={partySearch}
                              onChange={(e) => setPartySearch(e.target.value)}
                              onFocus={() => setShowPartySearch(true)}
                              onBlur={() => setTimeout(() => setShowPartySearch(false), 200)}
                              placeholder="Search customer..."
                              required
                          />
                        </div>
                        {showPartySearch && partySearch && (
                            <div className="autocomplete-dropdown">
                              {filteredCustomers.length > 0 ? (
                                  filteredCustomers.map(c => (
                                      <div
                                          key={c.id}
                                          className="autocomplete-item"
                                          onClick={() => {
                                            setPartySearch(c.name);
                                            setSelectedCustomer(c);
                                            setShowPartySearch(false);
                                          }}
                                      >
                                        <strong>{c.name}</strong>
                                      </div>
                                  ))
                              ) : (
                                  <div className="autocomplete-empty">No customer matches found</div>
                              )}
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="input-field-group">
                      <label>Payment Mode</label>
                      <div className="input-with-icon">
                        <i className="bi bi-wallet2"></i>
                        <select name="PaymentMode" value={formData.paymentMode} onChange={handleInputChange}>
                          <option value="cash">Cash</option>
                          <option value="card">Credit/Debit Card</option>
                          <option value="upi">UPI / Digital</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Line Item Entry */}
                <div className="invoice-card">
                  <h3 className="invoice-card-title"><i className="bi bi-box-seam"></i> Add Line Items</h3>
                  <div className="autocomplete-wrapper">
                    <div className="input-with-icon">
                      <i className="bi bi-search"></i>
                      <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                          placeholder="Type product name or scan SKU..."
                      />
                    </div>
                    {showProductDropdown && productSearch && (
                        <div className="autocomplete-dropdown">
                          {filteredProducts.length > 0 ? (
                              filteredProducts.map(item => (
                                  <div key={item.id} className="autocomplete-item-row" onClick={() => handleAddProduct(item)}>
                                    <div>
                                      <div className="item-title">{item.name}</div>
                                      {item.sku && <span className="item-badge">{item.sku}</span>}
                                    </div>
                                    <div className="item-meta">
                                      <span className="item-price">Rs. {item.salesPrice}</span>
                                      <span className="item-stock">Stock: {item.openingStock} {item.unit || 'Pcs'}</span>
                                    </div>
                                  </div>
                              ))
                          ) : (
                              <div className="autocomplete-empty">No products found</div>
                          )}
                        </div>
                    )}
                  </div>
                </div>

                {/* Table Card */}
                <div className="invoice-card no-padding">
                  <div className="responsive-table-wrapper">
                    <table className="invoice-table">
                      <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Stock</th>
                        <th style={{ width: '110px' }}>Quantity</th>
                        <th style={{ width: '130px' }}>Unit Price</th>
                        <th>Total</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                      </thead>
                      <tbody>
                      {selectedProducts.length > 0 ? (
                          selectedProducts.map((item, index) => (
                              <tr key={item.itemId}>
                                <td>
                                  <div className="table-item-name">{item.name}</div>
                                  {item.sku && <span className="item-badge-subtle">{item.sku}</span>}
                                </td>
                                <td>
                                  <span className="stock-pill">{item.availableStock} {item.unit}</span>
                                </td>
                                <td>
                                  <input
                                      type="number"
                                      min="1"
                                      className="table-input"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseFloat(e.target.value) || 1))}
                                  />
                                </td>
                                <td>
                                  <input
                                      type="number"
                                      min="0"
                                      className="table-input"
                                      value={item.unitPrice}
                                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                  />
                                </td>
                                <td className="table-total-text">
                                  Rs. {item.totalPrice.toFixed(2)}
                                </td>
                                <td>
                                  <button
                                      type="button"
                                      className="btn-icon-danger"
                                      onClick={() => handleRemoveProduct(index)}
                                      title="Remove item"
                                  >
                                    <i className="bi bi-trash3"></i>
                                  </button>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan={6} className="table-empty-state">
                              <i className="bi bi-cart-dash"></i>
                              <p>No products added. Search above to populate line items.</p>
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Summary Column */}
              <div className="invoice-column-right">
                <div className="invoice-card summary-card">
                  <span className="summary-label">Grand Total Amount</span>
                  <div className="summary-price-display">
                    Rs. {formData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div className="summary-breakdown">
                    <div className="breakdown-row">
                      <span>Selected Items</span>
                      <strong>{selectedProducts.length}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Total Quantity</span>
                      <strong>{selectedProducts.reduce((sum, i) => sum + i.quantity, 0)}</strong>
                    </div>
                  </div>
                </div>

                <div className="invoice-card">
                  <h3 className="invoice-card-title"><i className="bi bi-pencil-square"></i> Remarks & Notes</h3>
                  <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Payment notes, delivery conditions, or extra billing details..."
                      className="invoice-textarea"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Modal Preview */}
        {showPdfModal && (
            <div className="pdf-modal-backdrop" onClick={() => setShowPdfModal(false)}>
              <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="pdf-modal-header">
                  <h3><i className="bi bi-file-earmark-pdf-fill"></i> Sales Invoice Preview</h3>
                  <div className="pdf-modal-actions">
                    <button className="btn-primary" onClick={() => window.print()}>
                      <i className="bi bi-printer"></i> Print Invoice
                    </button>
                    <button className="btn-secondary" onClick={() => setShowPdfModal(false)}>
                      Close
                    </button>
                  </div>
                </div>

                <div className="pdf-printable-area" id="printable-invoice">
                  <div className="pdf-bill-header">
                    <div>
                      <h2>SALES INVOICE</h2>
                      <p>Invoice #: <strong>{formData.billNumber}</strong></p>
                      <p>Date: {formData.billDate}</p>
                    </div>
                    <div className="pdf-customer-info">
                      <h4>Billed To:</h4>
                      <p><strong>{selectedCustomer?.name || 'N/A'}</strong></p>
                      <p>Payment Mode: <span style={{ textTransform: 'uppercase' }}>{formData.paymentMode}</span></p>
                    </div>
                  </div>

                  <table className="pdf-table">
                    <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {selectedProducts.map(p => (
                        <tr key={p.itemId}>
                          <td>{p.name}</td>
                          <td>{p.quantity} {p.unit}</td>
                          <td>Rs. {p.unitPrice.toFixed(2)}</td>
                          <td>Rs. {p.totalPrice.toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>

                  <div className="pdf-bill-footer">
                    <div className="pdf-notes">
                      {formData.remarks && <p><strong>Notes:</strong> {formData.remarks}</p>}
                    </div>
                    <div className="pdf-grand-total">
                      Total: Rs. {formData.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};