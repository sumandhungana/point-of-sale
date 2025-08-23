import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { createSmsGateway } from '../services/smsService';
import '../styles/AddSMS.css';

export const AddSMS = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partnerName: '',
    active: false,
    form: '',
    token: '',
    apiUrl: '',
    testSms: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTest = () => {
    console.log('Testing SMS...');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createSmsGateway(formData);
      alert('SMS Gateway created successfully!');
      navigate('/sms');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-sms-page-wrapper">
      <Sidebar />
      <div className="add-sms-container">
        <Navbar />
        <div className="add-sms-card">
          <div className="add-sms-form-card">
            <h1 className="add-sms-heading">
              <i className="bi bi-chat-dots"></i>
              Add SMS Gateway
            </h1>
            <form className="add-sms-form" onSubmit={handleSubmit}>
              <div className="add-sms-row">
                <div className="add-sms-input-group">
                  <label className="add-sms-label">
                    <i className="bi bi-building"></i>
                    SMS Partner Name
                  </label>
                  <input
                    type="text"
                    name="partnerName"
                    value={formData.partnerName}
                    onChange={handleInputChange}
                    className="add-sms-input"
                    placeholder="Enter partner name"
                    required
                  />
                </div>
                <div className="add-sms-input-group">
                  <label className="add-sms-label">&nbsp;</label>
                  <div className="add-sms-checkbox-group">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      id="active"
                      className="add-sms-checkbox"
                    />
                    <label htmlFor="active" className="add-sms-label">
                      <i className="bi bi-toggle-on"></i>
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="add-sms-row">
                <div className="add-sms-input-group">
                  <label className="add-sms-label">
                    <i className="bi bi-file-text"></i>
                    Form
                  </label>
                  <input
                    type="text"
                    name="form"
                    value={formData.form}
                    onChange={handleInputChange}
                    className="add-sms-input"
                    placeholder="Enter form"
                    required
                  />
                </div>
                <div className="add-sms-input-group">
                  <label className="add-sms-label">
                    <i className="bi bi-key"></i>
                    Token
                  </label>
                  <input
                    type="text"
                    name="token"
                    value={formData.token}
                    onChange={handleInputChange}
                    className="add-sms-input"
                    placeholder="Enter token"
                    required
                  />
                </div>
              </div>

              <div className="add-sms-input-group">
                <label className="add-sms-label">
                  <i className="bi bi-link-45deg"></i>
                  SMS API URL
                </label>
                <input
                  type="url"
                  name="apiUrl"
                  value={formData.apiUrl}
                  onChange={handleInputChange}
                  className="add-sms-input"
                  placeholder="Enter API URL"
                  required
                />
              </div>

              <div className="add-sms-test-row">
                <div className="add-sms-test-input-group">
                  <label className="add-sms-label">
                    <i className="bi bi-chat"></i>
                    Test SMS
                  </label>
                  <input
                    type="text"
                    name="testSms"
                    value={formData.testSms}
                    onChange={handleInputChange}
                    className="add-sms-input"
                    placeholder="Enter test message"
                  />
                </div>
                <div className="add-sms-test-button-container">
                  <button 
                    type="button" 
                    className="add-sms-test-button"
                    onClick={handleTest}
                  >
                    <i className="bi bi-play-circle"></i>
                    Test
                  </button>
                </div>
              </div>

              {error && (
                <div className="add-sms-error">
                  <i className="bi bi-exclamation-triangle"></i>
                  {error}
                </div>
              )}

              <div className="add-sms-button-group">
                <button 
                  type="submit" 
                  className="add-sms-save-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="add-sms-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Save SMS Gateway
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