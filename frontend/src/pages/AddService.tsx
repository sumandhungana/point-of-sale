import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { createService, updateService } from '../services/serviceService';
import '../styles/AddService.css';

interface LocationState {
  isEdit: boolean;
  initialValues: {
    id: number;
    serviceName: string;
    price: number;
    taxIncluded: boolean;
    taxIncludedAmount: number;
    tax: number | null;
    vat: number | null;
    imagePath: string | null;
  };
}

export const AddService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const isEdit = locationState?.isEdit || false;
  const initialValues = locationState?.initialValues;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.imagePath || null);
  const [formData, setFormData] = useState({
    serviceName: initialValues?.serviceName || '',
    price: initialValues?.price?.toString() || '',
    taxIncluded: initialValues?.taxIncluded || false,
    taxIncludedAmount: initialValues?.taxIncludedAmount?.toString() || '',
    tax: initialValues?.tax?.toString() || '',
    vat: initialValues?.vat?.toString() || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('serviceName', formData.serviceName);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('taxIncluded', formData.taxIncluded.toString());
      formDataToSend.append('taxIncludedAmount', formData.taxIncludedAmount);
      formDataToSend.append('tax', formData.tax);
      formDataToSend.append('vat', formData.vat);
      
      if (selectedFile) {
        formDataToSend.append('Image', selectedFile);
      }

      if (isEdit) {
        await updateService(initialValues?.id, formDataToSend);
        alert('Service updated successfully!');
      } else {
        await createService(formDataToSend);
        alert('Service created successfully!');
      }
      navigate('/service');
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} service:`, error);
      alert(`An error occurred while ${isEdit ? 'updating' : 'creating'} the service`);
    }
  };

  // Clean up the object URL when component unmounts or when a new file is selected
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '40px', 
        marginLeft: '50px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div className="add-service-container">
          <div className="add-service-form-card">
            <div className="add-service-image-section">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
              />
              <div 
                className={`add-service-image-placeholder ${imagePreview ? 'has-image' : ''}`}
                onClick={handleImageClick}
                style={imagePreview ? { backgroundImage: `url(${imagePreview})` } : {}}
              >
                <span className="add-service-image-icon">
                  <i className="bi bi-camera"></i>
                </span>
              </div>
              <div className="add-service-image-label">
                <i className="bi bi-image me-1"></i>
                Service Photo
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="add-service-row">
                <div className="add-service-input-group">
                  <label className="add-service-label">
                    <i className="bi bi-tag me-1"></i>
                    Service Name
                  </label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    className="add-service-input"
                    placeholder="Enter service name"
                    required
                  />
                </div>
                <div className="add-service-input-group">
                  <label className="add-service-label">
                    <i className="bi bi-currency-dollar me-1"></i>
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="add-service-input"
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div className="add-service-row">
                <div className="add-service-input-group">
                  <label className="add-service-tax-included-label">
                    <i className="bi bi-calculator me-1"></i>
                    Tax Included Amount
                  </label>
                  <div className="add-service-tax-included-container">
                    <input
                      type="number"
                      name="taxIncludedAmount"
                      value={formData.taxIncludedAmount}
                      onChange={handleInputChange}
                      className="add-service-input"
                      placeholder="Enter amount"
                    />
                    <button 
                      type="button"
                      className={`add-service-slide-button ${formData.taxIncluded ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, taxIncluded: !prev.taxIncluded }))}
                    >
                      <div className="add-service-slide-circle" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="add-service-row">
                <div className="add-service-input-group">
                  <label className="add-service-label">
                    <i className="bi bi-percent me-1"></i>
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    className="add-service-input"
                    placeholder="Enter tax percentage"
                  />
                </div>
                <div className="add-service-input-group">
                  <label className="add-service-label">
                    <i className="bi bi-percent me-1"></i>
                    VAT (%)
                  </label>
                  <input
                    type="number"
                    name="vat"
                    value={formData.vat}
                    onChange={handleInputChange}
                    className="add-service-input"
                    placeholder="Enter VAT percentage"
                  />
                </div>
              </div>

              <div className="add-service-button-group">
                <button type="submit" className="add-service-save-button">
                  <i className="bi bi-check-circle me-2"></i>
                  {isEdit ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 