import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BackButton } from '../components/BackButton';
import '../styles/Branch.css';

export const Branch: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="branch-container">
        <Navbar />
        <div className="branch-content">
          <div className="branch-header" style={{ position: 'relative', minHeight: '120px' }}>
            <BackButton 
              to="/dashboard" 
              label="Back to Dashboard" 
              className="below-navbar"
            />
            <h1>Branch Management</h1>
            <p>Manage your business branches and locations</p>
          </div>
          
          <div className="branch-card">
            <div className="branch-info">
              <div className="branch-icon">
                <i className="bi bi-building"></i>
              </div>
              <div className="branch-details">
                <h2>Main Branch</h2>
                <p>Primary business location</p>
                <div className="branch-stats">
                  <span className="branch-stat">
                    <i className="bi bi-people"></i>
                    Staff: 15
                  </span>
                  <span className="branch-stat">
                    <i className="bi bi-box"></i>
                    Items: 250
                  </span>
                  <span className="branch-stat">
                    <i className="bi bi-graph-up"></i>
                    Sales: ₹45,000
                  </span>
                </div>
              </div>
            </div>
            
            <div className="branch-actions">
              <button className="branch-button branch-primary">
                <i className="bi bi-pencil"></i>
                Edit Branch
              </button>
              <button className="branch-button branch-secondary">
                <i className="bi bi-plus"></i>
                Add New Branch
              </button>
            </div>
          </div>
          
          <div className="branch-placeholder">
            <div className="branch-placeholder-icon">
              <i className="bi bi-building-add"></i>
            </div>
            <h3>No Additional Branches</h3>
            <p>Create additional branches to manage multiple locations</p>
            <button className="branch-button branch-primary">
              <i className="bi bi-plus"></i>
              Add First Branch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 