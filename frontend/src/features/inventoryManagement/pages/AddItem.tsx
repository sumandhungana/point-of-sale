import React, {useEffect, useRef, useState} from 'react';
import {Sidebar} from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {useLocation, useNavigate} from 'react-router-dom';
import {fetchCategories} from '../../services/categoryService';
import {addProduct, getProduct, AddProductRequest, updateProduct} from '../../services/productService';
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

    // Control state for enabling/disabling Fixed Selling Price input
    const [isFixedPriceEnabled, setIsFixedPriceEnabled] = useState<boolean>(
        Boolean(initialValues?.salesPrice && initialValues.salesPrice > 0)
    );

    const [formDataState, setFormDataState] = useState({
        name: initialValues?.name || '',
        itemCount: '',
        unit: 'pcs',
        lowStockAlert: '',
        categoryId: '',
        salesPrice: initialValues?.salesPrice?.toString() || '',
        grossPurchasePrice: '',
        perUnitPurchasePrice: '',
        isTaxIncluded: false,
        taxPercentage: '',
        vatPercentage: '13',
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
                const data = await getProduct();
              setItems(data?.items ?? []);
              setTotalSalesPrice(data?.totalSalesPrice ?? 0);
              setTotalItems(data?.totalItems ?? 0);
            } catch (err) {
                console.error('Error fetching items:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchItemsData();
    }, []);

    // Toggle Fixed Selling Price state
    const handleFixedPriceToggle = () => {
        setIsFixedPriceEnabled(prev => {
            const nextState = !prev;
            if (!nextState) {
                setFormDataState(f => ({...f, salesPrice: ''}));
            }
            return nextState;
        });
    };

    // Toggle Tax Included to enable/disable TAX % field
    const handleTaxToggle = () => {
        setFormDataState(prev => {
            const nextTaxIncluded = !prev.isTaxIncluded;
            return {
                ...prev,
                isTaxIncluded: nextTaxIncluded,
                taxPercentage: nextTaxIncluded ? (prev.taxPercentage || '13') : ''
            };
        });
    };

    // Handle Input Changes & Synchronize Calculated Prices
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        if (error) setError(null);

        setFormDataState(prev => {
            const updated = {...prev, [name]: value};
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
                return {...prev, perUnitPurchasePrice: (gross / count).toFixed(2)};
            } else if (newType === 'perUnit' && count > 0 && prev.perUnitPurchasePrice) {
                const unitPrice = parseFloat(prev.perUnitPurchasePrice) || 0;
                return {...prev, grossPurchasePrice: (unitPrice * count).toFixed(2)};
            }
            return prev;
        });
    };

    const handleCancel = () => {
        navigate('/inventory/items');
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
                formData.append('isFixedPriceEnabled', String(isFixedPriceEnabled));

                if (selectedFile) {
                    formData.append('image', selectedFile);
                }
                await updateProduct(initialValues?.id, formData);
            } else {
                const productPayload: AddProductRequest = {
                    name: formDataState.name,
                    categoryId: parsedCategoryId,
                    itemCount: parseFloat(formDataState.itemCount) || 0,
                    unit: formDataState.unit,
                    perUnitPurchasePrice: priceType === 'perUnit' ? (parseFloat(formDataState.perUnitPurchasePrice) || 0) : 0,
                    grossPurchasePrice: priceType === 'gross' ? (parseFloat(formDataState.grossPurchasePrice) || 0) : 0,
                    fixedSellingPrice: isFixedPriceEnabled ? (parseFloat(formDataState.salesPrice) || 0) : 0,
                    isTaxIncluded: formDataState.isTaxIncluded,
                    lowStockAlert: parseFloat(formDataState.lowStockAlert) || 0,
                    vatPercentage: formDataState.vatPercentage ? parseFloat(formDataState.vatPercentage) : 13,
                    taxPercentage: formDataState.taxPercentage ? parseFloat(formDataState.taxPercentage) : 0,
                    imageUrl: formDataState.imageUrl || '',
                };

                await addProduct(productPayload);
            }

            setFormDataState({
                name: '',
                itemCount: '',
                unit: 'pcs',
                lowStockAlert: '',
                categoryId: '',
                salesPrice: '',
                grossPurchasePrice: '',
                perUnitPurchasePrice: '',
                isTaxIncluded: false,
                taxPercentage: '',
                vatPercentage: '13',
                imageUrl: '',
            });
            setIsFixedPriceEnabled(false);
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

    const handleRemoveImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedFile(null);
        setImagePreview(null);
        setFormDataState(prev => ({
            ...prev,
            imageUrl: ''
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Derived calculations for summary display
    const itemCountVal = parseFloat(formDataState.itemCount) || 0;
    const grossVal = parseFloat(formDataState.grossPurchasePrice) || 0;
    const perUnitVal = parseFloat(formDataState.perUnitPurchasePrice) || 0;
    const calculatedGrossPrice = priceType === 'gross' ? grossVal : (perUnitVal * itemCountVal);
    const calculatedUnitPrice = priceType === 'perUnit' ? perUnitVal : (itemCountVal > 0 ? grossVal / itemCountVal : 0);
    const salesPriceVal = isFixedPriceEnabled ? (parseFloat(formDataState.salesPrice) || 0) : 0;

    return (
        <div className="add-item-page-wrapper">
            <Sidebar/>

            <div className="add-item-container">
                <Navbar />

                <main className="add-item-main-content">
                    <div className="add-item-card">
                    {/* Header with Title and Top-Right Cross Button */}
                    <div className="form-card-header">
                        <div className="form-card-header-left">
                            <div className="form-header-icon-wrap item-theme">
                                <i className="bi bi-box-seam"/>
                            </div>
                            <div>
                                <h1 className="form-header-title">{isEdit ? 'Update Item' : 'Add New Item'}</h1>
                                <p className="form-header-subtitle">
                                    Configure item specifications, category, valuation and stock thresholds
                                </p>
                            </div>
                        </div>

                        {/* Top Right Cross Button */}
                        <button
                            type="button"
                            className="form-close-btn"
                            onClick={handleCancel}
                            aria-label="Close"
                            title="Close"
                        >
                            <i className="bi bi-x-lg"/>
                        </button>
                    </div>

                    {error && (
                        <div className="form-alert-box error">
                            <i className="bi bi-exclamation-triangle-fill"/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-body">
                        {/* Interactive Avatar Upload Card Banner */}
                        <div className="avatar-card-banner">
                            <div
                                className="avatar-preview-wrapper"
                                onClick={handlePhotoClick}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="avatar-display-frame">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Item Preview" className="avatar-img-preview"/>
                                    ) : (
                                        <div className="avatar-icon-fallback">
                                            <i className="bi bi-box-seam"/>
                                        </div>
                                    )}
                                    <div className="avatar-hover-overlay">
                                        <i className="bi bi-camera-fill"/>
                                        <span>Change</span>
                                    </div>
                                </div>
                                <div className="avatar-camera-badge" title="Upload Photo">
                                    <i className="bi bi-camera-fill"/>
                                </div>
                            </div>

                            <div className="avatar-meta-info">
                                <h3 className="avatar-meta-title">Item Photo</h3>
                                <p className="avatar-meta-hint">Upload a product picture or catalog thumbnail (max
                                    2MB)</p>
                                <div className="avatar-action-buttons">
                                    <button
                                        type="button"
                                        className="btn-upload-avatar"
                                        onClick={handlePhotoClick}
                                    >
                                        <i className="bi bi-cloud-arrow-up me-1"/>
                                        {imagePreview ? 'Replace Photo' : 'Choose Photo'}
                                    </button>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            className="btn-remove-avatar"
                                            onClick={handleRemoveImage}
                                        >
                                            <i className="bi bi-trash3 me-1"/>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{display: 'none'}}
                            />
                        </div>

                        {/* Section 1: Basic Details */}
                        <div className="form-section-header">
                            <div className="form-section-icon-badge">
                                <i className="bi bi-info-circle-fill"/>
                            </div>
                            <div>
                                <h3 className="form-section-title">General Specifications</h3>
                                <p className="form-section-subtitle">Item identity, category categorization, and stock
                                    alerts</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            {/* Item Name */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Item Name <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-box field-icon"/>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formDataState.name}
                                        onChange={handleInputChange}
                                        className="form-field-input"
                                        placeholder="e.g. Wireless Mouse, Cotton T-Shirt"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Category <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-folder field-icon"/>
                                    <select
                                        name="categoryId"
                                        value={formDataState.categoryId}
                                        onChange={handleInputChange}
                                        className="form-field-select"
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
                            </div>

                            {/* Item Count */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Item Count (Quantity) <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-hash field-icon"/>
                                    <input
                                        type="number"
                                        name="itemCount"
                                        value={formDataState.itemCount}
                                        onChange={handleInputChange}
                                        className="form-field-input"
                                        placeholder="e.g. 10"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Unit Type */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Unit Type <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-rulers field-icon"/>
                                    <select
                                        name="unit"
                                        value={formDataState.unit}
                                        onChange={handleInputChange}
                                        className="form-field-select"
                                        required
                                    >
                                        <option value="pcs">Pcs (Pieces)</option>
                                        <option value="kg">kg (Kilograms)</option>
                                        <option value="g">g (Grams)</option>
                                        <option value="ml">ml (Milliliters)</option>
                                        <option value="l">l (Liters)</option>
                                        <option value="box">Box</option>
                                        <option value="dozen">Dozen</option>
                                    </select>
                                </div>
                            </div>

                            {/* Low Stock Alert */}
                            <div className="form-field-group form-field-full">
                                <label className="form-field-label">
                                    Low Stock Alert Threshold <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-exclamation-triangle field-icon"/>
                                    <input
                                        type="number"
                                        name="lowStockAlert"
                                        value={formDataState.lowStockAlert}
                                        onChange={handleInputChange}
                                        className="form-field-input"
                                        placeholder="Notify when stock drops to or below (e.g. 5)"
                                        required
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pricing & Valuation */}
                        <div className="form-section-header">
                            <div className="form-section-icon-badge">
                                <i className="bi bi-currency-dollar"/>
                            </div>
                            <div>
                                <h3 className="form-section-title">Pricing & Cost Calculation</h3>
                                <p className="form-section-subtitle">Select pricing mode, purchase rates, and fixed
                                    selling price</p>
                            </div>
                        </div>

                        {/* Pricing Mode Segmented Tabs */}
                        <div className="pricing-mode-container">
                            <label className="form-field-label">Pricing Mode Selection</label>
                            <div className="pricing-mode-tabs">
                                <button
                                    type="button"
                                    className={`pricing-mode-tab ${priceType === 'gross' ? 'active' : ''}`}
                                    onClick={() => handlePriceTypeChange('gross')}
                                >
                                    <i className="bi bi-cash-stack"/>
                                    Gross Purchase Price Mode
                                </button>
                                <button
                                    type="button"
                                    className={`pricing-mode-tab ${priceType === 'perUnit' ? 'active' : ''}`}
                                    onClick={() => handlePriceTypeChange('perUnit')}
                                >
                                    <i className="bi bi-tag"/>
                                    Per Unit Price Mode
                                </button>
                            </div>
                        </div>

                        <div className="form-grid">
                            {/* Gross Purchase Price */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Gross Purchase Price {priceType === 'gross' &&
                                    <span className="required-star">*</span>}
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-currency-dollar field-icon"/>
                                    <input
                                        type="number"
                                        name="grossPurchasePrice"
                                        value={formDataState.grossPurchasePrice}
                                        onChange={handleInputChange}
                                        className="form-field-input"
                                        placeholder="0.00"
                                        step="0.01"
                                        disabled={priceType !== 'gross'}
                                        required={priceType === 'gross'}
                                    />
                                </div>
                            </div>

                            {/* Per Unit Purchase Price */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Per Unit Purchase Price {priceType === 'perUnit' &&
                                    <span className="required-star">*</span>}
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-receipt field-icon"/>
                                    <input
                                        type="number"
                                        name="perUnitPurchasePrice"
                                        value={formDataState.perUnitPurchasePrice}
                                        onChange={handleInputChange}
                                        className="form-field-input"
                                        placeholder="0.00"
                                        step="0.01"
                                        disabled={priceType !== 'perUnit'}
                                        required={priceType === 'perUnit'}
                                    />
                                </div>
                            </div>

                            {/* Fixed Selling Price Card */}
                            <div className="form-field-group form-field-full">
                                <div className="fixed-price-toggle-card">
                                    <div className="fixed-price-toggle-info">
                                        <div>
                                            <h4 className="toggle-card-title">Fixed Selling Price</h4>
                                            <p className="toggle-card-desc">Lock a fixed retail selling price for this
                                                product, or leave dynamic for POS</p>
                                        </div>
                                        <div
                                            className={`form-switch ${isFixedPriceEnabled ? 'active' : ''}`}
                                            onClick={handleFixedPriceToggle}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="form-switch-handle"/>
                                        </div>
                                    </div>
                                    {isFixedPriceEnabled && (
                                        <div className="input-with-icon" style={{marginTop: '1rem'}}>
                                            <i className="bi bi-tag-fill field-icon"/>
                                            <input
                                                type="number"
                                                name="salesPrice"
                                                value={formDataState.salesPrice}
                                                onChange={handleInputChange}
                                                className="form-field-input"
                                                placeholder="Enter fixed selling price"
                                                required={isFixedPriceEnabled}
                                                step="0.01"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Overall Financial Summary */}
                        <div className="financial-summary-card">
                            <h4 className="financial-summary-title">
                                <i className="bi bi-calculator"/>
                                Overall Financial Summary
                            </h4>
                            <div className="financial-summary-grid">
                                <div className="financial-summary-item">
                                    <span className="financial-summary-label">Total Purchase Price</span>
                                    <span className="financial-summary-value">${calculatedGrossPrice.toFixed(2)}</span>
                                </div>
                                <div className="financial-summary-item">
                                    <span className="financial-summary-label">Calculated Unit Cost</span>
                                    <span className="financial-summary-value">${calculatedUnitPrice.toFixed(2)}</span>
                                </div>
                                <div className="financial-summary-item">
                                    <span className="financial-summary-label">Unit Profit Margin</span>
                                    <span
                                        className={`financial-summary-value ${salesPriceVal - calculatedUnitPrice >= 0 ? 'positive' : 'negative'}`}>
                    {isFixedPriceEnabled ? `$${(salesPriceVal - calculatedUnitPrice).toFixed(2)}` : 'N/A (Dynamic)'}
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Tax & VAT Settings */}
                        <div className="form-section-header">
                            <div className="form-section-icon-badge">
                                <i className="bi bi-percent"/>
                            </div>
                            <div>
                                <h3 className="form-section-title">Tax & VAT Settings</h3>
                                <p className="form-section-subtitle">Configure VAT percentage and optional included tax
                                    rates</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            {/* VAT Percentage */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    VAT Percentage (%) <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-percent field-icon"/>
                                    <input
                                        type="number"
                                        name="vatPercentage"
                                        value={formDataState.vatPercentage}
                                        onChange={handleInputChange}
                                        className="form-field-input"
                                        placeholder="e.g. 13"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tax Included & Tax % */}
                            <div className="form-field-group">
                                <div className="tax-toggle-wrapper">
                                    <div className="tax-toggle-header">
                                        <label className="form-field-label" style={{marginBottom: 0}}>Tax
                                            Included</label>
                                        <div
                                            className={`form-switch ${formDataState.isTaxIncluded ? 'active' : ''}`}
                                            onClick={handleTaxToggle}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="form-switch-handle"/>
                                        </div>
                                    </div>
                                    <div className="input-with-icon" style={{marginTop: '0.5rem'}}>
                                        <i className="bi bi-percent field-icon"/>
                                        <input
                                            type="number"
                                            name="taxPercentage"
                                            value={formDataState.taxPercentage}
                                            onChange={handleInputChange}
                                            className="form-field-input"
                                            placeholder="Tax % (e.g. 13)"
                                            step="0.01"
                                            disabled={!formDataState.isTaxIncluded}
                                            required={formDataState.isTaxIncluded}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer Matching AddSupplier */}
                        <div className="form-action-footer">
                            <button
                                type="button"
                                className="btn-form-cancel"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-form-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"
                                              aria-hidden="true"/>
                                        {isEdit ? 'Updating Item...' : 'Saving Item...'}
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-1"/>
                                        {isEdit ? 'Update Item' : 'Save Item'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            </div>
        </div>
    );
};