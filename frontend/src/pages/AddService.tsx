import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

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

      const url = isEdit ? `/api/Service/${initialValues?.id}` : '/api/Service';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        alert(isEdit ? 'Service updated successfully!' : 'Service created successfully!');
        navigate('/service');
      } else {
        const errorData = await response.json();
        alert(`Failed to ${isEdit ? 'update' : 'create'} service: ${errorData.message || 'Unknown error'}`);
      }
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

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    formCard: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    imageSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      marginBottom: '2rem',
    },
    imagePlaceholder: {
      width: '200px',
      height: '200px',
      background: imagePreview ? `url(${imagePreview})` : '#f8f9fa',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      marginBottom: '1rem',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    imageIcon: {
      fontSize: '3rem',
      color: imagePreview ? 'white' : '#6c757d',
      zIndex: 1,
      background: imagePreview ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
      padding: '1rem',
      borderRadius: '4px',
    },
    imageLabel: {
      fontSize: '1rem',
      color: '#495057',
      marginBottom: '0.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    row: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    inputGroup: {
      flex: 1,
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#495057',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    taxIncludedContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    taxIncludedLabel: {
      fontSize: '0.9rem',
      color: '#495057',
    },
    slideButton: {
      width: '50px',
      height: '24px',
      background: formData.taxIncluded ? '#28a745' : '#6c757d',
      borderRadius: '12px',
      position: 'relative' as const,
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      flexShrink: 0,
    },
    slideCircle: {
      width: '20px',
      height: '20px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: formData.taxIncluded ? '28px' : '2px',
      transition: 'left 0.3s',
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: '50px',
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.formCard}>
            <div style={styles.imageSection}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
              />
              <div style={styles.imagePlaceholder} onClick={handleImageClick}>
                <span style={styles.imageIcon}>📷</span>
              </div>
              <div style={styles.imageLabel}>Service Photo</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Service Name</label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter service name"
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tax Included in Price</label>
                  <div style={styles.taxIncludedContainer}>
                    <input
                      type="number"
                      name="taxIncludedAmount"
                      value={formData.taxIncludedAmount}
                      onChange={handleInputChange}
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="Enter amount"
                    />
                    <div 
                      style={styles.slideButton}
                      onClick={() => setFormData(prev => ({ ...prev, taxIncluded: !prev.taxIncluded }))}
                    >
                      <div style={styles.slideCircle} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tax (%)</label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter tax percentage"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>VAT (%)</label>
                  <input
                    type="number"
                    name="vat"
                    value={formData.vat}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter VAT percentage"
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.saveButton}>
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