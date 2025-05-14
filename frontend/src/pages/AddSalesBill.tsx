import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { salesConfig } from '../config/sales';
import { fetchCustomers, fetchLastBillNumber, saveSalesBill } from '../services/salesBillService';

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        PhotoPath: URL.createObjectURL(file)
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  const styles = {
    container: {
      display: 'flex',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    main: {
      flex: 1,
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    formRow: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    formColumn: {
      flex: 1,
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#212529',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '1rem',
    },
    searchContainer: {
      position: 'relative' as const,
    },
    searchResults: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      maxHeight: '200px',
      overflowY: 'auto' as const,
      zIndex: 100,
    },
    searchItem: {
      padding: '0.5rem',
      cursor: 'pointer',
      '&:hover': {
        background: '#f8f9fa',
      },
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '1rem',
      minHeight: '100px',
    },
    fileInput: {
      display: 'none',
    },
    fileLabel: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '1rem',
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '2rem',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
    error: {
      color: 'red',
      marginBottom: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sales Bill Number</label>
                  <input
                    type="text"
                    name="BillNumber"
                    value={formData.BillNumber}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    disabled
                  />
                </div>
              </div>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    name="BillDate"
                    value={formData.BillDate}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bill To</label>
              <div style={styles.searchContainer}>
                <input
                  type="text"
                  style={styles.input}
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  onFocus={() => setShowPartySearch(true)}
                  onBlur={() => setTimeout(() => setShowPartySearch(false), 200)}
                  placeholder="Search customer..."
                  required
                />
                {showPartySearch && partySearch && (
                  <div style={styles.searchResults}>
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        style={styles.searchItem}
                        onClick={() => {
                          setPartySearch(customer.name);
                          setSelectedCustomer(customer);
                          setShowPartySearch(false);
                        }}
                      >
                        {customer.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Amount</label>
              <input
                type="number"
                name="Amount"
                value={formData.Amount}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Mode</label>
              <select
                name="PaymentMode"
                value={formData.PaymentMode}
                onChange={handleInputChange}
                style={styles.input}
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Remarks</label>
              <textarea
                name="Remarks"
                value={formData.Remarks}
                onChange={handleInputChange}
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Photo</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                style={styles.fileInput}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" style={styles.fileLabel}>
                {selectedImage ? 'Change Photo' : 'Upload Photo'}
              </label>
              {selectedImage && (
                <div style={{ marginTop: '1rem' }}>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    style={{ maxWidth: '200px', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.actionButtons}>
              <button
                type="button"
                onClick={() => navigate('/sales')}
                style={{ ...styles.saveButton, background: '#6c757d' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Edit Bill' : 'Save Bill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 