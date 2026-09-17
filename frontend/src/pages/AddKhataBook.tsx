import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { createKhataBook } from '../services/khataBookService';
import '../styles/AddKhataBook.css';

export const AddKhataBook = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    address: '',
    email: '',
    companyName: '',
    companyNumber: '',
    companyAddress: '',
    companyEmail: '',
    businessCategory: '',
    businessType: '',
    imagepath: '',
    taxVat: false,
    bookAccount: false,
    kyc: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create a preview URL for the image
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imagepath: imageUrl
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required field
    if (!formData.name.trim()) {
      toast.error('Name is required!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'imagepath') {
          // Only send non-empty values for optional fields
          if (value !== '' || key === 'name') {
          formDataToSend.append(key, value.toString());
          }
        }
      });
      if (selectedImage) {
        formDataToSend.append('imageFile', selectedImage);
      }
      await createKhataBook(formDataToSend);
      toast.success('Khata Book created successfully!');
      // navigate('/khata-books');
    } catch (error) {
      console.error('Error creating Khata Book:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create Khata Book. Please try again.');
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
            {/* Image Section */}
            <div className="add-khata-book-image-section">
              <div 
                className={`add-khata-book-image-placeholder ${formData.imagepath ? 'has-image' : ''}`}
                style={formData.imagepath ? { backgroundImage: `url(${formData.imagepath})` } : {}}
              >
                {!formData.imagepath && (
                  <i className="bi bi-person-circle"></i>
                )}
                
              </div>

              <button 
                type="button" 
                className="add-khata-book-add-photo-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="bi bi-camera me-1"></i>
                {formData.imagepath ? 'Change Logo' : 'Add Logo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="add-khata-book-hidden-file-input"
                accept="image/*"
                onChange={handleImageSelect}
              />
              
            </div>

            {/* Personal Info Section */}
            <div className="add-khata-book-section">
              <h2 className="add-khata-book-section-title">
                <i className="bi bi-person me-2"></i>
                Personal Info
              </h2>
              <div className="add-khata-book-form-grid">
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label required">
                    <i className="bi bi-person me-1"></i>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                    required
                  />
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-telephone me-1"></i>
                    Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                  />
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-geo-alt me-1"></i>
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                  />
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-envelope me-1"></i>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                  />
                </div>
              </div>
            </div>

            {/* Business Info Section */}
            <div className="add-khata-book-section">
              <h2 className="add-khata-book-section-title">
                <i className="bi bi-building me-2"></i>
                Business Info
              </h2>
              <div className="add-khata-book-form-grid">
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-building me-1"></i>
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                  />
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-telephone me-1"></i>
                    Company Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="companyNumber"
                    value={formData.companyNumber}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                  />
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-geo-alt me-1"></i>
                    Company Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                  />
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-envelope me-1"></i>
                    Company Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    className="add-khata-book-input"
                  />
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-tags me-1"></i>
                    Business Category (Optional)
                  </label>
                  <select
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    className="add-khata-book-select"
                  >
                    <option value="">Select Category</option>
                    <option value="0">Retail</option>
                    <option value="1">Wholesale</option>
                    <option value="2">Manufacturing</option>
                    <option value="3">Service</option>
                  </select>
                </div>
                <div className="add-khata-book-form-group">
                  <label className="add-khata-book-label">
                    <i className="bi bi-briefcase me-1"></i>
                    Business Type (Optional)
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="add-khata-book-select"
                  >
                    <option value="">Select Type</option>
                    <option value="0">Sole Proprietorship</option>
                    <option value="1">Partnership</option>
                    <option value="2">Corporation</option>
                    <option value="3">LLC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Info Section */}
            <div className="add-khata-book-section">
              <h2 className="add-khata-book-section-title">
                <i className="bi bi-cash-stack me-2"></i>
                Financial Info
              </h2>
              <div className="add-khata-book-checkbox-group">
                <label className="add-khata-book-checkbox-label">
                  <input
                    type="checkbox"
                    name="taxVat"
                    checked={formData.taxVat}
                    onChange={handleInputChange}
                  />
                  <i className="bi bi-receipt me-2"></i>
                  Tax/VAT
                </label>
                <label className="add-khata-book-checkbox-label">
                  <input
                    type="checkbox"
                    name="bookAccount"
                    checked={formData.bookAccount}
                    onChange={handleInputChange}
                  />
                  <i className="bi bi-journal-text me-2"></i>
                  Book A/C
                </label>
                <label className="add-khata-book-checkbox-label">
                  <input
                    type="checkbox"
                    name="kyc"
                    checked={formData.kyc}
                    onChange={handleInputChange}
                  />
                  <i className="bi bi-shield-check me-2"></i>
                  KYC
                </label>
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
                  Save
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 