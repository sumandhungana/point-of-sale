import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { createNewKhataBook, CreateKhatBookRequest } from '../../services/khataBookService';
import '../../../styles/AddKhataBook.css';

export const AddKhataBook = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationPhoneNumber: '',
    organizationEmail: '',
    panVatNumber: '',
    branch: '',
    organizationType: '',
    organizationAddress: '',
    notes: ''
  });

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.organizationPhoneNumber.trim()) {
      toast.error('Password is required!');
      return;
    }
    if (!formData.organizationName.trim()) {
      toast.error('Organization Name is required!');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateKhatBookRequest = {
        ...formData
      };

      await createNewKhataBook(payload);
      toast.success('Khata Book created successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error creating Khata Book:', error);
      toast.error(
          error instanceof Error ? error.message : 'Failed to create Khata Book. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="add-khatabook-page-wrapper">
        <Sidebar />
        <div className="add-khatabook-page-main">
          <Navbar />
          <div className="add-khata-book-container">
            <form onSubmit={handleSubmit}>
              {/* User Credentials & Personal Info */}
              {/* Organization Info */}
              <div className="add-khata-book-section">
                <h2 className="add-khata-book-section-title">
                  <i className="bi bi-building me-2"></i>
                  Organization Details
                </h2>
                <div className="add-khata-book-form-grid">
                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-building me-1"></i>
                      Organization Name <span>*</span>
                    </label>
                    <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Business / Shop Name"
                        required
                    />
                  </div>
                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-building me-1"></i>
                      Organization Contact Number <span>*</span>
                    </label>
                    <input
                        type="text"
                        name="organizationPhoneNumber"
                        value={formData.organizationPhoneNumber}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Business / Shop Contact Number"
                        required
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-building me-1"></i>
                      Organization  Gmail/Email
                    </label>
                    <input
                        type="email"
                        name="organizationEmail"
                        value={formData.organizationEmail}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Business / Shop Email Address"
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label">
                      <i className="bi bi-card-text me-1"></i>
                      PAN / VAT Number
                    </label>
                    <input
                        type="text"
                        name="panVatNumber"
                        value={formData.panVatNumber}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Enter PAN/VAT Number"
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label">
                      <i className="bi bi-diagram-3 me-1"></i>
                      Branch
                    </label>
                    <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="e.g. Kathmandu, Pokhara"
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label">
                      <i className="bi bi-briefcase me-1"></i>
                      Organization Type
                    </label>
                    <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        className="add-khata-book-select"
                    >
                      <option value="">Select organization type</option>
                      <option value="Individual">Individual</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="Non Profit">Non Profit Organization</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="add-khata-book-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="add-khata-book-label">
                      <i className="bi bi-geo-alt me-1"></i>
                      Organization Address <span>*</span>
                    </label>
                    <input
                        type="text"
                        name="organizationAddress"
                        value={formData.organizationAddress}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Physical address"
                        required
                    />
                  </div>

                  <div className="add-khata-book-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="add-khata-book-label">
                      <i className="bi bi-journal-text me-1"></i>
                      Notes
                    </label>
                    <input
                        type="text"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Optional onboarding remarks"
                    />
                  </div>
                </div>
              </div>

              <button
                  type="submit"
                  className="add-khata-book-save-button"
                  disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <>
                      <i className="bi bi-arrow-clockwise spin me-2"></i>
                      Saving...
                    </>
                ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Khata Book
                    </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};