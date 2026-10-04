import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchItems, updateItem } from '@/services/itemService';
import { fetchCategories } from '../../services/categoryService';
import { addProduct, AddProductRequest } from '../../services/productService';
import '../../../styles/AddItem.css';

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

  // Switch between 'gross' and 'perUnit'
  const [priceType, setPriceType] = useState<'gross' | 'perUnit'>('gross');

  const [formDataState, setFormDataState] = useState({
    name: initialValues?.name || '',
    itemCount: '',
    unit: 'pcs',
    categoryId: '',
    salesPrice: initialValues?.salesPrice?.toString() || '',
    grossPurchasePrice: '',
    perUnitPurchasePrice: '',
    isTaxIncluded: false,
    openingStock: initialValues?.openingStock?.toString() || '',
    lowStockAlert: '',
    vatDate: '',
    vatPercentage: '',
    imageUrl: initialValues?.imageUrl || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.imageUrl || null);
  const [, setItems] = useState<any[]>([]);
  const [, setTotalSalesPrice] = useState(0);
  const [, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (isEdit && initialValues?.category) {
          const category = data.find((c: Category) => c.name === initialValues.category.name);
          if (category) {
            setFormDataState(prev => ({
              ...prev,
              categoryId: String(category.id)
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
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemsData();
  }, []);

  // Handle Input Changes & Synchronize Calculated Prices
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (error) setError(null);

    setFormDataState(prev => {
      const updated = { ...prev, [name]: value };
      const count = parseFloat(updated.itemCount) || 0;

      if (name === 'grossPurchasePrice' && priceType === 'gross' && count > 0) {
        const gross = parseFloat(value) || 0;
        updated.perUnitPurchasePrice = (gross / count).toFixed(2);
      } else if (name === 'perUnitPurchasePrice' && priceType === 'perUnit' && count > 0) {
        const unitPrice = parseFloat(value) || 0;
        updated.grossPurchasePrice = (unitPrice * count).toFixed(2);
      } else if (name === 'itemCount' && count > 0) {
        if (priceType === 'gross' && updated.grossPurchasePrice) {
          const gross = parseFloat(updated.grossPurchasePrice) || 0;
          updated.perUnitPurchasePrice = (gross / count).toFixed(2);
        } else if (priceType === 'perUnit' && updated.perUnitPurchasePrice) {
          const unitPrice = parseFloat(updated.perUnitPurchasePrice) || 0;
          updated.grossPurchasePrice = (unitPrice * count).toFixed(2);
        }
      }

      return updated;
    });
  };

  const handlePriceTypeChange = (newType: 'gross' | 'perUnit') => {
    setPriceType(newType);
    const count = parseFloat(formDataState.itemCount) || 0;

    setFormDataState(prev => {
      if (newType === 'gross' && count > 0 && prev.grossPurchasePrice) {
        const gross = parseFloat(prev.grossPurchasePrice) || 0;
        return { ...prev, perUnitPurchasePrice: (gross / count).toFixed(2) };
      } else if (newType === 'perUnit' && count > 0 && prev.perUnitPurchasePrice) {
        const unitPrice = parseFloat(prev.perUnitPurchasePrice) || 0;
        return { ...prev, grossPurchasePrice: (unitPrice * count).toFixed(2) };
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parsedCategoryId = Number(formDataState.categoryId);
    if (!formDataState.categoryId || isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      setError('Please select a valid category.');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        const formData = new FormData();
        Object.entries(formDataState).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        formData.append('priceType', priceType);

        if (selectedFile) {
          formData.append('image', selectedFile);
        }
        await updateItem(initialValues?.id, formData);
      } else {
        const productPayload: AddProductRequest = {
          name: formDataState.name,
          categoryId: parsedCategoryId,
          itemCount: parseFloat(formDataState.itemCount) || 0,
          unit: formDataState.unit,
          perUnitPurchasePrice: priceType === 'perUnit' ? (parseFloat(formDataState.perUnitPurchasePrice) || 0) : 0,
          grossPurchasePrice: priceType === 'gross' ? (parseFloat(formDataState.grossPurchasePrice) || 0) : 0,
          salesPrice: parseFloat(formDataState.salesPrice) || 0,
          isTaxIncluded: formDataState.isTaxIncluded,
          openingStock: parseFloat(formDataState.openingStock) || 0,
          lowStockAlert: parseFloat(formDataState.lowStockAlert) || 0,
          vatPercentage: formDataState.vatPercentage ? parseFloat(formDataState.vatPercentage) : undefined,
          vatDate: formDataState.vatDate,
          imageUrl: formDataState.imageUrl || '',
        };

        await addProduct(productPayload);
      }

      setFormDataState({
        name: '',
        itemCount: '',
        unit: 'pcs',
        categoryId: '',
        salesPrice: '',
        grossPurchasePrice: '',
        perUnitPurchasePrice: '',
        isTaxIncluded: false,
        openingStock: '',
        lowStockAlert: '',
        vatDate: '',
        vatPercentage: '',
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

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Derived helper values for Overall Summary display
  const itemCountVal = parseFloat(formDataState.itemCount) || 0;
  const grossVal = parseFloat(formDataState.grossPurchasePrice) || 0;
  const perUnitVal = parseFloat(formDataState.perUnitPurchasePrice) || 0;
  const calculatedGrossPrice = priceType === 'gross' ? grossVal : (perUnitVal * itemCountVal);
  const calculatedUnitPrice = priceType === 'perUnit' ? perUnitVal : (itemCountVal > 0 ? grossVal / itemCountVal : 0);
  const salesPriceVal = parseFloat(formDataState.salesPrice) || 0;

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
                      background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : '#f8f9fa'
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
                        <i className="bi bi-hash"></i>
                        Item Count
                      </label>
                      <input
                          type="number"
                          name="itemCount"
                          value={formDataState.itemCount}
                          onChange={handleInputChange}
                          className="add-item-unit-input"
                          placeholder="e.g. 10"
                          required
                          min="1"
                      />
                    </div>

                    <div className="add-item-secondary-unit-container">
                      <div style={{ flex: 1 }}>
                        <label className="add-item-label">
                          <i className="bi bi-rulers"></i>
                          Unit Type
                        </label>
                        <select
                            name="unit"
                            value={formDataState.unit}
                            onChange={handleInputChange}
                            className="add-item-select"
                            required
                        >
                          <option value="pcs">Pcs</option>
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                          <option value="box">Box</option>
                          <option value="dozen">Dozen</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="add-item-section">
                <h2 className="add-item-section-title">
                  <i className="bi bi-tag"></i>
                  Select Category & Pricing Mode
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
                        <option key={category.id} value={String(category.id)}>
                          {category.name}
                        </option>
                    ))}
                  </select>
                </div>

                {/* Pricing Mode Selector */}
                <div className="add-item-price-type-selector" style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    <input
                        type="radio"
                        name="priceType"
                        value="gross"
                        checked={priceType === 'gross'}
                        onChange={() => handlePriceTypeChange('gross')}
                    />
                    Gross Purchase Price Mode
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    <input
                        type="radio"
                        name="priceType"
                        value="perUnit"
                        checked={priceType === 'perUnit'}
                        onChange={() => handlePriceTypeChange('perUnit')}
                    />
                    Per Unit Price Mode
                  </label>
                </div>

                {/* Conditional Price Fields */}
                <div className="add-item-price-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="add-item-price-field">
                    <label className="add-item-label">
                      <i className="bi bi-currency-dollar"></i>
                      Gross Purchase Price
                    </label>
                    <input
                        type="number"
                        name="grossPurchasePrice"
                        value={formDataState.grossPurchasePrice}
                        onChange={handleInputChange}
                        className="add-item-input"
                        placeholder="Total Gross Price"
                        disabled={priceType !== 'gross'}
                        required={priceType === 'gross'}
                        step="0.01"
                    />
                  </div>

                  <div className="add-item-price-field">
                    <label className="add-item-label">
                      <i className="bi bi-currency-dollar"></i>
                      Per Unit Purchase Price
                    </label>
                    <input
                        type="number"
                        name="perUnitPurchasePrice"
                        value={formDataState.perUnitPurchasePrice}
                        onChange={handleInputChange}
                        className="add-item-input"
                        placeholder="Unit Price"
                        disabled={priceType !== 'perUnit'}
                        required={priceType === 'perUnit'}
                        step="0.01"
                    />
                  </div>

                  <div className="add-item-price-field">
                    <label className="add-item-label">
                      <i className="bi bi-tags"></i>
                      Selling Price (Per Unit)
                    </label>
                    <input
                        type="number"
                        name="salesPrice"
                        value={formDataState.salesPrice}
                        onChange={handleInputChange}
                        className="add-item-input"
                        placeholder="Sales Price"
                        step="0.01"
                    />
                  </div>
                </div>

                {/* Overall Price Breakdown Summary */}
                <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '1rem',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      borderLeft: '4px solid #3b82f6'
                    }}
                >
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                    <i className="bi bi-calculator" style={{ marginRight: '0.5rem' }}></i>
                    Overall Financial Summary
                  </h4>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.95rem' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Total Overall Purchase Price: </span>
                      <strong style={{ color: '#0f172a' }}>${calculatedGrossPrice.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Calculated Unit Cost: </span>
                      <strong style={{ color: '#0f172a' }}>${calculatedUnitPrice.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Unit Profit Margin: </span>
                      <strong style={{ color: salesPriceVal - calculatedUnitPrice >= 0 ? '#16a34a' : '#dc2626' }}>
                        ${(salesPriceVal - calculatedUnitPrice).toFixed(2)}
                      </strong>
                    </div>
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
                      className={`add-item-slide-button ${formDataState.isTaxIncluded ? 'active' : ''}`}
                      onClick={() => setFormDataState(prev => ({ ...prev, isTaxIncluded: !prev.isTaxIncluded }))}
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
