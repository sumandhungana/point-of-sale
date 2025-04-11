import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const BillsAndPrintSelling = () => {
  const [formData, setFormData] = useState({
    premiumBill: '',
    thermalBill: '',
    basicBill: '',
    regularPrinter: {
      field1: '',
      field2: '',
      field3: '',
    },
    thermalPrinter: {
      field1: '',
      field2: '',
      field3: '',
    },
    companyInfo: {
      companyName: false,
      companyLogo: false,
      address: false,
      email: false,
      phone: false,
      panVat: false,
    },
    companyValues: {
      companyName: '',
      companyLogo: '',
      address: '',
      email: '',
      phone: '',
      panVat: '',
    },
    authorizedSignature: false,
    authorizedSignatureText: '',
    changeSignature: '',
    paperSize: '',
    orientation: '',
    companyNameTextSize: '',
    invoiceTaxSize: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem',
    },
    row: {
      display: 'flex',
      gap: '2rem',
      marginBottom: '1rem',
    },
    inputGroup: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      color: '#495057',
      fontWeight: '500',
    },
    checkbox: {
      margin: 0,
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
    },
    printerLabel: {
      textAlign: 'center' as const,
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1rem',
    },
    link: {
      color: '#007bff',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
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
          {/* Invoice Setting Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>Invoice Setting</h2>
            <div style={styles.card}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="premiumBill"
                    value={formData.premiumBill}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Premium Bill"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="thermalBill"
                    value={formData.thermalBill}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Thermal Bill"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="basicBill"
                    value={formData.basicBill}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Basic Bill"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Style Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>Invoice Style</h2>
            <div style={styles.card}>
              <div style={styles.printerLabel}>Regular Printer</div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="regularPrinter.field1"
                    value={formData.regularPrinter.field1}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Field 1"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="regularPrinter.field2"
                    value={formData.regularPrinter.field2}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Field 2"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="regularPrinter.field3"
                    value={formData.regularPrinter.field3}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Field 3"
                  />
                </div>
              </div>

              <div style={styles.printerLabel}>Thermal Printer</div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="thermalPrinter.field1"
                    value={formData.thermalPrinter.field1}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Field 1"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="thermalPrinter.field2"
                    value={formData.thermalPrinter.field2}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Field 2"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="thermalPrinter.field3"
                    value={formData.thermalPrinter.field3}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Field 3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Info and Header Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>Company Info and Header</h2>
            <div style={styles.card}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <input
                    type="checkbox"
                    name="companyInfo.companyName"
                    checked={formData.companyInfo.companyName}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <input
                    type="text"
                    name="companyValues.companyName"
                    value={formData.companyValues.companyName}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Company Name"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="checkbox"
                    name="companyInfo.companyLogo"
                    checked={formData.companyInfo.companyLogo}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <input
                    type="text"
                    name="companyValues.companyLogo"
                    value={formData.companyValues.companyLogo}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Company Logo"
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <input
                    type="checkbox"
                    name="companyInfo.address"
                    checked={formData.companyInfo.address}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <input
                    type="text"
                    name="companyValues.address"
                    value={formData.companyValues.address}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Address"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="checkbox"
                    name="companyInfo.email"
                    checked={formData.companyInfo.email}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <input
                    type="email"
                    name="companyValues.email"
                    value={formData.companyValues.email}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Email"
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <input
                    type="checkbox"
                    name="companyInfo.phone"
                    checked={formData.companyInfo.phone}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <input
                    type="text"
                    name="companyValues.phone"
                    value={formData.companyValues.phone}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Phone"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="checkbox"
                    name="companyInfo.panVat"
                    checked={formData.companyInfo.panVat}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <input
                    type="text"
                    name="companyValues.panVat"
                    value={formData.companyValues.panVat}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="PAN/VAT"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>Footer</h2>
            <div style={styles.card}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <input
                    type="checkbox"
                    name="authorizedSignature"
                    checked={formData.authorizedSignature}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <input
                    type="text"
                    name="authorizedSignatureText"
                    value={formData.authorizedSignatureText}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Authorized Signature"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    name="changeSignature"
                    value={formData.changeSignature}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Change Signature"
                  />
                </div>
              </div>

              <div style={styles.row}>
                <a href="#" style={styles.link}>Terms and Conditions</a>
              </div>
            </div>
          </div>

          {/* Bill Size Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>Bill Size</h2>
            <div style={styles.card}>
              <div style={{...styles.row, flexDirection: 'column', gap: '1rem'}}>
                <div style={styles.inputGroup}>
                  <select
                    name="paperSize"
                    value={formData.paperSize}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Select Paper Size</option>
                    <option value="a4">A4</option>
                    <option value="a5">A5</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <select
                    name="orientation"
                    value={formData.orientation}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Select Orientation</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <select
                    name="companyNameTextSize"
                    value={formData.companyNameTextSize}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Company Name Text Size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <select
                    name="invoiceTaxSize"
                    value={formData.invoiceTaxSize}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Invoice Tax Size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 