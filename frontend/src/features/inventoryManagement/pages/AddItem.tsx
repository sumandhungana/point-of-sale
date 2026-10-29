import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchCategories } from '../../services/categoryService';
import { addProduct,  getSingleProduct, updateProduct, AddProductRequest, EditProductUCRequest, Item } from '../../services/productService';
import { resolveImageSrc } from '@/utils/ImageResolver';
import { useAppSettings } from '@/context/AppSettingsContext';
import { usePermission } from '@/core/rbac/usePermission';
import AccessDenied from '@/shared/components/AccessDenied';
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

    const { hasPermission, isSuperAdmin } = usePermission();
    const canAdd = isSuperAdmin || hasPermission('product:add');
    const canEdit = isSuperAdmin || hasPermission('product:edit');

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

    // Control state for enabling/disabling Tax & VAT
    const [isTaxEnabled, setIsTaxEnabled] = useState<boolean>(false);

    // Control state for enabling/disabling purchase price editing in Edit Mode
    const [isPriceEditEnabled, setIsPriceEditEnabled] = useState<boolean>(!isEditMode);
    const [showPriceWarningModal, setShowPriceWarningModal] = useState<boolean>(false);

    const handleTogglePriceEdit = () => {
        if (!isPriceEditEnabled) {
            setShowPriceWarningModal(true);
        } else {
            setIsPriceEditEnabled(false);
        }
    };

    const handleConfirmPriceEdit = () => {
        setIsPriceEditEnabled(true);
        setShowPriceWarningModal(false);
    };

    const handleDiscardPriceEdit = () => {
        setIsPriceEditEnabled(false);
        setShowPriceWarningModal(false);
    };

    // Web image search state (Browse from browser / Google search)
    const [showWebSearch, setShowWebSearch] = useState<boolean>(false);
    const [imageSearchQuery, setImageSearchQuery] = useState<string>('');
    const [isSearchingImages, setIsSearchingImages] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<Array<{ id: number; title: string; thumbUrl: string; fullUrl: string }>>([]);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);

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
        taxPercentage: '0',
        vatPercentage: '0',
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

        const hasVat = item.vatPercentage !== undefined && item.vatPercentage !== null && Number(item.vatPercentage) > 0;
        const hasTax = item.taxPercentage !== undefined && item.taxPercentage !== null && Number(item.taxPercentage) > 0;
        const isTaxActive = Boolean(item.isTaxIncluded || hasVat || hasTax);
        setIsTaxEnabled(isTaxActive);

        setFormDataState({
            name: item.name || '',
            itemCount: item.itemCount !== undefined && item.itemCount !== null ? String(item.itemCount) : '',
            unit: item.unit || 'pcs',
            lowStockAlert: item.lowStockAlert !== undefined && item.lowStockAlert !== null ? String(item.lowStockAlert) : '',
            categoryId: catId,
            salesPrice: hasFixedPrice ? String(fixedPrice) : '',
            grossPurchasePrice: gross !== undefined && gross !== null ? String(gross) : '',
            perUnitPurchasePrice: perUnit !== undefined && perUnit !== null ? String(perUnit) : '',
            isTaxIncluded: Boolean(item.isTaxIncluded),
            taxPercentage: item.taxPercentage !== undefined && item.taxPercentage !== null ? String(item.taxPercentage) : '0',
            vatPercentage: item.vatPercentage !== undefined && item.vatPercentage !== null ? String(item.vatPercentage) : '0',
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

    // If edit mode via URL param, fetch the product using getSingleProduct
    useEffect(() => {
        if (isEditMode && paramId) {
            const numericId = Number(paramId);
            if (!isNaN(numericId) && numericId > 0) {
                setFetchingItem(true);
                getSingleProduct(numericId)
                    .then((product) => {
                        if (product) {
                            setActiveItem(product);
                            populateFormData(product);
                        } else if (!passedInitialValues) {
                            setError(`Item with ID #${paramId} not found.`);
                        }
                    })
                    .catch((err) => {
                        console.error('Error fetching product for edit:', err);
                        if (!passedInitialValues) {
                            setError('Failed to fetch product details.');
                        }
                    })
                    .finally(() => setFetchingItem(false));
            }
        }
    }, [isEditMode, paramId]);

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

    // Toggle Tax & VAT Enable option
    const handleTaxEnableToggle = () => {
        setIsTaxEnabled((prev) => {
            const next = !prev;
            if (!next) {
                setFormDataState((f) => ({
                    ...f,
                    vatPercentage: '0',
                    taxPercentage: '0',
                    isTaxIncluded: false,
                }));
            } else {
                setFormDataState((f) => ({
                    ...f,
                    vatPercentage: f.vatPercentage && f.vatPercentage !== '' ? f.vatPercentage : '0',
                    taxPercentage: f.taxPercentage && f.taxPercentage !== '' ? f.taxPercentage : '0',
                }));
            }
            return next;
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
        const vat = isTaxEnabled ? (parseFloat(formDataState.vatPercentage) || 0) : 0;
        const tax = isTaxEnabled ? (parseFloat(formDataState.taxPercentage) || 0) : 0;
        const isTaxInc = isTaxEnabled ? formDataState.isTaxIncluded : false;

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
                    isTaxIncluded: isTaxInc,
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
                    isTaxIncluded: isTaxInc,
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

    const handleSearchWebImages = async (queryToSearch?: string) => {
        const query = (queryToSearch !== undefined ? queryToSearch : imageSearchQuery).trim() || formDataState.name.trim();
        if (!query) {
            setSearchMessage('Please enter a product name or keyword to search.');
            return;
        }

        setIsSearchingImages(true);
        setSearchMessage(null);

        try {
            const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
                query
            )}&gsrlimit=16&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`;

            const res = await fetch(endpoint);
            const data = await res.json();
            const pages = data?.query?.pages;

            if (!pages || Object.keys(pages).length === 0) {
                setSearchResults([]);
                setSearchMessage(`No direct image results found for "${query}". You can open Google Images or paste a copied image.`);
            } else {
                const list = Object.values(pages)
                    .map((p: any) => {
                        const info = p.imageinfo?.[0];
                        const thumb = info?.thumburl || info?.url;
                        return {
                            id: p.pageid,
                            title: (p.title || '').replace(/^File:/i, ''),
                            thumbUrl: thumb,
                            fullUrl: info?.url || thumb,
                        };
                    })
                    .filter((img: any) => Boolean(img.thumbUrl && !img.thumbUrl.toLowerCase().endsWith('.svg') && !img.thumbUrl.toLowerCase().endsWith('.ogg') && !img.thumbUrl.toLowerCase().endsWith('.pdf')));

                setSearchResults(list);
                if (list.length === 0) {
                    setSearchMessage(`No image previews found for "${query}". Try different words or click Google Search.`);
                }
            }
        } catch (err) {
            console.error('Image search error:', err);
            setSearchMessage('Failed to fetch images from the web. Please try again or search on Google.');
        } finally {
            setIsSearchingImages(false);
        }
    };

    const handleToggleWebSearch = () => {
        setShowWebSearch((prev) => {
            const next = !prev;
            if (next && !imageSearchQuery && formDataState.name) {
                setImageSearchQuery(formDataState.name);
                handleSearchWebImages(formDataState.name);
            }
            return next;
        });
    };

    const handleSelectImage = (imgUrl: string) => {
        setImagePreview(imgUrl);
        setFormDataState((prev) => ({
            ...prev,
            imageUrl: imgUrl,
        }));
        setShowWebSearch(false);
    };

    const handleOpenGoogleSearch = () => {
        const query = (imageSearchQuery.trim() || formDataState.name.trim() || 'product') + ' photo';
        window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
    };

    const handlePasteFromClipboard = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.read) {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    const imgType = item.types.find((t) => t.startsWith('image/'));
                    if (imgType) {
                        const blob = await item.getType(imgType);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result as string;
                            setImagePreview(base64);
                            setFormDataState((prev) => ({ ...prev, imageUrl: base64 }));
                            setShowWebSearch(false);
                        };
                        reader.readAsDataURL(blob);
                        return;
                    }
                }
            }

            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
                    setImagePreview(text.trim());
                    setFormDataState((prev) => ({ ...prev, imageUrl: text.trim() }));
                    setShowWebSearch(false);
                    return;
                }
            }

            alert('No image found in clipboard. Right-click an image on Google and select "Copy image", then click Paste!');
        } catch {
            alert('To paste an image from clipboard, press Ctrl+V on your keyboard.');
        }
    };

    // Close popup on ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showWebSearch) {
                setShowWebSearch(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showWebSearch]);

    // Global paste listener: allows user to press Ctrl+V to paste an image copied from Google/browser
    useEffect(() => {
        const handleGlobalPaste = (e: Event) => {
            const clipEvent = e as ClipboardEvent;
            const items = clipEvent.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        e.preventDefault();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result as string;
                            setImagePreview(base64);
                            setFormDataState((prev) => ({ ...prev, imageUrl: base64 }));
                            setShowWebSearch(false);
                        };
                        reader.readAsDataURL(blob);
                        return;
                    }
                }
            }

            // If user copied image link from browser and pastes it while web search is open
            if (showWebSearch) {
                const text = clipEvent.clipboardData?.getData('text');
                if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
                    e.preventDefault();
                    setImagePreview(text.trim());
                    setFormDataState((prev) => ({ ...prev, imageUrl: text.trim() }));
                    setShowWebSearch(false);
                }
            }
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [showWebSearch]);

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

    if (isEditMode && !canEdit) {
        return (
            <div className="add-item-page-wrapper">
                <Sidebar />
                <div className="add-item-container">
                    <Navbar />
                    <main className="add-item-main-content">
                        <AccessDenied message="You do not have permission to edit inventory products." />
                    </main>
                </div>
            </div>
        );
    }

    if (!isEditMode && !canAdd) {
        return (
            <div className="add-item-page-wrapper">
                <Sidebar />
                <div className="add-item-container">
                    <Navbar />
                    <main className="add-item-main-content">
                        <AccessDenied message="You do not have permission to add new inventory products." />
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="add-item-page-wrapper">
            <Sidebar />

            <div className="add-item-container">
                <Navbar />

                <main className="add-item-main-content">
                    {/* Header directly on plain page background - no box */}
                    <div className="add-item-page-header">
                        <div className="add-item-header-info">
                            <div className="add-item-header-icon">
                                <i className="bi bi-box-seam-fill" />
                            </div>
                            <div>
                                <h1 className="add-item-header-title">
                                    {isEditMode ? 'Edit Product' : 'Add New Item'}
                                </h1>
                            </div>
                        </div>

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

                    <div className="add-item-card">

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
                                    {/* Compact Product Photo Card: Browse Device (Local Storage) & Browse from Web (Browser) */}
                                    <div className="compact-photo-card">
                                        <div
                                            className="compact-photo-avatar-wrap"
                                            onClick={handlePhotoClick}
                                            role="button"
                                            tabIndex={0}
                                            title={imagePreview ? "Change Photo" : "Upload Photo"}
                                        >
                                            <div className="compact-photo-avatar-frame">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Product"
                                                        className="compact-photo-img"
                                                        onError={() => setImagePreview(null)}
                                                    />
                                                ) : (
                                                    <div className="compact-photo-fallback">
                                                        <i className="bi bi-box-seam" />
                                                    </div>
                                                )}
                                                <div className="compact-photo-overlay">
                                                    <i className="bi bi-camera-fill" />
                                                </div>
                                            </div>
                                            <div className="compact-photo-badge" title="Browse Photo">
                                                <i className="bi bi-plus" />
                                            </div>
                                        </div>

                                        <div className="compact-photo-content">
                                            <div className="compact-photo-header">
                                                <div>
                                                    <h4 className="compact-photo-title">Product Photo</h4>
                                                    <span className="compact-photo-subtitle">
                                                        Browse from computer storage or web browser / Less than 2MB
                                                    </span>
                                                </div>
                                                {imagePreview && (
                                                    <button
                                                        type="button"
                                                        className="btn-compact-remove"
                                                        onClick={handleRemoveImage}
                                                        title="Remove Photo"
                                                    >
                                                        <i className="bi bi-trash3 me-1" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="compact-photo-actions">
                                                <button
                                                    type="button"
                                                    className="btn-photo-source"
                                                    onClick={handlePhotoClick}
                                                    title="Browse from computer storage"
                                                >
                                                    <i className="bi bi-hdd me-1" />
                                                    Browse Computer
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn-photo-source ${showWebSearch ? 'active' : ''}`}
                                                    onClick={handleToggleWebSearch}
                                                    title="Type to search web images or open Google Images"
                                                >
                                                    <i className="bi bi-search me-1" />
                                                    Browse from Browser
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
                                    </div>

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
                                        <div className="form-field-group form-field-full">
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
                                    </div>

                                    {/* Section 2: Pricing & Valuation */}
                                    <div className="form-section-header pricing-section-header">
                                        <div className="form-section-header-left">
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

                                        {isEditMode && (
                                            <div
                                                className="pricing-edit-toggle-container"
                                                onClick={handleTogglePriceEdit}
                                                role="button"
                                                tabIndex={0}
                                                style={{ cursor: 'pointer' }}
                                                title={isPriceEditEnabled ? 'Click to disable pricing edit' : 'Click to enable pricing edit'}
                                                aria-label="Toggle price editing"
                                            >
                                                <span className={`pricing-toggle-status-text ${isPriceEditEnabled ? 'enabled' : 'disabled'}`}>
                                                    {isPriceEditEnabled ? (
                                                        <>
                                                            <i className="bi bi-unlock-fill me-1" />
                                                            Price Editing Enabled
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-lock-fill me-1" />
                                                            Price Editing Disabled
                                                        </>
                                                    )}
                                                </span>
                                                <div
                                                    className={`form-switch ${isPriceEditEnabled ? 'active' : ''}`}
                                                >
                                                    <div className="form-switch-handle" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* If Edit Mode and Disabled: show locked card */}
                                    {isEditMode && !isPriceEditEnabled ? (
                                        <div className="pricing-locked-card">
                                            <div className="pricing-locked-icon-wrap">
                                                <i className="bi bi-shield-lock-fill" />
                                            </div>
                                            <div className="pricing-locked-content">
                                                <h4 className="pricing-locked-title">Purchase Rates & Calculation Mode Locked</h4>
                                                <p className="pricing-locked-desc">
                                                    Purchase rates are locked for existing products to maintain inventory valuation integrity.
                                                    Enable price editing above if you need to correct erroneous prices.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-unlock-pricing"
                                                onClick={handleTogglePriceEdit}
                                            >
                                                <i className="bi bi-unlock me-1" />
                                                Enable
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Pricing Mode Segmented Selector */}
                                            <div className="pricing-mode-container">
                                                <div className="pricing-mode-header">
                                                    <div>
                                                        <label className="pricing-mode-label">
                                                            <i className="bi bi-arrow-left-right me-2 text-primary" />
                                                            Pricing Calculation Mode
                                                        </label>
                                                        <p className="pricing-mode-subtext">
                                                            Click to switch which price you enter manually. The other price is calculated automatically.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pricing-mode-cards-grid">
                                                    {/* Option 1: Total Price Mode */}
                                                    <div
                                                        className={`pricing-mode-card ${priceType === 'gross' ? 'selected' : ''}`}
                                                        onClick={() => handlePriceTypeChange('gross')}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <div className="pricing-mode-radio-wrap">
                                                            <div className={`pricing-mode-radio ${priceType === 'gross' ? 'checked' : ''}`}>
                                                                {priceType === 'gross' && <div className="pricing-mode-radio-dot" />}
                                                            </div>
                                                        </div>

                                                        <div className="pricing-mode-card-content">
                                                            <div className="pricing-mode-card-title-row">
                                                                <span className="pricing-mode-card-title">
                                                                    <i className="bi bi-cash-stack me-2" />
                                                                    Total Purchase Price Mode
                                                                </span>
                                                                <span className={`pricing-mode-badge ${priceType === 'gross' ? 'active' : ''}`}>
                                                                    {priceType === 'gross' ? 'Active Input' : 'Auto-Calculated'}
                                                                </span>
                                                            </div>
                                                            <p className="pricing-mode-card-desc">
                                                                Type bulk total price paid. Single unit price is auto-calculated (Total ÷ Qty).
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Option 2: Single Unit Price Mode */}
                                                    <div
                                                        className={`pricing-mode-card ${priceType === 'perUnit' ? 'selected' : ''}`}
                                                        onClick={() => handlePriceTypeChange('perUnit')}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <div className="pricing-mode-radio-wrap">
                                                            <div className={`pricing-mode-radio ${priceType === 'perUnit' ? 'checked' : ''}`}>
                                                                {priceType === 'perUnit' && <div className="pricing-mode-radio-dot" />}
                                                            </div>
                                                        </div>

                                                        <div className="pricing-mode-card-content">
                                                            <div className="pricing-mode-card-title-row">
                                                                <span className="pricing-mode-card-title">
                                                                    <i className="bi bi-tag-fill me-2" />
                                                                    Single Purchase Price Mode
                                                                </span>
                                                                <span className={`pricing-mode-badge ${priceType === 'perUnit' ? 'active' : ''}`}>
                                                                    {priceType === 'perUnit' ? 'Active Input' : 'Auto-Calculated'}
                                                                </span>
                                                            </div>
                                                            <p className="pricing-mode-card-desc">
                                                                Type single piece rate. Total bulk price is auto-calculated (Single × Qty).
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-grid">
                                                {/* Total Purchase Price */}
                                                <div className="form-field-group">
                                                    <label className="form-field-label price-label-row">
                                                        <span>
                                                            Total Purchase Price{' '}
                                                            {priceType === 'gross' && <span className="required-star">*</span>}
                                                        </span>
                                                        <span className={`price-field-status-badge ${priceType === 'gross' ? 'editable' : 'calculated'}`}>
                                                            {priceType === 'gross' ? '✏️ Editable' : '⚡ Auto-Calculated'}
                                                        </span>
                                                    </label>
                                                    <div className={`input-with-icon ${priceType !== 'gross' ? 'field-calculated' : ''}`}>
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
                                                            required={priceType === 'gross' && (!isEditMode || isPriceEditEnabled)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Single Purchase Price */}
                                                <div className="form-field-group">
                                                    <label className="form-field-label price-label-row">
                                                        <span>
                                                            Single Purchase Price{' '}
                                                            {priceType === 'perUnit' && <span className="required-star">*</span>}
                                                        </span>
                                                        <span className={`price-field-status-badge ${priceType === 'perUnit' ? 'editable' : 'calculated'}`}>
                                                            {priceType === 'perUnit' ? '✏️ Editable' : '⚡ Auto-Calculated'}
                                                        </span>
                                                    </label>
                                                    <div className={`input-with-icon ${priceType !== 'perUnit' ? 'field-calculated' : ''}`}>
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
                                                            required={priceType === 'perUnit' && (!isEditMode || isPriceEditEnabled)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="form-grid" style={{ marginTop: '1rem' }}>

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
                                                <span className="financial-summary-label">Single Purchase Price</span>
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
                                    {/*<div className="form-section-header">*/}
                                    {/*    <div className="form-section-icon-badge">*/}
                                    {/*        <i className="bi bi-percent" />*/}
                                    {/*    </div>*/}
                                    {/*    <div>*/}
                                    {/*        <h3 className="form-section-title">Tax & VAT Settings</h3>*/}
                                    {/*        <p className="form-section-subtitle">*/}
                                    {/*            Configure VAT percentage and optional included tax rates*/}
                                    {/*        </p>*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}

                                    {/* Enable Option Toggle Card */}
                                    <div className="tax-enable-card">
                                        <div className="tax-enable-info">
                                            <div>
                                                <h4 className="tax-enable-title">Enable Tax & VAT</h4>
                                                <p className="tax-enable-desc">
                                                    Toggle on to configure custom VAT and additional Tax rates
                                                </p>
                                            </div>
                                            <div
                                                className={`form-switch ${isTaxEnabled ? 'active' : ''}`}
                                                onClick={handleTaxEnableToggle}
                                                role="button"
                                                tabIndex={0}
                                                title={isTaxEnabled ? "Tax & VAT is Enabled" : "Tax & VAT is Disabled"}
                                            >
                                                <div className="form-switch-handle" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Options for Tax and VAT visible only when enabled */}
                                    {isTaxEnabled && (
                                        <div className="form-grid mt-3">
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
                                                        placeholder="0"
                                                        step="0.01"
                                                        min="0"
                                                        required={isTaxEnabled}
                                                    />
                                                </div>
                                            </div>

                                            {/* Tax Percentage */}
                                            <div className="form-field-group">
                                                <label className="form-field-label">
                                                    Tax Percentage (%)
                                                </label>
                                                <div className="input-with-icon">
                                                    <i className="bi bi-percent field-icon" />
                                                    <input
                                                        type="number"
                                                        name="taxPercentage"
                                                        value={formDataState.taxPercentage}
                                                        onChange={handleInputChange}
                                                        className="form-field-input"
                                                        placeholder="0"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

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

            {/* Modal Popup: Browse Photo from Browser */}
            {showWebSearch && (
                <div
                    className="web-search-modal-backdrop"
                    onClick={() => setShowWebSearch(false)}
                >
                    <div
                        className="web-search-modal-dialog"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="web-search-modal-header">
                            <div className="web-search-modal-header-left">
                                <div className="web-search-modal-icon">
                                    <i className="bi bi-globe2" />
                                </div>
                                <div>
                                    <h3 className="web-search-modal-title">Browse Product Photo</h3>
                                    <p className="web-search-modal-subtitle">
                                        Type product name to search web photos or open Google Images
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="web-search-modal-close"
                                onClick={() => setShowWebSearch(false)}
                                title="Close popup (Esc)"
                            >
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="web-search-modal-body">
                            <div className="web-search-header-row">
                                <div className="web-search-input-wrap">
                                    <i className="bi bi-search search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Type product name (e.g. Coca Cola, Basmati Rice)..."
                                        value={imageSearchQuery}
                                        onChange={(e) => setImageSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchWebImages();
                                            }
                                        }}
                                        className="web-search-input"
                                        autoFocus
                                    />
                                    {imageSearchQuery && (
                                        <button
                                            type="button"
                                            className="web-search-clear-btn"
                                            onClick={() => {
                                                setImageSearchQuery('');
                                                setSearchResults([]);
                                                setSearchMessage(null);
                                            }}
                                            title="Clear search"
                                        >
                                            <i className="bi bi-x" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="btn-web-search-exec"
                                    onClick={() => handleSearchWebImages()}
                                    disabled={isSearchingImages}
                                    title="Search web images"
                                >
                                    {isSearchingImages ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-search me-1" />
                                            Search
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn-google-search-external"
                                    onClick={handleOpenGoogleSearch}
                                    title="Open Google Images in new tab"
                                >
                                    <i className="bi bi-google me-1" />
                                    Google Images <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '11px' }} />
                                </button>

                                <button
                                    type="button"
                                    className="btn-paste-clipboard"
                                    onClick={handlePasteFromClipboard}
                                    title="Paste copied image from Google / clipboard (or press Ctrl+V)"
                                >
                                    <i className="bi bi-clipboard2-check me-1" />
                                    Paste Image
                                </button>
                            </div>

                            <div className="web-search-hint">
                                <i className="bi bi-info-circle me-1" />
                                <span>
                                    <strong>No link needed:</strong> Click any photo below to select it immediately, or right-click <em>Copy image</em> on Google and press <strong>Ctrl+V</strong>.
                                </span>
                            </div>

                            {isSearchingImages && (
                                <div className="web-search-loading">
                                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                                    <span>Searching web photos for &ldquo;{imageSearchQuery || formDataState.name}&rdquo;...</span>
                                </div>
                            )}

                            {searchMessage && !isSearchingImages && (
                                <div className="web-search-msg">
                                    <span>{searchMessage}</span>
                                </div>
                            )}

                            {searchResults.length > 0 && !isSearchingImages ? (
                                <div className="web-search-results-grid">
                                    {searchResults.map((img) => (
                                        <div
                                            key={img.id}
                                            className={`web-search-item-card ${formDataState.imageUrl === img.thumbUrl ? 'selected' : ''}`}
                                            onClick={() => handleSelectImage(img.thumbUrl)}
                                            title={img.title || 'Click to select photo'}
                                        >
                                            <img
                                                src={img.thumbUrl}
                                                alt={img.title}
                                                className="web-search-item-img"
                                                loading="lazy"
                                            />
                                            {formDataState.imageUrl === img.thumbUrl && (
                                                <div className="web-search-selected-badge">
                                                    <i className="bi bi-check-lg" />
                                                </div>
                                            )}
                                            <div className="web-search-item-overlay">
                                                <span>Select Photo</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !isSearchingImages && !searchMessage && (
                                <div className="web-search-empty-prompt">
                                    <i className="bi bi-images prompt-icon" />
                                    <h4 className="prompt-title">Search product photos from browser</h4>
                                    <p className="prompt-subtitle">
                                        Type what you are looking for above (e.g. <em>Coca Cola</em>, <em>Basmati Rice</em>, <em>Headphones</em>) and hit Search, or copy any image from Google and press <strong>Ctrl+V</strong>.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="web-search-modal-footer">
                            <span className="web-modal-tip">
                                <i className="bi bi-keyboard me-1" /> Press ESC or click outside to close
                            </span>
                            <button
                                type="button"
                                className="btn-web-modal-close"
                                onClick={() => setShowWebSearch(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Popup Modal for Enabling Price Editing in Edit Mode */}
            {isEditMode && showPriceWarningModal && ReactDOM.createPortal(
                <div
                    className="price-warning-modal-overlay"
                    onClick={handleDiscardPriceEdit}
                >
                    <div
                        className="price-warning-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="price-warning-modal-header">
                            <div className="price-warning-header-content">
                                <div className="price-warning-icon-wrap">
                                    <i className="bi bi-exclamation-triangle-fill" />
                                </div>
                                <div className="price-warning-title-wrap">
                                    <h3 className="price-warning-modal-title">
                                        Warning: Edit at Your Own Risk
                                    </h3>
                                    <p className="price-warning-modal-text">
                                        Directly modifying pricing rates is intended for <strong>correcting wrong prices only</strong>.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="form-close-btn"
                                onClick={handleDiscardPriceEdit}
                                aria-label="Close"
                                title="Close"
                            >
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>

                        <div className="price-warning-modal-body">
                            <div className="price-warning-info-callout">
                                <i className="bi bi-info-circle-fill" />
                                <span>
                                    To record incoming inventory or newly added products, please go to the <strong>Purchase Bills</strong> module and add a purchase rather than altering existing product cost rates here.
                                </span>
                            </div>
                        </div>

                        <div className="price-warning-modal-footer">
                            <button
                                type="button"
                                className="btn-warning-discard"
                                onClick={handleDiscardPriceEdit}
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                className="btn-warning-confirm"
                                onClick={handleConfirmPriceEdit}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AddItem;