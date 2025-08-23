import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import '../styles/API.css';

export const API = () => {
  const navigate = useNavigate();

  return (
    <div className="api-page-wrapper">
      <Sidebar />
      <div className="api-page-main">
        <Navbar />
        <div className="api-container">
          <div className="api-card">
            <h1 className="api-heading">
              <i className="bi bi-gear me-2"></i>
              API
            </h1>
            <div className="api-button-container">
              <button 
                className="api-button"
                onClick={() => navigate('/sms')}
              >
                <span className="api-button-icon">
                  <i className="bi bi-phone"></i>
                </span>
                <span className="api-button-text">SMS API</span>
              </button>
              <button className="api-button">
                <span className="api-button-icon">
                  <i className="bi bi-globe"></i>
                </span>
                <span className="api-button-text">Radius API</span>
              </button>
              <button 
                className="api-button"
                onClick={() => navigate('/payment-gateway')}
              >
                <span className="api-button-icon">
                  <i className="bi bi-credit-card"></i>
                </span>
                <span className="api-button-text">Payment Gateway</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 