import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchPaymentGateways } from '../services/paymentGatewayService';
import '../styles/PaymentGateway.css';

interface PaymentGateway {
  id: number;
  name: string;
  paymentMode: string;
  description: string;
  isActive: boolean;
  imagePath: string | null;
  verificationUrl: string;
  publicKey: string;
  secretKey: string;
  createdAt: string;
  updatedAt: string;
}

export const PaymentGateway = () => {
  const navigate = useNavigate();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGatewaysList = async () => {
      try {
        const data = await fetchPaymentGateways();
        setGateways(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchGatewaysList();
  }, []);

  const filteredGateways = gateways.filter(gateway =>
    gateway.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gateway.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="payment-gateway-container">
          <Navbar />
          <div className="payment-gateway-loading-message">
            <i className="bi bi-arrow-clockwise"></i>
            Loading payment gateways...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="payment-gateway-container">
          <Navbar />
          <div className="payment-gateway-error-message">
            <i className="bi bi-exclamation-triangle"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-gateway-page-wrapper">
      <Sidebar />
      <div className="payment-gateway-container">
        <Navbar />
        <div className="payment-gateway-card">
          <div className="payment-gateway-form-card">
            <div className="payment-gateway-header">
              <input
                type="text"
                placeholder="Search by name or payment mode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="payment-gateway-search-bar"
              />
            </div>

            <h2 className="payment-gateway-section-header">
              <i className="bi bi-credit-card"></i>
              Payment Gateway List
            </h2>
            
            <div className="payment-gateway-table-container">
              <table className="payment-gateway-table">
                <thead>
                  <tr>
                    <th className="payment-gateway-table-header">
                      <i className="bi bi-hash"></i>
                      ID
                    </th>
                    <th className="payment-gateway-table-header">
                      <i className="bi bi-building"></i>
                      Name
                    </th>
                    <th className="payment-gateway-table-header">
                      <i className="bi bi-credit-card-2-front"></i>
                      Payment Mode
                    </th>
                    <th className="payment-gateway-table-header">
                      <i className="bi bi-chat-text"></i>
                      Description
                    </th>
                    <th className="payment-gateway-table-header">
                      <i className="bi bi-circle-fill"></i>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGateways.map((gateway) => (
                    <tr key={gateway.id} className="payment-gateway-table-row">
                      <td className="payment-gateway-table-cell">{gateway.id}</td>
                      <td className="payment-gateway-table-cell">{gateway.name}</td>
                      <td className="payment-gateway-table-cell">{gateway.paymentMode}</td>
                      <td className="payment-gateway-table-cell">{gateway.description}</td>
                      <td className="payment-gateway-table-cell">
                        <span className={`payment-gateway-status-badge ${gateway.isActive ? 'payment-gateway-status-active' : 'payment-gateway-status-inactive'}`}>
                          {gateway.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="payment-gateway-button-container">
              <button 
                className="payment-gateway-add-button"
                onClick={() => navigate('/add-payment-gateway')}
              >
                <i className="bi bi-plus-circle"></i>
                Add Gateway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 