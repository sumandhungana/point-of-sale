import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { createPaymentGateway } from '../services/paymentGatewayService';
import '../styles/AddPaymentGateway.css';

export const AddPaymentGateway = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    paymentMode: '',
    description: '',
    isActive: false,
    imagePath: '',
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
        setFormData(prev => ({
          ...prev,
          imagePath: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPaymentGateway(formData);
      alert('Payment Gateway created successfully!');
      navigate('/payment-gateway');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-payment-gateway-container">
        <Navbar />
        <div className="add-payment-gateway-card">
          <div className="add-payment-gateway-form-card">
            <h1 className="add-payment-gateway-heading">
              <i className="bi bi-credit-card"></i>
              Add Payment Gateway
            </h1>
            <form className="add-payment-gateway-form" onSubmit={handleSubmit}>
              <div className="add-payment-gateway-row">
                <div className="add-payment-gateway-input-group">
                  <label className="add-payment-gateway-label">
                    <i className="bi bi-building"></i>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="add-payment-gateway-input"
                    placeholder="Enter gateway name"
                    required
                  />
                </div>
                <div className="add-payment-gateway-input-group">
                  <label className="add-payment-gateway-label">
                    <i className="bi bi-credit-card-2-front"></i>
                    Payment Mode
                  </label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleInputChange}
                    className="add-payment-gateway-select"
                    required
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="net_banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="add-payment-gateway-input-group">
                <label className="add-payment-gateway-label">
                  <i className="bi bi-chat-text"></i>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="add-payment-gateway-textarea"
                  placeholder="Enter description"
                />
              </div>

              <div className="add-payment-gateway-input-group">
                <div className="add-payment-gateway-checkbox-group">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActive"
                    className="add-payment-gateway-checkbox"
                  />
                  <label htmlFor="isActive" className="add-payment-gateway-label">
                    <i className="bi bi-toggle-on"></i>
                    Is Active
                  </label>
                </div>
              </div>

              <div className="add-payment-gateway-input-group">
                <label className="add-payment-gateway-label">
                  <i className="bi bi-image"></i>
                  Select File
                </label>
                <div 
                  className="add-payment-gateway-image-preview"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: selectedImage ? `url(${selectedImage})` : '#f8f9fa'
                  }}
                >
                  {!selectedImage && (
                    <span className="add-payment-gateway-image-placeholder">
                      <i className="bi bi-image"></i>
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="add-payment-gateway-file-input"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  placeholder="Click to upload file"
                  className="add-payment-gateway-input"
                  readOnly
                  value={formData.imagePath}
                />
              </div>

              <h2 className="add-payment-gateway-section-header">
                <i className="bi bi-gear"></i>
                Configuration
              </h2>

              <div className="add-payment-gateway-input-group">
                <label className="add-payment-gateway-label">
                  <i className="bi bi-link-45deg"></i>
                  Verification URL
                </label>
                <input
                  type="url"
                  name="verificationUrl"
                  value={formData.verificationUrl}
                  onChange={handleInputChange}
                  className="add-payment-gateway-input"
                  placeholder="Enter verification URL"
                  required
                />
              </div>

              <div className="add-payment-gateway-input-group">
                <label className="add-payment-gateway-label">
                  <i className="bi bi-key"></i>
                  Public Key
                </label>
                <input
                  type="text"
                  name="publicKey"
                  value={formData.publicKey}
                  onChange={handleInputChange}
                  className="add-payment-gateway-input"
                  placeholder="Enter public key"
                  required
                />
              </div>

              <div className="add-payment-gateway-input-group">
                <label className="add-payment-gateway-label">
                  <i className="bi bi-shield-lock"></i>
                  Secret Key
                </label>
                <input
                  type="password"
                  name="secretKey"
                  value={formData.secretKey}
                  onChange={handleInputChange}
                  className="add-payment-gateway-input"
                  placeholder="Enter secret key"
                  required
                />
              </div>

              {error && (
                <div className="add-payment-gateway-error">
                  <i className="bi bi-exclamation-triangle"></i>
                  {error}
                </div>
              )}

              <div className="add-payment-gateway-button-group">
                <button 
                  type="submit" 
                  className="add-payment-gateway-save-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="add-payment-gateway-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Save Payment Gateway
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 