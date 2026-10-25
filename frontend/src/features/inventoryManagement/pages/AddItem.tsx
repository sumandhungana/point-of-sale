import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchCategories } from '../../services/categoryService';
import { addProduct, getProduct, updateProduct, AddProductRequest, EditProductUCRequest, Item } from '../../services/productService';
import { resolveImageSrc } from '@/utils/ImageResolver';
import { useAppSettings } from '@/context/AppSettingsContext';
import '../../../styles/AddItem.css';

interface Category {
    id: number;
    name: string;
}

interface LocationState {
    isEdit?: boolean;
    initialValues?: Item & {
        salesPrice?: number;
    };
}

export const AddItem: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id: paramId } = useParams<{ id: string }>();
    const { formatCurrency } = useAppSettings();

    const locationState = location.state as LocationState | undefined;
    const isEditMode = Boolean(locationState?.isEdit || paramId);
    const passedInitialValues = locationState?.initialValues;

    const [activeItem, setActiveItem] = useState<Item | undefined>(passedInitialValues);
    const resolvedItemId = activeItem?.id || (paramId ? Number(paramId) : undefined);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingItem, setFetchingItem] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Switch between 'gross' and 'perUnit'
    const [priceType, setPriceType] = useState<'gross' | 'perUnit'>('gross');

    // Control state for enabling/disabling Fixed Selling Price input
    const [isFixedPriceEnabled, setIsFixedPriceEnabled] = useState<boolean>(false);

    const [formDataState, setFormDataState] = useState({
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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Populate all form fields from an Item object
    const populateFormData = (item: any) => {
        if (!item) return;

        const fixedPrice = item.fixedSellingPrice ?? item.salesPrice;
        const hasFixedPrice = Boolean(fixedPrice !== undefined && fixedPrice !== null && Number(fixedPrice) > 0);
        const gross = item.grossPurchasePrice;
        const perUnit = item.perUnitPurchasePrice;
        const catId = item.categoryId ? String(item.categoryId) : (item.category?.id ? String(item.category.id) : '');

        const hasPerUnitOnly = Boolean(perUnit && !gross);
        setPriceType(hasPerUnitOnly ? 'perUnit' : 'gross');
        setIsFixedPriceEnabled(hasFixedPrice);

        setFormDataState({
            name: item.name || '',
            itemCount: item.itemCount !== undefined && item.itemCount !== null ? String(item.itemCount) : '',
            unit: item.unit || 'pcs',
            lowStockAlert: item.lowStockAlert !== undefined && item.lowStockAlert !== null ? String(item.lowStockAlert) : '',
            categoryId: catId,
            salesPrice: hasFixedPrice ? String(fixedPrice) : '',
            grossPurchasePrice: gross !== undefined && gross !== null ? String(gross) : '',
            perUnitPurchasePrice: perUnit !== undefined && perUnit !== null ? String(perUnit) : '',
            isTaxIncluded: Boolean(item.isTaxIncluded || (item.taxPercentage && Number(item.taxPercentage) > 0)),
            taxPercentage: item.taxPercentage !== undefined && item.taxPercentage !== null ? String(item.taxPercentage) : '',
            vatPercentage: item.vatPercentage !== undefined && item.vatPercentage !== null ? String(item.vatPercentage) : '13',
            imageUrl: item.imageUrl || '',
        });

        if (item.imageUrl) {
            setImagePreview(resolveImageSrc(item.imageUrl));
        }
    };

    // Initialize with passed state if present
    useEffect(() => {
        if (passedInitialValues) {
            setActiveItem(passedInitialValues);
            populateFormData(passedInitialValues);
        }
    }, [passedInitialValues]);

    // If edit mode via URL param but no state was passed, fetch the product
    useEffect(() => {
        if (isEditMode && !passedInitialValues && paramId) {
            setFetchingItem(true);
            getProduct(true)
                .then((data) => {
                    const found = data?.items?.find((it) => String(it.id) === String(paramId));
                    if (found) {
                        setActiveItem(found);
                        populateFormData(found);
                    } else {
                        setError(`Item with ID #${paramId} not found.`);
                    }
                })
                .catch((err) => {
                    console.error('Error fetching product for edit:', err);
                    setError('Failed to fetch product details.');
                })
                .finally(() => setFetchingItem(false));
        }
    }, [isEditMode, passedInitialValues, paramId]);

    // Fetch Categories and reconcile selected categoryId
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data || []);

                // If editing and categoryId not yet selected, resolve by category name or id
                if (activeItem) {
                    const targetCategory = activeItem.category;
                    const targetCatId = activeItem.categoryId || targetCategory?.id;
                    const targetCatName = targetCategory?.name;

                    const matched = data?.find(
                        (c: Category) =>
                            (targetCatId && c.id === Number(targetCatId)) ||
                            (targetCatName && c.name?.toLowerCase() === targetCatName.toLowerCase())
                    );

                    if (matched) {
                        setFormDataState((prev) => ({
                            ...prev,
                            categoryId: String(matched.id),
                        }));
                    }
                }
            } catch (err) {
                setError('Failed to fetch categories');
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategoriesData();
    }, [activeItem]);

    // Toggle Fixed Selling Price state
    const handleFixedPriceToggle = () => {
        setIsFixedPriceEnabled((prev) => {
            const nextState = !prev;
            if (!nextState) {
                setFormDataState((f) => ({ ...f, salesPrice: '' }));
            }
            return nextState;
        });
    };

    // Toggle Tax Included to enable/disable TAX % field
    const handleTaxToggle = () => {
        setFormDataState((prev) => {
            const nextTaxIncluded = !prev.isTaxIncluded;
            return {
                ...prev,
                isTaxIncluded: nextTaxIncluded,
                taxPercentage: nextTaxIncluded ? prev.taxPercentage || '13' : '',
            };
        });
    };

    // Handle Input Changes & Synchronize Calculated Prices
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (error) setError(null);

        setFormDataState((prev) => {
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

        setFormDataState((prev) => {
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

        if (isEditMode && !resolvedItemId) {
            setError('Product ID is missing for update.');
            setLoading(false);
            return;
        }

        const countVal = parseFloat(formDataState.itemCount) || 0;
        const grossVal = parseFloat(formDataState.grossPurchasePrice) || 0;
        const perUnitVal = parseFloat(formDataState.perUnitPurchasePrice) || 0;

        const effectivePerUnitPrice =
            priceType === 'perUnit'
                ? perUnitVal
                : grossVal && countVal
                ? grossVal / countVal
                : 0;

        const effectiveGrossPrice =
            priceType === 'gross'
                ? grossVal
                : perUnitVal && countVal
                ? perUnitVal * countVal
                : 0;

        const fixedSelling = isFixedPriceEnabled ? parseFloat(formDataState.salesPrice) || 0 : 0;
        const vat = formDataState.vatPercentage ? parseFloat(formDataState.vatPercentage) : 13;
        const tax = formDataState.isTaxIncluded ? (parseFloat(formDataState.taxPercentage) || 0) : 0;

        try {
            if (isEditMode && resolvedItemId) {
                const editPayload: EditProductUCRequest = {
                    itemId: resolvedItemId,
                    name: formDataState.name.trim(),
                    categoryId: parsedCategoryId,
                    itemCount: countVal,
                    unit: formDataState.unit || 'pcs',
                    perUnitPurchasePrice: effectivePerUnitPrice,
                    grossPurchasePrice: effectiveGrossPrice,
                    fixedSellingPrice: fixedSelling,
                    isTaxIncluded: formDataState.isTaxIncluded,
                    lowStockAlert: parseFloat(formDataState.lowStockAlert) || 0,
                    vatPercentage: vat,
                    taxPercentage: tax,
                    imageUrl: formDataState.imageUrl || '',
                };
                await updateProduct(editPayload);
            } else {
                const addPayload: AddProductRequest = {
                    name: formDataState.name.trim(),
                    categoryId: parsedCategoryId,
                    itemCount: countVal,
                    unit: formDataState.unit || 'pcs',
                    perUnitPurchasePrice: effectivePerUnitPrice,
                    grossPurchasePrice: effectiveGrossPrice,
                    fixedSellingPrice: fixedSelling,
                    isTaxIncluded: formDataState.isTaxIncluded,
                    lowStockAlert: parseFloat(formDataState.lowStockAlert) || 0,
                    vatPercentage: vat,
                    taxPercentage: tax,
                    imageUrl: formDataState.imageUrl || '',
                };
                await addProduct(addPayload);
            }

            navigate('/inventory/items');
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} item`);
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
            if (file.size > 2 * 1024 * 1024) {
                setError('Item image must be less than 2MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setFormDataState((prev) => ({
                    ...prev,
                    imageUrl: base64String,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedFile(null);
        setImagePreview(null);
        setFormDataState((prev) => ({
            ...prev,
            imageUrl: '',
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Derived calculations for summary display
    const itemCountVal = parseFloat(formDataState.itemCount) || 0;
    const grossVal = parseFloat(formDataState.grossPurchasePrice) || 0;
    const perUnitVal = parseFloat(formDataState.perUnitPurchasePrice) || 0;
    const calculatedGrossPrice = priceType === 'gross' ? grossVal : perUnitVal * itemCountVal;
    const calculatedUnitPrice = priceType === 'perUnit' ? perUnitVal : itemCountVal > 0 ? grossVal / itemCountVal : 0;
    const salesPriceVal = isFixedPriceEnabled ? parseFloat(formDataState.salesPrice) || 0 : 0;
    const profitMargin = salesPriceVal - calculatedUnitPrice;

    return (
        <div className="add-item-page-wrapper">
            <Sidebar />

            <div className="add-item-container">
                <Navbar />

                <main className="add-item-main-content">
                    <div className="add-item-card">
                        {/* Header with Title, Mode Badge, Compact Thumbnail, and Top-Right Controls */}
                        <div className="form-card-header">
                            <div className="form-card-header-left">
                                <div
                                    className="form-header-avatar-wrap"
                                    onClick={handlePhotoClick}
                                    title="Click to upload or change product photo"
                                    role="button"
                                    tabIndex={0}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Product"
                                            className="form-header-avatar-img"
                                            onError={() => setImagePreview(null)}
                                        />
                                    ) : (
                                        <i className="bi bi-box-seam" />
                                    )}
                                    <div className="form-header-avatar-badge" title="Upload Photo">
                                        <i className="bi bi-camera-fill" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <h1 className="form-header-title">
                                            {isEditMode ? 'Edit Product' : 'Add New Item'}
                                        </h1>
                                        {isEditMode && resolvedItemId && (
                                            <span className="item-id-badge-header">
                                                #ITEM-{resolvedItemId}
                                            </span>
                                        )}
                                    </div>
                                    <p className="form-header-subtitle">
                                        {isEditMode
                                            ? `Specifications, pricing, and stock settings for "${formDataState.name || 'Product'}"`
                                            : 'Configure item specifications, category, valuation and stock thresholds'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        className="btn-header-remove-photo"
                                        onClick={handleRemoveImage}
                                        title="Remove Photo"
                                    >
                                        <i className="bi bi-trash3 me-1" />
                                        Remove Photo
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="form-close-btn"
                                    onClick={handleCancel}
                                    aria-label="Close"
                                    title="Close"
                                >
                                    <i className="bi bi-x-lg" />
                                </button>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        {fetchingItem ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                                <div className="spinner-border text-primary mb-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <div>Loading product data...</div>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="form-alert-box error">
                                        <i className="bi bi-exclamation-triangle-fill" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="form-body">

                                    {/* Section 1: Basic Details */}
                                    <div className="form-section-header">
                                        <div className="form-section-icon-badge">
                                            <i className="bi bi-info-circle-fill" />
                                        </div>
                                        <div>
                                            <h3 className="form-section-title">General Specifications</h3>
                                            <p className="form-section-subtitle">
                                                Item identity, category categorization, and stock alerts
                                            </p>
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        {/* Item Name */}
                                        <div className="form-field-group">
                                            <label className="form-field-label">
                                                Item Name <span className="required-star">*</span>
                                            </label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-box field-icon" />
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
                                                <i className="bi bi-folder field-icon" />
                                                <select
                                                    name="categoryId"
                                                    value={formDataState.categoryId}
                                                    onChange={handleInputChange}
                                                    className="form-field-select"
                                                    required
                                                >
                                                    <option value="">Select category</option>
                                                    {categories.map((category) => (
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
                                                <i className="bi bi-hash field-icon" />
                                                <input
                                                    type="number"
                                                    name="itemCount"
                                                    value={formDataState.itemCount}
                                                    onChange={handleInputChange}
                                                    className="form-field-input"
                                                    placeholder="e.g. 10"
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        {/* Unit Type */}
                                        <div className="form-field-group">
                                            <label className="form-field-label">
                                                Unit Type <span className="required-star">*</span>
                                            </label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-rulers field-icon" />
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
                                                    <option value="meter">Meter</option>
                                                    <option value="packet">Packet</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Low Stock Alert */}
                                        <div className="form-field-group">
                                            <label className="form-field-label">
                                                Low Stock Alert Threshold <span className="required-star">*</span>
                                            </label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-exclamation-triangle field-icon" />
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

                                        {/* Product Photo Upload Field */}
                                        <div className="form-field-group">
                                            <label className="form-field-label">Product Photo</label>
                                            <div className="compact-image-picker">
                                                <button
                                                    type="button"
                                                    className="btn-upload-compact"
                                                    onClick={handlePhotoClick}
                                                >
                                                    <i className="bi bi-camera me-1" />
                                                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                                </button>
                                                {imagePreview && (
                                                    <button
                                                        type="button"
                                                        className="btn-remove-compact"
                                                        onClick={handleRemoveImage}
                                                    >
                                                        <i className="bi bi-trash3 me-1" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Pricing & Valuation */}
                                    <div className="form-section-header">
                                        <div className="form-section-icon-badge">
                                            <i className="bi bi-currency-dollar" />
                                        </div>
                                        <div>
                                            <h3 className="form-section-title">Pricing & Cost Calculation</h3>
                                            <p className="form-section-subtitle">
                                                Select pricing mode, purchase rates, and fixed selling price
                                            </p>
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
                                                <i className="bi bi-cash-stack" />
                                                Gross Purchase Price Mode
                                            </button>
                                            <button
                                                type="button"
                                                className={`pricing-mode-tab ${priceType === 'perUnit' ? 'active' : ''}`}
                                                onClick={() => handlePriceTypeChange('perUnit')}
                                            >
                                                <i className="bi bi-tag" />
                                                Per Unit Price Mode
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        {/* Gross Purchase Price */}
                                        <div className="form-field-group">
                                            <label className="form-field-label">
                                                Gross Purchase Price{' '}
                                                {priceType === 'gross' && <span className="required-star">*</span>}
                                            </label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-cash field-icon" />
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
                                                Per Unit Purchase Price{' '}
                                                {priceType === 'perUnit' && <span className="required-star">*</span>}
                                            </label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-receipt field-icon" />
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
                                                        <p className="toggle-card-desc">
                                                            Lock a fixed retail selling price for this product, or leave dynamic for POS
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`form-switch ${isFixedPriceEnabled ? 'active' : ''}`}
                                                        onClick={handleFixedPriceToggle}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <div className="form-switch-handle" />
                                                    </div>
                                                </div>
                                                {isFixedPriceEnabled && (
                                                    <div className="input-with-icon" style={{ marginTop: '1rem' }}>
                                                        <i className="bi bi-tag-fill field-icon" />
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
                                            <i className="bi bi-calculator" />
                                            Overall Financial Summary
                                        </h4>
                                        <div className="financial-summary-grid">
                                            <div className="financial-summary-item">
                                                <span className="financial-summary-label">Total Purchase Price</span>
                                                <span className="financial-summary-value">
                                                    {formatCurrency(calculatedGrossPrice)}
                                                </span>
                                            </div>
                                            <div className="financial-summary-item">
                                                <span className="financial-summary-label">Calculated Unit Cost</span>
                                                <span className="financial-summary-value">
                                                    {formatCurrency(calculatedUnitPrice)}
                                                </span>
                                            </div>
                                            <div className="financial-summary-item">
                                                <span className="financial-summary-label">Unit Profit Margin</span>
                                                <span
                                                    className={`financial-summary-value ${
                                                        profitMargin >= 0 ? 'positive' : 'negative'
                                                    }`}
                                                >
                                                    {isFixedPriceEnabled ? formatCurrency(profitMargin) : 'N/A (Dynamic)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Tax & VAT Settings */}
                                    <div className="form-section-header">
                                        <div className="form-section-icon-badge">
                                            <i className="bi bi-percent" />
                                        </div>
                                        <div>
                                            <h3 className="form-section-title">Tax & VAT Settings</h3>
                                            <p className="form-section-subtitle">
                                                Configure VAT percentage and optional included tax rates
                                            </p>
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        {/* VAT Percentage */}
                                        <div className="form-field-group">
                                            <label className="form-field-label">
                                                VAT Percentage (%) <span className="required-star">*</span>
                                            </label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-percent field-icon" />
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
                                                    <label className="form-field-label" style={{ marginBottom: 0 }}>
                                                        Tax Included
                                                    </label>
                                                    <div
                                                        className={`form-switch ${formDataState.isTaxIncluded ? 'active' : ''}`}
                                                        onClick={handleTaxToggle}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <div className="form-switch-handle" />
                                                    </div>
                                                </div>
                                                <div className="input-with-icon" style={{ marginTop: '0.5rem' }}>
                                                    <i className="bi bi-percent field-icon" />
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

                                    {/* Action Footer */}
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
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    />
                                                    {isEditMode ? 'Updating Product...' : 'Saving Product...'}
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check2-circle me-1" />
                                                    {isEditMode ? 'Update Product' : 'Save Product'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddItem;