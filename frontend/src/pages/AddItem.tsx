import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
}

interface LocationState {
  isEdit: boolean;
  initialValues: {
    id: number;
    name: string;
    salesPrice: number;
    openingStock: number;
    imageUrl: string;
    category: {
      name: string;
    };
  };
}

export const AddItem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState;
  const isEdit = locationState?.isEdit || false;
  const initialValues = locationState?.initialValues;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formDataState, setFormDataState] = useState({
    name: initialValues?.name || '',
    primaryUnit: '',
    secondaryUnit: '',
    isSecondaryUnitEnabled: false,
    categoryId: '',
    salesPrice: initialValues?.salesPrice?.toString() || '',
    purchasePrice: '',
    taxIncluded: false,
    openingStock: initialValues?.openingStock?.toString() || '',
    lowStockAlert: '',
    vatDate: '',
    vatPercentage: '',
    vatPercentageToday: '',
    imageUrl: initialValues?.imageUrl || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.imageUrl || null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/Category');
        const data = await response.json();
        setCategories(data);
        
        // If editing, set the category ID
        if (isEdit && initialValues?.category) {
          const category = data.find((c: Category) => c.name === initialValues.category.name);
          if (category) {
            setFormDataState(prev => ({
              ...prev,
              categoryId: category.id.toString()
            }));
          }
        }
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [isEdit, initialValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formDataState).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image file if selected
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const url = isEdit ? `/api/Item/${initialValues?.id}` : '/api/Item';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.status === 200 || response.status === 201) {
        // Reset form after successful submission
        setFormDataState({
          name: '',
          primaryUnit: '',
          secondaryUnit: '',
          isSecondaryUnitEnabled: false,
          categoryId: '',
          salesPrice: '',
          purchasePrice: '',
          taxIncluded: false,
          openingStock: '',
          lowStockAlert: '',
          vatPercentage: '',
          vatDate: '',
          vatPercentageToday: '',
          imageUrl: '',
        });
        setSelectedFile(null);
        setImagePreview(null);
        alert(isEdit ? 'Item updated successfully!' : 'Item created successfully!');
        navigate('/inventory/items');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} item`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} item`);
      console.error(`Error ${isEdit ? 'updating' : 'creating'} item:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormDataState(prev => ({
        ...prev,
        imageUrl: file.name
      }));
      
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setFormDataState(prev => ({
        ...prev,
        imageUrl: previewUrl
      }));
    }
  };

  // Clean up the object URL when component unmounts or when a new file is selected
  useEffect(() => {
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
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '2rem',
      alignItems: 'flex-start',
      marginBottom: '2rem',
    },
    section: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '1.5rem',
    },
    photoSection: {
      width: '200px',
      height: '200px',
      border: '2px dashed #dee2e6',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative' as const,
      overflow: 'hidden',
      background: imagePreview ? `url(${imagePreview})` : '#f8f9fa',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    photoPlaceholder: {
      textAlign: 'center' as const,
      color: '#6c757d',
      zIndex: 1,
      background: imagePreview ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
      padding: '1rem',
      borderRadius: '4px',
    },
    photoIcon: {
      fontSize: '3rem',
      marginBottom: '0.5rem',
      color: imagePreview ? 'white' : '#6c757d',
    },
    formSection: {
      flex: 1,
    },
    formGroup: {
      marginBottom: '1.5rem',
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
    unitsContainer: {
      display: 'flex',
      marginBottom: '1.5rem',
      alignItems: 'center',
    },
    primaryUnitContainer: {
      flex: 2,
      marginRight: '1rem',
    },
    secondaryUnitContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    unitInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
    },
    slideContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    slideButton: {
      width: '60px',
      height: '30px',
      background: '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    slideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: '2px',
      transition: 'transform 0.3s ease',
    },
    secondaryUnitSlideButton: {
      width: '60px',
      height: '30px',
      background: formDataState.isSecondaryUnitEnabled ? '#28a745' : '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    secondaryUnitSlideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: formDataState.isSecondaryUnitEnabled ? '32px' : '2px',
      transition: 'transform 0.3s ease',
    },
    taxSlideButton: {
      width: '60px',
      height: '30px',
      background: formDataState.taxIncluded ? '#28a745' : '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    taxSlideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: formDataState.taxIncluded ? '32px' : '2px',
      transition: 'transform 0.3s ease',
    },
    vatSlideButton: {
      width: '60px',
      height: '30px',
      background: formDataState.vatPercentage ? '#28a745' : '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    vatSlideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: formDataState.vatPercentage ? '32px' : '2px',
      transition: 'transform 0.3s ease',
    },
    priceContainer: {
      display: 'flex',
      gap: '1rem',
    },
    priceField: {
      flex: 1,
    },
    taxContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    taxLabel: {
      fontSize: '1rem',
      color: '#495057',
      fontWeight: 'bold',
    },
    stockContainer: {
      display: 'flex',
      gap: '1rem',
    },
    stockField: {
      flex: 1,
    },
    vatContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    vatField: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    vatLabel: {
      fontSize: '1rem',
      color: '#495057',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    saveButton: {
      width: '100%',
      padding: '1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '2rem',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <form onSubmit={handleSubmit}>
            <div style={styles.card}>
              <div style={styles.photoSection} onClick={handlePhotoClick}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div style={styles.photoPlaceholder}>
                  <div style={styles.photoIcon}>📷</div>
                  <div style={{ color: imagePreview ? 'white' : '#6c757d' }}>
                    {selectedFile ? selectedFile.name : 'Add Item Photo'}
                  </div>
                </div>
              </div>
              <div style={styles.formSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Item Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formDataState.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div style={styles.unitsContainer}>
                  <div style={styles.primaryUnitContainer}>
                    <label style={styles.label}>Primary Unit</label>
                    <input
                      type="text"
                      name="primaryUnit"
                      value={formDataState.primaryUnit}
                      onChange={handleInputChange}
                      style={styles.unitInput}
                      placeholder="e.g., kg"
                      required
                    />
                  </div>
                  <div style={styles.secondaryUnitContainer}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Secondary Unit</label>
                      <select
                        name="secondaryUnit"
                        value={formDataState.secondaryUnit}
                        onChange={handleInputChange}
                        style={styles.select}
                        disabled={!formDataState.isSecondaryUnitEnabled}
                      >
                        <option value="">Select unit</option>
                        <option value="g">g</option>
                        <option value="mg">mg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="piece">piece</option>
                        <option value="dozen">dozen</option>
                      </select>
                    </div>
                    <div 
                      style={styles.secondaryUnitSlideButton}
                      onClick={() => setFormDataState(prev => ({ ...prev, isSecondaryUnitEnabled: !prev.isSecondaryUnitEnabled }))}
                    >
                      <div style={styles.secondaryUnitSlideCircle} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Select Items Category</h2>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="categoryId"
                  value={formDataState.categoryId}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.priceContainer}>
                <div style={styles.priceField}>
                  <label style={styles.label}>Sales Price</label>
                  <input
                    type="number"
                    name="salesPrice"
                    value={formDataState.salesPrice}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter sales price"
                    required
                    step="0.01"
                  />
                </div>
                <div style={styles.priceField}>
                  <label style={styles.label}>Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formDataState.purchasePrice}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter purchase price"
                    required
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.taxContainer}>
                <h2 style={styles.taxLabel}>Tax Included</h2>
                <div 
                  style={styles.taxSlideButton}
                  onClick={() => setFormDataState(prev => ({ ...prev, taxIncluded: !prev.taxIncluded }))}
                >
                  <div style={styles.taxSlideCircle} />
                </div>
              </div>
              <div style={styles.stockContainer}>
                <div style={styles.stockField}>
                  <label style={styles.label}>Opening Stock</label>
                  <input
                    type="number"
                    name="openingStock"
                    value={formDataState.openingStock}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter count"
                    required
                    step="0.01"
                  />
                </div>
                <div style={styles.stockField}>
                  <label style={styles.label}>Low Stock Alert</label>
                  <input
                    type="number"
                    name="lowStockAlert"
                    value={formDataState.lowStockAlert}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter count"
                    required
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.vatContainer}>
                <div style={styles.vatField}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.vatLabel}>VAT Percentage</label>
                    <input
                      type="number"
                      name="vatPercentage"
                      value={formDataState.vatPercentage}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="VAT %"
                      required
                      step="0.01"
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>VAT As of Date</label>
                  <input
                    type="date"
                    name="vatDate"
                    value={formDataState.vatDate}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={{ display: 'none' }}>
                  <input
                  hidden
                    type="text"
                    name="imageUrl"
                    value={formDataState.imageUrl}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: 'red', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              style={styles.saveButton}
              disabled={loading}
            >
              {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Item' : 'Save Item')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 