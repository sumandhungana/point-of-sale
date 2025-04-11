import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const AddPaymentGateway = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    paymentMode: '',
    description: '',
    isActive: false,
    verificationUrl: '',
    publicKey: '',
    secretKey: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '2rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1.5rem',
      marginTop: '2rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    row: {
      display: 'flex',
      gap: '2rem',
    },
    inputGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      color: '#495057',
      fontWeight: '500',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    imagePreview: {
      width: '200px',
      height: '200px',
      border: '1px dashed #dee2e6',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem',
      background: selectedImage ? `url(${selectedImage})` : '#f8f9fa',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    imagePlaceholder: {
      fontSize: '3rem',
      color: '#6c757d',
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: '50px',
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.heading}>Add Payment Gateway</h1>
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleInputChange}
                    style={styles.select}
                    required
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="net_banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActive"
                  />
                  <label htmlFor="isActive" style={styles.label}>Is Active</label>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Select File</label>
                <div 
                  style={styles.imagePreview}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {!selectedImage && <span style={styles.imagePlaceholder}>📁</span>}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  placeholder="Click to upload file"
                  style={styles.input}
                  readOnly
                />
              </div>

              <h2 style={styles.sectionHeader}>Configuration</h2>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Verification URL</label>
                <input
                  type="url"
                  name="verificationUrl"
                  value={formData.verificationUrl}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Public Key</label>
                <input
                  type="text"
                  name="publicKey"
                  value={formData.publicKey}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Secret Key</label>
                <input
                  type="password"
                  name="secretKey"
                  value={formData.secretKey}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.saveButton}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 