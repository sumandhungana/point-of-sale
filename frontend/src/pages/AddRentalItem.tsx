import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export const AddRentalItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rentalItemName: '',
    phoneNumber: '',
    address: '',
    rentalAmount: '',
    rentalPeriod: '',
    startDate: '',
    endDate: '',
    remarks: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
    },
    main: {
      flex: 1,
      padding: '2rem',
      paddingTop: '80px',
    },
    formCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      color: '#212529',
    },
    formRow: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    formGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#495057',
    },
    input: {
      padding: '0.75rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '1rem',
      outline: 'none',
      '&:focus': {
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    textarea: {
      padding: '0.75rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '1rem',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical' as const,
      '&:focus': {
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    dateContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    dateGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    buttonContainer: {
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
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      marginRight: '1rem',
    },
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Add Rental Item</h2>
            <form onSubmit={handleSubmit}>
              {/* First row: Rental Item Name, Phone Number, Address */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Rental Item Name</label>
                  <input
                    type="text"
                    name="rentalItemName"
                    value={formData.rentalItemName}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter rental item name"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter phone number"
                    required
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
                    placeholder="Enter address"
                    required
                  />
                </div>
              </div>

              {/* Second row: Rental Amount, Rental Period */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Rental Amount</label>
                  <input
                    type="number"
                    name="rentalAmount"
                    value={formData.rentalAmount}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter rental amount"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Rental Period</label>
                  <select
                    name="rentalPeriod"
                    value={formData.rentalPeriod}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Select rental period</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Third row: Start Date, End Date */}
              <div style={styles.formRow}>
                <div style={styles.dateGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.dateGroup}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Fourth row: Remarks */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Enter any additional remarks"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={styles.buttonContainer}>
                <button 
                  type="button" 
                  style={styles.cancelButton}
                  onClick={() => navigate('/rental-items')}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveButton}>
                  💾 Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}; 