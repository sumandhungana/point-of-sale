
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../../styles/AddPayments.css';
import { createPayment, AddPaymentPayload } from '../services/paymentService'; // Update path as needed

interface AddPaymentsModalProps {
  isOpen: boolean;
  staffId: number;
  onClose: () => void;
  onSave?: (paymentData: { amount: string; notes: string; date: string; paymentMode: 'cash' | 'online' }) => void;
}

export const AddPayments: React.FC<AddPaymentsModalProps> = ({ isOpen, staffId, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'online'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: AddPaymentPayload = {
      paymentParty: 'STAFF',
      paymentCategory: 'GIVEN',
      staffId: staffId,
      amount: parseFloat(amount) || 0,
      paymentType: paymentMode === 'cash' ? 'CASH' : 'CARD',
      remarks: notes,
    };

    setIsSubmitting(true);
    try {
      await createPayment(payload);
      toast.success('Payment added successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      if (onSave) {
        onSave({ amount, notes, date, paymentMode });
      }

      onClose();
    } catch (error) {
      console.error('Failed to submit payment:', error);
      toast.error( 'Failed to submit payment. Please try again.', {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="add-payments-modal-overlay" onClick={onClose}>
        <div
            className="add-payments-modal-content"
            onClick={(e) => e.stopPropagation()}
        >
          {/* Top Right Close Button */}
          <button
              type="button"
              className="add-payments-modal-close-icon"
              onClick={onClose}
              aria-label="Close"
              disabled={isSubmitting}
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <div className="add-payments-modal-header">
            <h3>
              <i className="bi bi-plus-circle me-2"></i>
              Add Payment
            </h3>
          </div>

          <div className="add-payments-modal-body">
            <form onSubmit={handleSubmit} className="add-payments-card">
              <div className="add-payments-form-group">
                <label className="add-payments-label amount">
                  <i className="bi bi-currency-dollar me-1"></i>
                  Enter Amount
                </label>
                <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="add-payments-input"
                    placeholder="Enter amount"
                    required
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    required
                    disabled={isSubmitting}
                />
              </div>

              <div className="add-payments-payment-mode-container">
                <button
                    type="button"
                    className={`add-payments-payment-mode-button ${paymentMode === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMode('cash')}
                    disabled={isSubmitting}
                >
                  <i className="bi bi-cash-coin me-1"></i>
                  Cash
                </button>
                <button
                    type="button"
                    className={`add-payments-payment-mode-button ${paymentMode === 'online' ? 'active' : ''}`}
                    onClick={() => setPaymentMode('online')}
                    disabled={isSubmitting}
                >
                  <i className="bi bi-credit-card me-1"></i>
                  Online
                </button>
              </div>

              <button type="submit" className="add-payments-save-button" disabled={isSubmitting}>
                <i className="bi bi-check-circle me-2"></i>
                {isSubmitting ? 'Saving...' : 'Save Payment'}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};