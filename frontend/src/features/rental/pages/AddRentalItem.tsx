import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { addRental } from '@/features/services/rentalItemService';
import '../../../styles/AddRentalItem.css';

export const AddRentalItem: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTodayDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00`;
  };

  const [formData, setFormData] = useState({
    rentalItemName: '',
    phoneNumber: '',
    address: '',
    rentalAmount: '',
    rentalPeriod: '',
    startDate: getTodayDateTime(),
    endDate: getTodayDateTime(),
    remarks: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addRental({
        ...formData,
        rentalAmount: parseFloat(formData.rentalAmount),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      });
      navigate('/rental-items');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the rental item.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <Navbar />
        <div className="add-rental-item-container">
          <Sidebar />
          <div className="add-rental-item-main">
            <div className="add-rental-item-form-card">

              <div className="add-rental-item-header">
                <h2 className="add-rental-item-form-title">
                  <i className="bi bi-plus-circle me-2 text-primary"></i>
                  Add Rental Item
                </h2>
                <button
                  type="button"
                  className="add-rental-close-btn"
                  onClick={() => navigate('/rental-items')}
                  aria-label="Close"
                  title="Close"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              {error && (
                  <div className="alert alert-danger mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* First row: Rental Item Name, Phone Number, Address */}
                <div className="add-rental-item-form-row">
                  <div className="add-rental-item-form-group">
                    <label className="add-rental-item-label">
                      <i className="bi bi-box me-1"></i>
                      Rental Item Name
                    </label>
                    <input
                        type="text"
                        name="rentalItemName"
                        value={formData.rentalItemName}
                        onChange={handleInputChange}
                        className="add-rental-item-input"
                        placeholder="Enter rental item name"
                        required
                    />
                  </div>

                  <div className="add-rental-item-form-group">
                    <label className="add-rental-item-label">
                      <i className="bi bi-telephone me-1"></i>
                      Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="add-rental-item-input"
                        placeholder="Enter phone number"
                        required
                    />
                  </div>

                  <div className="add-rental-item-form-group">
                    <label className="add-rental-item-label">
                      <i className="bi bi-geo-alt me-1"></i>
                      Address
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="add-rental-item-input"
                        placeholder="Enter address"
                        required
                    />
                  </div>
                </div>

                {/* Second row: Rental Amount, Rental Period */}
                <div className="add-rental-item-form-row">
                  <div className="add-rental-item-form-group">
                    <label className="add-rental-item-label">
                      <i className="bi bi-cash-coin me-1"></i>
                      Rental Amount (रु)
                    </label>
                    <input
                        type="number"
                        name="rentalAmount"
                        value={formData.rentalAmount}
                        onChange={handleInputChange}
                        className="add-rental-item-input"
                        placeholder="Enter rental amount"
                        required
                        step="0.01"
                    />
                  </div>

                  <div className="add-rental-item-form-group">
                    <label className="add-rental-item-label">
                      <i className="bi bi-calendar-range me-1"></i>
                      Rental Period
                    </label>
                    <select
                        name="rentalPeriod"
                        value={formData.rentalPeriod}
                        onChange={handleInputChange}
                        className="add-rental-item-input"
                        required
                    >
                      <option value="">Select rental period</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Third row: Start Date, End Date */}
                <div className="add-rental-item-form-row">
                  <div className="add-rental-item-form-group">
                    <label className="add-rental-item-label">
                      <i className="bi bi-calendar-plus me-1"></i>
                      Start Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="add-rental-item-input"
                        required
                    />
                  </div>

                  <div className="add-rental-item-form-group">
                    <label className="add-rental-item-label">
                      <i className="bi bi-calendar-check me-1"></i>
                      End Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="add-rental-item-input"
                        required
                    />
                  </div>
                </div>

                {/* Fourth row: Remarks */}
                <div className="add-rental-item-form-row">
                  <div className="add-rental-item-form-group full-width">
                    <label className="add-rental-item-label">
                      <i className="bi bi-chat-text me-1"></i>
                      Remarks
                    </label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        className="add-rental-item-textarea"
                        placeholder="Enter any additional remarks or notes"
                        rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons (Sticky Footer) */}
                <div className="add-rental-item-button-container">
                  <button
                      type="button"
                      className="add-rental-item-cancel-button"
                      onClick={() => navigate('/rental-items')}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Cancel
                  </button>
                  <button
                      type="submit"
                      className="add-rental-item-save-button"
                      disabled={loading}
                  >
                    {loading ? (
                        <>
                          <i className="bi bi-arrow-clockwise spin me-1"></i>
                          Saving...
                        </>
                    ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          Save Rental Item
                        </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </>
  );
};