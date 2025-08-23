import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchItems, createItem, updateItem } from '../services/itemService';
import { fetchCategories } from '../services/categoryService';
import '../styles/AddItem.css';

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
  const [items, setItems] = useState<any[]>([]);
  const [totalSalesPrice, setTotalSalesPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const data = await fetchCategories();
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
    fetchCategoriesData();
  }, [isEdit, initialValues]);

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const data = await fetchItems();
        setItems(data.items);
        setTotalSalesPrice(data.totalSalesPrice);
        setTotalItems(data.totalItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItemsData();
  }, []);

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
      Object.entries(formDataState).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      if (isEdit) {
        await updateItem(initialValues?.id, formData);
        alert('Item updated successfully!');
      } else {
        await createItem(formData);
        alert('Item created successfully!');
      }
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
      navigate('/inventory/items');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} item`);
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
      setImagePreview(previewUrl);
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-item-container">
        <Navbar />
        <div className="add-item-card">
          <form onSubmit={handleSubmit}>
            <div className="add-item-main-card">
              <div 
                className="add-item-photo-section" 
                onClick={handlePhotoClick}
                style={{
                  background: imagePreview ? `url(${imagePreview})` : '#f8f9fa'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="add-item-file-input"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div className="add-item-photo-placeholder">
                  <div className="add-item-photo-icon">
                    <i className="bi bi-camera"></i>
                  </div>
                  <div style={{ color: imagePreview ? 'white' : '#6c757d' }}>
                    {selectedFile ? selectedFile.name : 'Add Item Photo'}
                  </div>
                </div>
              </div>
              <div className="add-item-form-section">
                <div className="add-item-group">
                  <label className="add-item-label">
                    <i className="bi bi-box"></i>
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formDataState.name}
                    onChange={handleInputChange}
                    className="add-item-input"
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="add-item-units-container">
                  <div className="add-item-primary-unit-container">
                    <label className="add-item-label">
                      <i className="bi bi-rulers"></i>
                      Primary Unit
                    </label>
                    <input
                      type="text"
                      name="primaryUnit"
                      value={formDataState.primaryUnit}
                      onChange={handleInputChange}
                      className="add-item-unit-input"
                      placeholder="e.g., kg"
                      required
                    />
                  </div>
                  <div className="add-item-secondary-unit-container">
                    <div style={{ flex: 1 }}>
                      <label className="add-item-label">
                        <i className="bi bi-rulers"></i>
                        Secondary Unit
                      </label>
                      <select
                        name="secondaryUnit"
                        value={formDataState.secondaryUnit}
                        onChange={handleInputChange}
                        className="add-item-select"
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
                      className={`add-item-slide-button ${formDataState.isSecondaryUnitEnabled ? 'active' : ''}`}
                      onClick={() => setFormDataState(prev => ({ ...prev, isSecondaryUnitEnabled: !prev.isSecondaryUnitEnabled }))}
                    >
                      <div className="add-item-slide-circle" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="add-item-section">
              <h2 className="add-item-section-title">
                <i className="bi bi-tag"></i>
                Select Items Category
              </h2>
              <div className="add-item-group">
                <label className="add-item-label">
                  <i className="bi bi-folder"></i>
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formDataState.categoryId}
                  onChange={handleInputChange}
                  className="add-item-select"
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
              <div className="add-item-price-container">
                <div className="add-item-price-field">
                  <label className="add-item-label">
                    <i className="bi bi-currency-rupee"></i>
                    Sales Price
                  </label>
                  <input
                    type="number"
                    name="salesPrice"
                    value={formDataState.salesPrice}
                    onChange={handleInputChange}
                    className="add-item-input"
                    placeholder="Enter sales price"
                    required
                    step="0.01"
                  />
                </div>
                <div className="add-item-price-field">
                  <label className="add-item-label">
                    <i className="bi bi-currency-rupee"></i>
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formDataState.purchasePrice}
                    onChange={handleInputChange}
                    className="add-item-input"
                    placeholder="Enter purchase price"
                    required
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="add-item-section">
              <div className="add-item-tax-container">
                <h2 className="add-item-tax-label">
                  <i className="bi bi-percent"></i>
                  Tax Included
                </h2>
                <div 
                  className={`add-item-slide-button ${formDataState.taxIncluded ? 'active' : ''}`}
                  onClick={() => setFormDataState(prev => ({ ...prev, taxIncluded: !prev.taxIncluded }))}
                >
                  <div className="add-item-slide-circle" />
                </div>
              </div>
              <div className="add-item-stock-container">
                <div className="add-item-stock-field">
                  <label className="add-item-label">
                    <i className="bi bi-boxes"></i>
                    Opening Stock
                  </label>
                  <input
                    type="number"
                    name="openingStock"
                    value={formDataState.openingStock}
                    onChange={handleInputChange}
                    className="add-item-input"
                    placeholder="Enter count"
                    required
                    step="0.01"
                  />
                </div>
                <div className="add-item-stock-field">
                  <label className="add-item-label">
                    <i className="bi bi-exclamation-triangle"></i>
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    name="lowStockAlert"
                    value={formDataState.lowStockAlert}
                    onChange={handleInputChange}
                    className="add-item-input"
                    placeholder="Enter count"
                    required
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="add-item-section">
              <div className="add-item-vat-container">
                <div className="add-item-vat-field">
                  <div style={{ flex: 1 }}>
                    <label className="add-item-vat-label">
                      <i className="bi bi-percent"></i>
                      VAT Percentage
                    </label>
                    <input
                      type="number"
                      name="vatPercentage"
                      value={formDataState.vatPercentage}
                      onChange={handleInputChange}
                      className="add-item-input"
                      placeholder="VAT %"
                      required
                      step="0.01"
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="add-item-label">
                    <i className="bi bi-calendar"></i>
                    VAT As of Date
                  </label>
                  <input
                    type="date"
                    name="vatDate"
                    value={formDataState.vatDate}
                    onChange={handleInputChange}
                    className="add-item-input"
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
                    className="add-item-input"
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="add-item-error">
                <i className="bi bi-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="add-item-save-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="add-item-spinner"></div>
                  {isEdit ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  {isEdit ? 'Update Item' : 'Save Item'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 