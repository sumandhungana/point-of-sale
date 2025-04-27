import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const AddKhataBook = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    address: '',
    email: '',
    companyName: '',
    companyNumber: '',
    companyAddress: '',
    companyEmail: '',
    businessCategory: '',
    businessType: '',
    taxVat: false,
    bookAccount: false,
    kyc: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert string values to enum values
      const payload = {
        ...formData,
        businessCategory: formData.businessCategory,
        businessType: formData.businessType
      };

      console.log('Sending payload:', payload);

      const response = await fetch('/api/KhataBook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create Khata Book');
      }

      toast.success('Khata Book created successfully!');
      navigate('/khata-books');
    } catch (error) {
      console.error('Error creating Khata Book:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create Khata Book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      width: 'calc(100% - 4rem)',
      padding: '2rem',
      boxSizing: 'border-box' as const,
    },
    imageSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      marginBottom: '3rem',
    },
    imagePlaceholder: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: '#e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: '#6c757d',
      marginBottom: '1rem',
    },
    addPhotoButton: {
      padding: '0.5rem 1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    section: {
      marginBottom: '3rem',
      background: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '1.5rem',
    },
    hr: {
      border: 'none',
      borderTop: '1px solid #dee2e6',
      margin: '1.5rem 0',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#495057',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginTop: '1rem',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '4px',
      '&:hover': {
        background: '#f8f9fa',
      },
    },
    saveButton: {
      padding: '0.75rem 2rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      float: 'right' as const,
      marginTop: '2rem',
    },
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '280px', overflowX: 'hidden' }}>
        <Navbar />
        <div style={styles.container}>
          <form onSubmit={handleSubmit}>
            {/* Image Section */}
            <div style={styles.imageSection}>
              <div style={styles.imagePlaceholder}>👤</div>
              <button type="button" style={styles.addPhotoButton}>
                Add Photo
              </button>
            </div>

            {/* Personal Info Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Personal Info</h2>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Number</label>
                  <input
                    type="tel"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Business Info Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Business Info</h2>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Company Number</label>
                  <input
                    type="tel"
                    name="companyNumber"
                    value={formData.companyNumber}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Company Address</label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Company Email</label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Category</label>
                  <select
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Select Category</option>
                    <option value="1">Retail</option>
                    <option value="2">Wholesale</option>
                    <option value="3">Manufacturing</option>
                    <option value="4">Service</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Type</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Select Type</option>
                    <option value="1">Sole Proprietorship</option>
                    <option value="2">Partnership</option>
                    <option value="3">Corporation</option>
                    <option value="4">LLC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Info Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Financial Info</h2>
              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="taxVat"
                    checked={formData.taxVat}
                    onChange={handleInputChange}
                  />
                  Tax/VAT
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="bookAccount"
                    checked={formData.bookAccount}
                    onChange={handleInputChange}
                  />
                  Book A/C
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="kyc"
                    checked={formData.kyc}
                    onChange={handleInputChange}
                  />
                  KYC
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              style={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 