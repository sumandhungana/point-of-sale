import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import '../styles/AddPayments.css';

export const AddPayments: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'online'>('cash');

  return (
    <div className="add-payments-container">
      <Sidebar />
      <div className="add-payments-main">
       
        <div className="add-payments-card">
          <div className="add-payments-form-group">
            <label className="add-payments-label amount">
              <i className="bi bi-currency-dollar me-1"></i>
              Enter Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="add-payments-input"
              placeholder="Enter amount"
            />
          </div>
          <div className="add-payments-form-group">
            <label className="add-payments-label notes">
              <i className="bi bi-journal-text me-1"></i>
              Add Any Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="add-payments-textarea"
              placeholder="Add any notes here..."
            />
          </div>
          <div className="add-payments-form-group">
            <label className="add-payments-label date">
              <i className="bi bi-calendar me-1"></i>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="add-payments-input"
            />
          </div>
          <div className="add-payments-payment-mode-container">
            <button
              className={`add-payments-payment-mode-button ${paymentMode === 'cash' ? 'active' : ''}`}
              onClick={() => setPaymentMode('cash')}
            >
              <i className="bi bi-cash-coin me-1"></i>
              Cash
            </button>
            <button
              className={`add-payments-payment-mode-button ${paymentMode === 'online' ? 'active' : ''}`}
              onClick={() => setPaymentMode('online')}
            >
              <i className="bi bi-credit-card me-1"></i>
              Online
            </button>
          </div>
          <button className="add-payments-save-button">
            <i className="bi bi-check-circle me-2"></i>
            Save Payment
          </button>
        </div>
      </div>
    </div>
  );
}; 