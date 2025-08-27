import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/Bills.css';

export const Bills: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="bills-container">
        <Navbar />
        <div className="bills-content">
          <div className="bills-header">
            <h1>Bills Management</h1>
            <p>Manage and track all your bills and invoices</p>
          </div>
          
          <div className="bills-stats">
            <div className="bills-stat-card">
              <div className="bills-stat-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="bills-stat-info">
                <h3>Total Bills</h3>
                <p className="bills-stat-number">1,247</p>
                <span className="bills-stat-change positive">+12% this month</span>
              </div>
            </div>
            
            <div className="bills-stat-card">
              <div className="bills-stat-icon">
                <i className="bi bi-currency-dollar"></i>
              </div>
              <div className="bills-stat-info">
                <h3>Total Amount</h3>
                <p className="bills-stat-number">₹2,45,000</p>
                <span className="bills-stat-change positive">+8% this month</span>
              </div>
            </div>
            
            <div className="bills-stat-card">
              <div className="bills-stat-icon">
                <i className="bi bi-clock"></i>
              </div>
              <div className="bills-stat-info">
                <h3>Pending Bills</h3>
                <p className="bills-stat-number">23</p>
                <span className="bills-stat-change negative">-5% this month</span>
              </div>
            </div>
            
            <div className="bills-stat-card">
              <div className="bills-stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="bills-stat-info">
                <h3>Paid Bills</h3>
                <p className="bills-stat-number">1,224</p>
                <span className="bills-stat-change positive">+15% this month</span>
              </div>
            </div>
          </div>
          
          <div className="bills-actions">
            <div className="bills-search">
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                placeholder="Search bills..."
                className="bills-search-input"
              />
            </div>
            
            <div className="bills-filters">
              <select className="bills-filter-select">
                <option value="">All Types</option>
                <option value="sales">Sales Bills</option>
                <option value="purchase">Purchase Bills</option>
                <option value="expenses">Expense Bills</option>
                <option value="income">Income Bills</option>
              </select>
              
              <select className="bills-filter-select">
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            <button className="bills-action-button">
              <i className="bi bi-plus"></i>
              Create New Bill
            </button>
          </div>
          
          <div className="bills-placeholder">
            <div className="bills-placeholder-icon">
              <i className="bi bi-receipt"></i>
            </div>
            <h3>No Bills Found</h3>
            <p>Start creating bills to track your business transactions</p>
            <button className="bills-action-button">
              <i className="bi bi-plus"></i>
              Create Your First Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 