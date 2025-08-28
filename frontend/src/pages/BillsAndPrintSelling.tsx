import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BackButton } from '../components/BackButton';
import { fetchInvoiceSettings, saveInvoiceSettings } from '../services/appSettingService';
import '../styles/BillsAndPrintSelling.css';

export const BillsAndPrintSelling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    isUpdated: false,
    id: NaN,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await fetchInvoiceSettings();
        if (data.length > 0) {
          const lowestIdSetting = data.reduce((prev: any, current: any) => 
            prev.id < current.id ? prev : current
          );
          setFormData({
            isUpdated:   true,
            id: lowestIdSetting.id,
            premiumBill: lowestIdSetting.premiumBill || '',
            thermalBill: lowestIdSetting.thermalBill || '',
            basicBill: lowestIdSetting.basicBill || '',
            regularPrinter: {
              field1: lowestIdSetting.regularPrinterField1 || '',
              field2: lowestIdSetting.regularPrinterField2 || '',
              field3: lowestIdSetting.regularPrinterField3 || '',
            },
            thermalPrinter: {
              field1: lowestIdSetting.thermalPrinterField1 || '',
              field2: lowestIdSetting.thermalPrinterField2 || '',
              field3: lowestIdSetting.thermalPrinterField3 || '',
            },
            companyInfo: {
              companyName: lowestIdSetting.showCompanyName || false,
              companyLogo: lowestIdSetting.showCompanyLogo || false,
              address: lowestIdSetting.showAddress || false,
              email: lowestIdSetting.showEmail || false,
              phone: lowestIdSetting.showPhone || false,
              panVat: lowestIdSetting.showPanVat || false,
            },
            companyValues: {
              companyName: lowestIdSetting.companyName || '',
              companyLogo: lowestIdSetting.companyLogo || '',
              address: lowestIdSetting.address || '',
              email: lowestIdSetting.email || '',
              phone: lowestIdSetting.phone || '',
              panVat: lowestIdSetting.panVat || '',
            },
            authorizedSignature: lowestIdSetting.showAuthorizedSignature || false,
            authorizedSignatureText: lowestIdSetting.authorizedSignatureText || '',
            changeSignature: lowestIdSetting.changeSignature || '',
            paperSize: lowestIdSetting.paperSize || '',
            orientation: lowestIdSetting.orientation || '',
            companyNameTextSize: lowestIdSetting.companyNameTextSize || '',
            invoiceTaxSize: lowestIdSetting.invoiceTaxSize || '',
          });
        }
      } catch (err) {
        setError('Failed to fetch invoice settings');
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Handle nested printer fields
    if (name.startsWith('regularPrinter.') || name.startsWith('thermalPrinter.')) {
      const [printerType, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [printerType]: {
          ...(prev[printerType as keyof typeof prev] as Record<string, any>),
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } 
    // Handle companyInfo fields
    else if (name.startsWith('companyInfo.')) {
      const [_, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          ...prev.companyInfo,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    }
    // Handle companyValues fields
    else if (name.startsWith('companyValues.')) {
      const [_, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        companyValues: {
          ...prev.companyValues,
          [field]: value
        }
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await saveInvoiceSettings({
        id: formData.id,
        premiumBill: formData.premiumBill,
        thermalBill: formData.thermalBill,
        basicBill: formData.basicBill,
        regularPrinterField1: formData.regularPrinter.field1,
        regularPrinterField2: formData.regularPrinter.field2,
        regularPrinterField3: formData.regularPrinter.field3,
        thermalPrinterField1: formData.thermalPrinter.field1,
        thermalPrinterField2: formData.thermalPrinter.field2,
        thermalPrinterField3: formData.thermalPrinter.field3,
        showCompanyName: formData.companyInfo.companyName,
        showCompanyLogo: formData.companyInfo.companyLogo,
        showAddress: formData.companyInfo.address,
        showEmail: formData.companyInfo.email,
        showPhone: formData.companyInfo.phone,
        showPanVat: formData.companyInfo.panVat,
        companyName: formData.companyValues.companyName,
        companyLogo: formData.companyValues.companyLogo,
        address: formData.companyValues.address,
        email: formData.companyValues.email,
        phone: formData.companyValues.phone,
        panVat: formData.companyValues.panVat,
        showAuthorizedSignature: formData.authorizedSignature,
        authorizedSignatureText: formData.authorizedSignatureText,
        changeSignature: formData.changeSignature,
        paperSize: formData.paperSize,
        orientation: formData.orientation,
        companyNameTextSize: formData.companyNameTextSize,
        invoiceTaxSize: formData.invoiceTaxSize,
      }, formData.isUpdated, formData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bills-container">
      <Sidebar />
      <div className="bills-main-content">
        <Navbar />
        <div className="bills-form-container" style={{ position: 'relative', minHeight: '120px' }}>
          <BackButton 
            to="/app-settings" 
            label="Back to Settings" 
            className="below-navbar"
          />
          <form onSubmit={handleSubmit}>
            {/* Invoice Setting Section */}
            <div className="bills-section">
              <h2 className="bills-section-header">
                <i className="bi bi-gear-fill"></i>
                Invoice Setting
              </h2>
              <div className="bills-card">
                <div className="bills-row">
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="premiumBill"
                      value={formData.premiumBill}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Premium Bill"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="thermalBill"
                      value={formData.thermalBill}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Thermal Bill"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="basicBill"
                      value={formData.basicBill}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Basic Bill"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Style Section */}
            <div className="bills-section">
              <h2 className="bills-section-header">
                <i className="bi bi-printer-fill"></i>
                Invoice Style
              </h2>
              <div className="bills-card">
                <div className="bills-printer-label">
                  <i className="bi bi-printer me-2"></i>
                  Regular Printer
                </div>
                <div className="bills-row">
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="regularPrinter.field1"
                      value={formData.regularPrinter.field1}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Field 1"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="regularPrinter.field2"
                      value={formData.regularPrinter.field2}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Field 2"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="regularPrinter.field3"
                      value={formData.regularPrinter.field3}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Field 3"
                    />
                  </div>
                </div>

                <div className="bills-printer-label">
                  <i className="bi bi-thermal-printer me-2"></i>
                  Thermal Printer
                </div>
                <div className="bills-row">
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="thermalPrinter.field1"
                      value={formData.thermalPrinter.field1}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Field 1"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="thermalPrinter.field2"
                      value={formData.thermalPrinter.field2}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Field 2"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="thermalPrinter.field3"
                      value={formData.thermalPrinter.field3}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Field 3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info and Header Section */}
            <div className="bills-section">
              <h2 className="bills-section-header">
                <i className="bi bi-building-fill"></i>
                Company Info and Header
              </h2>
              <div className="bills-card">
                <div className="bills-row">
                  <div className="bills-input-group">
                    <input
                      type="checkbox"
                      name="companyInfo.companyName"
                      checked={formData.companyInfo.companyName}
                      onChange={handleInputChange}
                      className="bills-checkbox"
                    />
                    <input
                      type="text"
                      name="companyValues.companyName"
                      value={formData.companyValues.companyName}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="checkbox"
                      name="companyInfo.companyLogo"
                      checked={formData.companyInfo.companyLogo}
                      onChange={handleInputChange}
                      className="bills-checkbox"
                    />
                    <input
                      type="text"
                      name="companyValues.companyLogo"
                      value={formData.companyValues.companyLogo}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Company Logo"
                    />
                  </div>
                </div>

                <div className="bills-row">
                  <div className="bills-input-group">
                    <input
                      type="checkbox"
                      name="companyInfo.address"
                      checked={formData.companyInfo.address}
                      onChange={handleInputChange}
                      className="bills-checkbox"
                    />
                    <input
                      type="text"
                      name="companyValues.address"
                      value={formData.companyValues.address}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Address"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="checkbox"
                      name="companyInfo.email"
                      checked={formData.companyInfo.email}
                      onChange={handleInputChange}
                      className="bills-checkbox"
                    />
                    <input
                      type="email"
                      name="companyValues.email"
                      value={formData.companyValues.email}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Email"
                    />
                  </div>
                </div>

                <div className="bills-row">
                  <div className="bills-input-group">
                    <input
                      type="checkbox"
                      name="companyInfo.phone"
                      checked={formData.companyInfo.phone}
                      onChange={handleInputChange}
                      className="bills-checkbox"
                    />
                    <input
                      type="text"
                      name="companyValues.phone"
                      value={formData.companyValues.phone}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="checkbox"
                      name="companyInfo.panVat"
                      checked={formData.companyInfo.panVat}
                      onChange={handleInputChange}
                      className="bills-checkbox"
                    />
                    <input
                      type="text"
                      name="companyValues.panVat"
                      value={formData.companyValues.panVat}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="PAN/VAT"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="bills-section">
              <h2 className="bills-section-header">
                <i className="bi bi-file-text-fill"></i>
                Footer
              </h2>
              <div className="bills-card">
                <div className="bills-row">
                  <div className="bills-input-group">
                    <input
                      type="checkbox"
                      name="authorizedSignature"
                      checked={formData.authorizedSignature}
                      onChange={handleInputChange}
                      className="bills-checkbox"
                    />
                    <input
                      type="text"
                      name="authorizedSignatureText"
                      value={formData.authorizedSignatureText}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Authorized Signature"
                    />
                  </div>
                  <div className="bills-input-group">
                    <input
                      type="text"
                      name="changeSignature"
                      value={formData.changeSignature}
                      onChange={handleInputChange}
                      className="bills-input"
                      placeholder="Change Signature"
                    />
                  </div>
                </div>

                <div className="bills-row">
                  <a href="#" className="bills-link">
                    <i className="bi bi-file-earmark-text"></i>
                    Terms and Conditions
                  </a>
                </div>
              </div>
            </div>

            {/* Bill Size Section */}
            <div className="bills-section">
              <h2 className="bills-section-header">
                <i className="bi bi-arrows-fullscreen"></i>
                Bill Size
              </h2>
              <div className="bills-card">
                <div className="bills-column-layout">
                  <div className="bills-input-group">
                    <select
                      name="paperSize"
                      value={formData.paperSize}
                      onChange={handleInputChange}
                      className="bills-select"
                    >
                      <option value="">Select Paper Size</option>
                      <option value="a4">A4</option>
                      <option value="a5">A5</option>
                      <option value="letter">Letter</option>
                    </select>
                  </div>
                  <div className="bills-input-group">
                    <select
                      name="orientation"
                      value={formData.orientation}
                      onChange={handleInputChange}
                      className="bills-select"
                    >
                      <option value="">Select Orientation</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                  <div className="bills-input-group">
                    <select
                      name="companyNameTextSize"
                      value={formData.companyNameTextSize}
                      onChange={handleInputChange}
                      className="bills-select"
                    >
                      <option value="">Company Name Text Size</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div className="bills-input-group">
                    <select
                      name="invoiceTaxSize"
                      value={formData.invoiceTaxSize}
                      onChange={handleInputChange}
                      className="bills-select"
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

            {error && (
              <div className="bills-error-message">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="bills-save-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  Save Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 