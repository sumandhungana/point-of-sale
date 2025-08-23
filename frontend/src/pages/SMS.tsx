import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchSmsGateways } from '../services/smsService';
import '../styles/SMS.css';

interface SmsGateway {
  id: number;
  partnerName: string;
  active: boolean;
  form: string;
  token: string;
  apiUrl: string;
  testSms: string | null;
  createdAt: string;
  updatedAt: string;
}

export const SMS = () => {
  const navigate = useNavigate();
  const [smsGateways, setSmsGateways] = useState<SmsGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSmsGatewaysList = async () => {
      try {
        const data = await fetchSmsGateways();
        setSmsGateways(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchSmsGatewaysList();
  }, []);

  const filteredGateways = smsGateways.filter(gateway =>
    gateway.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gateway.form.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="sms-container">
          <Navbar />
          <div className="sms-loading-message">
            <i className="bi bi-arrow-clockwise"></i>
            Loading SMS gateways...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="sms-container">
          <Navbar />
          <div className="sms-error-message">
            <i className="bi bi-exclamation-triangle"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="sms-container">
        <Navbar />
        <div className="sms-card">
          <div className="sms-form-card">
            <div className="sms-header">
              <input
                type="text"
                placeholder="Search by partner or form..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sms-search-bar"
              />
            </div>

            <h2 className="sms-section-header">
              <i className="bi bi-chat-dots"></i>
              SMS Gateway
            </h2>
            
            <div className="sms-table-container">
              <table className="sms-table">
                <thead>
                  <tr>
                    <th className="sms-table-header">
                      <i className="bi bi-hash"></i>
                      ID
                    </th>
                    <th className="sms-table-header">
                      <i className="bi bi-building"></i>
                      Partner Name
                    </th>
                    <th className="sms-table-header">
                      <i className="bi bi-file-text"></i>
                      Form
                    </th>
                    <th className="sms-table-header">
                      <i className="bi bi-link-45deg"></i>
                      API URL
                    </th>
                    <th className="sms-table-header">
                      <i className="bi bi-circle-fill"></i>
                      Status
                    </th>
                    <th className="sms-table-header">
                      <i className="bi bi-chat"></i>
                      Test SMS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGateways.map((gateway) => (
                    <tr key={gateway.id} className="sms-table-row">
                      <td className="sms-table-cell">{gateway.id}</td>
                      <td className="sms-table-cell">{gateway.partnerName}</td>
                      <td className="sms-table-cell">{gateway.form}</td>
                      <td className="sms-table-cell">{gateway.apiUrl}</td>
                      <td className="sms-table-cell">
                        <span className={`sms-status-badge ${gateway.active ? 'sms-status-active' : 'sms-status-inactive'}`}>
                          {gateway.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="sms-table-cell">{gateway.testSms || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sms-button-container">
              <button 
                className="sms-add-button"
                onClick={() => navigate('/add-sms')}
              >
                <i className="bi bi-plus-circle"></i>
                Add SMS Gateway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 