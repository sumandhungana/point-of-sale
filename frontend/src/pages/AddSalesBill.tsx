import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { salesConfig } from '../config/sales';
import { fetchCustomers, fetchLastBillNumber, saveSalesBill } from '../services/salesBillService';
import '../styles/AddSalesBill.css';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
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
}

export const AddSalesBill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.bill as SalesBill | undefined;
  const isEditMode = !!initialData;

  const [showPartySearch, setShowPartySearch] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [partySearch, setPartySearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    BillNumber: '',
    BillDate: new Date().toISOString().split('T')[0],
    CustomerId: 0,
    PaymentMode: 'cash',
    Amount: 0,
    Remarks: '',
    PhotoPath: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomersData = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (err) {
        setError('Error loading customers');
        console.error(err);
      }
    };

    const fetchLastBillNumberData = async () => {
      if (isEditMode) {
        setFormData(prev => ({
          ...prev,
          BillNumber: initialData.billNumber,
          BillDate: initialData.billDate,
          Amount: initialData.amount,
          PaymentMode: initialData.paymentMode,
          Remarks: initialData.remarks || '',
          PhotoPath: initialData.photoPath,
          CustomerId: initialData.customer.id,
        }));
        setSelectedCustomer(initialData.customer);
        setPartySearch(initialData.customer.name);
        if (initialData.photoPath) {
          setSelectedImage(initialData.photoPath);
        }
      }
      try {
        const data = await fetchLastBillNumber();
        const lastNumber = data.lastBillNumber || '0';
        const nextNumber = parseInt(lastNumber.replace(salesConfig.billNumber.prefix, '')) + 1;
        const paddedNumber = nextNumber.toString().padStart(salesConfig.billNumber.padding, '0');
        const newBillNumber = `${salesConfig.billNumber.prefix}${paddedNumber}`;
        setFormData(prev => ({
          ...prev,
          BillNumber: newBillNumber,
          CustomerId: 0,
        }));
      } catch (err) {
        console.error('Error fetching last bill number:', err);
        const defaultNumber = `${salesConfig.billNumber.prefix}${'1'.padStart(salesConfig.billNumber.padding, '0')}`;
        setFormData(prev => ({
          ...prev,
          BillNumber: defaultNumber,
          CustomerId: 0,
        }));
      }
    };

    fetchCustomersData();
    fetchLastBillNumberData();
  }, [isEditMode, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        BillNumber: formData.BillNumber,
        BillDate: formData.BillDate,
        CustomerId: selectedCustomer?.id || 0,
        PaymentMode: formData.PaymentMode,
        Amount: formData.Amount,
        Remarks: formData.Remarks,
        PhotoPath: selectedImage,
        Id: isEditMode ? initialData.id : 0
      };

      await saveSalesBill(requestData, isEditMode, initialData?.id);

      alert(`Sales bill ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate('/bills/sales');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        PhotoPath: URL.createObjectURL(file)
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-sales-bill-container">
        <Navbar />
        <div className="add-sales-bill-card">
          <h1 className="add-sales-bill-title">
            <i className="bi bi-plus-circle"></i>
            {isEditMode ? 'Edit Sales Bill' : 'Add New Sales Bill'}
          </h1>
          {error && (
            <div className="add-sales-bill-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}
          <form className="add-sales-bill-form" onSubmit={handleSubmit}>
            <div className="add-sales-bill-row">
              <div className="add-sales-bill-group">
                <label className="add-sales-bill-label">
                  <i className="bi bi-hash"></i>
                  Sales Bill Number
                </label>
                <input
                  type="text"
                  name="BillNumber"
                  value={formData.BillNumber}
                  onChange={handleInputChange}
                  className="add-sales-bill-input"
                  required
                  disabled
                />
              </div>
              <div className="add-sales-bill-group">
                <label className="add-sales-bill-label">
                  <i className="bi bi-calendar"></i>
                  Date
                </label>
                <input
                  type="date"
                  name="BillDate"
                  value={formData.BillDate}
                  onChange={handleInputChange}
                  className="add-sales-bill-input"
                  required
                />
              </div>
            </div>

            <div className="add-sales-bill-group">
              <label className="add-sales-bill-label">
                <i className="bi bi-person"></i>
                Bill To
              </label>
              <div className="add-sales-bill-dropdown">
                <input
                  type="text"
                  className="add-sales-bill-dropdown-input"
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  onFocus={() => setShowPartySearch(true)}
                  onBlur={() => setTimeout(() => setShowPartySearch(false), 200)}
                  placeholder="Search customer..."
                  required
                />
                {showPartySearch && partySearch && (
                  <div className="add-sales-bill-dropdown-list">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          className="add-sales-bill-dropdown-item"
                          onClick={() => {
                            setPartySearch(customer.name);
                            setSelectedCustomer(customer);
                            setShowPartySearch(false);
                          }}
                        >
                          {customer.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', color: '#6c757d' }}>
                        No customers found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="add-sales-bill-row">
              <div className="add-sales-bill-group">
                <label className="add-sales-bill-label">
                  <i className="bi bi-currency-rupee"></i>
                  Amount
                </label>
                <input
                  type="number"
                  name="Amount"
                  value={formData.Amount}
                  onChange={handleInputChange}
                  className="add-sales-bill-input"
                  required
                  placeholder="Enter amount"
                />
              </div>
              <div className="add-sales-bill-group">
                <label className="add-sales-bill-label">
                  <i className="bi bi-credit-card"></i>
                  Payment Mode
                </label>
                <select
                  name="PaymentMode"
                  value={formData.PaymentMode}
                  onChange={handleInputChange}
                  className="add-sales-bill-select"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="add-sales-bill-group">
              <label className="add-sales-bill-label">
                <i className="bi bi-chat-text"></i>
                Remarks
              </label>
              <textarea
                name="Remarks"
                value={formData.Remarks}
                onChange={handleInputChange}
                className="add-sales-bill-textarea"
                placeholder="Enter remarks..."
              />
            </div>

            <div className="add-sales-bill-group">
              <label className="add-sales-bill-label">
                <i className="bi bi-image"></i>
                Photo
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="add-sales-bill-file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="add-sales-bill-file-label">
                <i className="bi bi-cloud-upload"></i>
                {selectedImage ? 'Change Photo' : 'Upload Photo'}
              </label>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="add-sales-bill-image-preview"
                />
              )}
            </div>

            <div className="add-sales-bill-button-container">
              <button
                type="button"
                className="add-sales-bill-cancel-button"
                onClick={() => navigate('/bills/sales')}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="add-sales-bill-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="add-sales-bill-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    {isEditMode ? 'Update Bill' : 'Save Bill'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 