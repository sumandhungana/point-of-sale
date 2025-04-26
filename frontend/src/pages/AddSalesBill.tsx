import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const AddSalesBill = () => {
  const navigate = useNavigate();
  const [showPartySearch, setShowPartySearch] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [partySearch, setPartySearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    customerId: 0,
    billDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    discountAmount: 0,
    taxAmount: 0,
    netAmount: 0,
    paymentStatus: 'Pending',
    billNumber: '',
    paymentMode: 'cash',
    photoPath: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/Customer');
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        console.log(data);
        setCustomers(data);
      } catch (err) {
        setError('Error loading customers');
        console.error(err);
      }
    };

    fetchCustomers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const formDataToSend = new FormData();
      formDataToSend.append('BillNumber', formData.billNumber);
      formDataToSend.append('BillDate', formData.billDate);
      formDataToSend.append('CustomerId', selectedCustomer?.id.toString() || '');
      formDataToSend.append('PaymentMode', formData.paymentMode);
      formDataToSend.append('TotalAmount', formData.totalAmount.toString());
      formDataToSend.append('DiscountAmount', formData.discountAmount.toString());
      formDataToSend.append('TaxAmount', formData.taxAmount.toString());
      formDataToSend.append('NetAmount', formData.netAmount.toString());
      formDataToSend.append('PaymentStatus', formData.paymentStatus);

      if (formData.photoPath) {
        formDataToSend.append('Photo', formData.photoPath);
      }

      const response = await fetch('/api/SalesBill', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create sales bill');
      }
      alert('Sales bill created successfully!');
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
        photoPath: file
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
      minHeight: '100vh',
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
    addButton: {
      position: 'absolute' as const,
      right: '0.5rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.25rem',
      color: '#28a745',
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
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    name="billDate"
                    value={formData.billDate}
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

            <div style={styles.formRow}>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Amount</label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Discount Amount</label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tax Amount</label>
                  <input
                    type="number"
                    name="taxAmount"
                    value={formData.taxAmount}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Net Amount</label>
                  <input
                    type="number"
                    name="netAmount"
                    value={formData.netAmount}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
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
              </div>
              <div style={styles.formColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
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
                {loading ? 'Saving...' : 'Save Bill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 