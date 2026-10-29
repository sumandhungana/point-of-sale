import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import '../../../styles/Products.css';
import { getProduct, Item, getSingleProduct, deleteProduct } from "@/features/services/productService";
import { fetchCategories } from '@/features/services/categoryService';
import { Categories, CategoriesRef } from './Categories';
import { useAppSettings } from '@/context/AppSettingsContext';
import { resolveImageSrc } from '@/utils/ImageResolver';
import ViewProductModal from '../components/ViewProductModal';
import { usePermission } from '@/core/rbac/usePermission';

export const Products: React.FC = () => {
    const navigate = useNavigate();
    const { formatCurrency, formatNumber } = useAppSettings();

    // RBAC Permissions mapped to backend ProductController @Secured annotations
    const { hasPermission, isSuperAdmin } = usePermission();
    const canViewAll = isSuperAdmin || hasPermission('product:all');
    const canViewSingle = isSuperAdmin || hasPermission('product:single') || hasPermission('product:all');
    const canAdd = isSuperAdmin || hasPermission('product:add');
    const canEdit = isSuperAdmin || hasPermission('product:edit');
    const canDelete = isSuperAdmin || hasPermission('product:delete');

    // Module Active Tab State ('products' | 'categories')
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
    const [categoriesCount, setCategoriesCount] = useState<number>(0);
    const categoriesRef = useRef<CategoriesRef>(null);

    // View Product Modal State
    const [viewingItem, setViewingItem] = useState<Item | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isFetchingSingle, setIsFetchingSingle] = useState<boolean>(false);

    // Delete Product Confirmation State
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Products State Management
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('latest');
    const [filterBy, setFilterBy] = useState<string>('all');
    const [items, setItems] = useState<Item[]>([]);
    const [totalSalesPrice, setTotalSalesPrice] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const isFetchedRef = useRef(false);

    useEffect(() => {
        if (isFetchedRef.current) return;
        isFetchedRef.current = true;
        if (canViewAll) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [canViewAll]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getProduct(true);
            if (data) {
                setItems(data.items || []);
                setTotalSalesPrice(data.totalSalesPrice || 0);
                setTotalItems(data.totalItems || 0);
            } else {
                setError('No data received from server');
            }
        } catch (err) {
            setError('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }

        try {
            const cats = await fetchCategories();
            if (Array.isArray(cats)) {
                setCategoriesCount(cats.length);
            }
        } catch {
            // ignore
        }
    };

    // Keep category count refreshed when switching tabs
    useEffect(() => {
        fetchCategories().then(cats => {
            if (Array.isArray(cats)) setCategoriesCount(cats.length);
        }).catch(() => {});
    }, [activeTab]);

    // Calculate aggregated total gross purchase valuation across items
    const totalPurchaseValuation = items.reduce(
        (sum, item) => sum + (item.grossPurchasePrice || 0),
        0
    );

    // Low stock calculation: quantity at or below low stock alert threshold (defaults to 5)
    const isItemLowStock = (item: Item) => {
        const qty = item.itemCount ?? 0;
        const alertThreshold = item.lowStockAlert != null ? item.lowStockAlert : 5;
        return qty <= alertThreshold;
    };

    const lowStockCount = items.filter(isItemLowStock).length;

    const getRelativeTime = (date?: string) => {
        if (!date) return 'Recently';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Recently';
        const diffMs = Date.now() - d.getTime();
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 60) return `${Math.max(0, seconds)}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 30) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    // Filter & Sort Logic
    const filteredItems = items
        .filter((item: Item) => {
            const categoryName = item.category?.name || '';
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(item.id).includes(searchQuery);

            if (!matchesSearch) return false;

            const currentQty = item.itemCount ?? 0;

            if (filterBy === 'inStock') return currentQty > 0;
            if (filterBy === 'outOfStock') return currentQty <= 0;
            if (filterBy === 'lowStock') return isItemLowStock(item);

            return true;
        })
        .sort((a: Item, b: Item) => {
            const qtyA = a.itemCount ?? 0;
            const qtyB = b.itemCount ?? 0;

            const getItemTime = (item: Item) => {
                const dateStr = item.updatedAt || item.createdAt;
                if (dateStr) {
                    const time = new Date(dateStr).getTime();
                    if (!isNaN(time)) return time;
                }
                return item.id || 0;
            };

            switch (sortBy) {
                case 'latest': {
                    const timeA = getItemTime(a);
                    const timeB = getItemTime(b);
                    if (timeB !== timeA) return timeB - timeA;
                    return (b.id || 0) - (a.id || 0);
                }
                case 'oldest': {
                    const timeA = getItemTime(a);
                    const timeB = getItemTime(b);
                    if (timeA !== timeB) return timeA - timeB;
                    return (a.id || 0) - (b.id || 0);
                }
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return (b.fixedSellingPrice || 0) - (a.fixedSellingPrice || 0);
                case 'salesRevenue':
                    return (b.totalSalesAmount || 0) - (a.totalSalesAmount || 0);
                case 'purchasePrice':
                    return (b.perUnitPurchasePrice || 0) - (a.perUnitPurchasePrice || 0);
                case 'stock':
                    return qtyB - qtyA;
                default: {
                    const timeA = getItemTime(a);
                    const timeB = getItemTime(b);
                    if (timeB !== timeA) return timeB - timeA;
                    return (b.id || 0) - (a.id || 0);
                }
            }
        });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterBy(e.target.value);
    };

    // Single View implementation using getSingleProduct API
    const handleViewItem = async (item: Item, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!canViewSingle) return;
        setViewingItem(item);
        setIsViewModalOpen(true);
        setIsFetchingSingle(true);
        try {
            const fresh = await getSingleProduct(item.id);
            if (fresh) {
                setViewingItem(fresh);
            }
        } catch (err) {
            console.error('Failed to fetch product details', err);
        } finally {
            setIsFetchingSingle(false);
        }
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingItem(null);
    };

    // Single Edit implementation
    const handleEditItem = (item: Item, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!canEdit) return;
        setIsViewModalOpen(false);
        navigate(`/inventory/items/edit/${item.id}`, { state: { isEdit: true, initialValues: item } });
    };

    // Single Delete implementation using deleteProduct API
    const handlePromptDelete = (item: Item, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!canDelete) return;
        setItemToDelete(item);
        setIsViewModalOpen(false); // Close view product modal so confirmation modal is front and center
        setIsDeleteModalOpen(true);
    };

    const handleCancelDelete = () => {
        if (isDeleting) return;
        setIsDeleteModalOpen(false);
        // If we were viewing this item, reopen the view modal
        if (viewingItem && viewingItem.id === itemToDelete?.id) {
            setIsViewModalOpen(true);
        }
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteProduct(itemToDelete.id);
            if (res) {
                setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
                setTotalItems(prev => Math.max(0, prev - 1));
                if (viewingItem?.id === itemToDelete.id) {
                    setIsViewModalOpen(false);
                    setViewingItem(null);
                }
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            }
        } catch (err) {
            console.error('Failed to delete product', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddItem = () => {
        if (!canAdd) return;
        navigate('/inventory/items/add');
    };

    return (
        <div className="user-management-page-wrapper">
            <Sidebar />
            <div className="user-management-container">
                <Navbar />

                <div className="user-management-content">
                    {/* Top Page Header - Clean Add Purchase Bill Style */}
                    <div className="inventory-page-header">
                        <div className="inventory-header-info">
                            <div className="inventory-header-icon">
                                <i className={activeTab === 'products' ? 'bi bi-box-seam-fill' : 'bi bi-tags-fill'} />
                            </div>
                            <div>
                                <h1 className="inventory-header-title">
                                    {activeTab === 'products' ? 'Inventory Product List' : 'Category List'}
                                </h1>
                            </div>
                        </div>

                        {/*<div className="inventory-header-actions">*/}
                        {/*    {activeTab === 'products' ? (*/}
                        {/*        canAdd && (*/}
                        {/*            <button*/}
                        {/*                type="button"*/}
                        {/*                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"*/}
                        {/*                onClick={handleAddItem}*/}
                        {/*            >*/}
                        {/*                <i className="bi bi-plus-lg" />*/}
                        {/*                <span>Add Item</span>*/}
                        {/*            </button>*/}
                        {/*        )*/}
                        {/*    ) : (*/}
                        {/*        <button*/}
                        {/*            type="button"*/}
                        {/*            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"*/}
                        {/*            onClick={() => categoriesRef.current?.openAddModal()}*/}
                        {/*        >*/}
                        {/*            <i className="bi bi-plus-lg" />*/}
                        {/*            <span>Add Category</span>*/}
                        {/*        </button>*/}
                        {/*    )}*/}
                        {/*</div>*/}
                    </div>

                    {/* Module Navigation Header with Modern Segmented Switcher */}
                    <div className="module-nav-header">
                        <div className="segmented-tab-control" role="tablist" aria-label="Inventory Navigation">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'products'}
                                className={`segmented-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                                onClick={() => setActiveTab('products')}
                            >
                                <i className="bi bi-box-seam"></i>
                                <span>Product List</span>
                                <span className="tab-pill-badge">{totalItems}</span>
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'categories'}
                                className={`segmented-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                                onClick={() => setActiveTab('categories')}
                            >
                                <i className="bi bi-tags"></i>
                                <span>Categories</span>
                                {categoriesCount > 0 && (
                                    <span className="tab-pill-badge">{categoriesCount}</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Animated Tab View Content */}
                    <div key={activeTab} className={`tab-view-content tab-${activeTab}`}>
                        {activeTab === 'categories' ? (
                            <Categories ref={categoriesRef} />
                        ) : !canViewAll ? (
                            <div style={{
                                padding: '60px 20px',
                                textAlign: 'center',
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9',
                                color: '#64748b'
                            }}>
                                <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '16px' }}>
                                    <i className="bi bi-shield-lock-fill"></i>
                                </div>
                                <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '8px' }}>Access Denied</h3>
                                <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 16px', color: '#64748b' }}>
                                    You do not have permission to view inventory items. Required permission: <code>product:all</code>
                                </p>
                            </div>
                        ) : (
                            <>
                            {/* Stat Cards Summary (3 KPI Cards) */}
                            <div className="stat-card-grid">
                                <div className="stat-card stat-card-red">
                                    <div className="stat-icon-box red">
                                        <i className="bi bi-wallet2"></i>
                                    </div>
                                    <div className="stat-content">
                                        <div className="stat-label">Total Purchase Amount</div>
                                        <div className="stat-value red">{formatCurrency(totalPurchaseValuation)}</div>
                                    </div>
                                </div>

                                <div className="stat-card stat-card-green">
                                    <div className="stat-icon-box green">
                                        <i className="bi bi-graph-up-arrow"></i>
                                    </div>
                                    <div className="stat-content">
                                        <div className="stat-label">Total Sales Amount</div>
                                        <div className="stat-value green">{formatCurrency(totalSalesPrice)}</div>
                                    </div>
                                </div>

                                <div className="stat-card stat-card-blue">
                                    <div className="stat-icon-box blue">
                                        <i className="bi bi-box-seam"></i>
                                    </div>
                                    <div className="stat-content">
                                        <div className="stat-label">Total Items</div>
                                        <div className="stat-value blue">{formatNumber(totalItems, 0)} Items</div>
                                    </div>
                                </div>
                            </div>

                            {/* Search & Filter Controls */}
                            <div className="filter-controls-card">
                                <div className="filter-controls-grid">
                                    <div className="search-input-wrapper">
                                        <i className="bi bi-search search-icon"></i>
                                        <input
                                            type="text"
                                            placeholder="Search by item name, category, or ID..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="form-control search-input"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                className="search-clear-btn"
                                                onClick={() => setSearchQuery('')}
                                                aria-label="Clear search"
                                                title="Clear search"
                                            >
                                                <i className="bi bi-x-circle-fill"></i>
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-group-inline">
                                        <label>Sort:</label>
                                        <select value={sortBy} onChange={handleSortChange} className="form-control">
                                            <option value="latest">Latest Updated / Created</option>
                                            <option value="name">Name (A-Z)</option>
                                            <option value="price">Fixed Selling Price (High to Low)</option>
                                            <option value="salesRevenue">Total Sales Revenue (High to Low)</option>
                                            <option value="purchasePrice">Unit Purchase Price (High to Low)</option>
                                            <option value="stock">Stock Quantity (High to Low)</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>

                                    <div className="form-group-inline">
                                        <label>Filter:</label>
                                        <select value={filterBy} onChange={handleFilterChange} className="form-control">
                                            <option value="all">All Items</option>
                                            <option value="inStock">In Stock</option>
                                            <option value="outOfStock">Out of Stock</option>
                                            <option value="lowStock">Low Stock ({lowStockCount})</option>
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        className={`btn-low-stock ${filterBy === 'lowStock' ? 'active' : ''}`}
                                        onClick={() => setFilterBy(filterBy === 'lowStock' ? 'all' : 'lowStock')}
                                    >
                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                        {filterBy === 'lowStock' ? 'Show All' : `Low Stock (${lowStockCount})`}
                                    </button>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="inventory-list-container">
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', color: '#64748b' }}>
                                        <div className="spinner-border text-primary mb-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <div>Fetching inventory items...</div>
                                    </div>
                                ) : error ? (
                                    <div style={{ textAlign: 'center', padding: '16px', color: '#dc2626', background: 'rgba(220, 38, 38, 0.08)', borderRadius: '10px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {error}
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 24px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                                        <div style={{ fontSize: '42px', marginBottom: '12px' }}>📦</div>
                                        <h4 style={{ color: '#021861', fontWeight: 700, marginBottom: '6px' }}>No Inventory Items Found</h4>
                                        <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 16px' }}>
                                            No items match your search or filter criteria. Click below to add a new inventory item.
                                        </p>
                                        {canAdd && (
                                            <button
                                                type="button"
                                                onClick={handleAddItem}
                                                style={{
                                                    padding: '9px 20px',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #255DCE 0%, #021861 100%)',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                + Add New Product
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    filteredItems.map((item: Item) => {
                                        const qty = item.itemCount ?? 0;
                                        const unit = item.unit || 'pcs';
                                        const grossPurchase = item.grossPurchasePrice || 0;
                                        const fixedSelling = item.fixedSellingPrice || 0;
                                        const totalSales = item.totalSalesAmount || 0;
                                        const alertThreshold = item.lowStockAlert != null ? item.lowStockAlert : 5;
                                        const imageSrc = item.imageUrl ? resolveImageSrc(item.imageUrl) : '';

                                        return (
                                            <div
                                                key={item.id}
                                                className={`inventory-item-card ${!canViewSingle ? 'no-click' : ''}`}
                                                onClick={() => canViewSingle && handleViewItem(item)}
                                                style={{ cursor: canViewSingle ? 'pointer' : 'default' }}
                                                title={canViewSingle ? 'Click to view product details' : undefined}
                                            >
                                                <div className="inventory-item-main">
                                                    <div className="inventory-item-avatar">
                                                        {imageSrc ? (
                                                            <img
                                                                src={imageSrc}
                                                                alt={item.name}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <i className="bi bi-box-seam"></i>
                                                        )}
                                                    </div>

                                                    <div className="inventory-item-details">
                                                        {/* Top Row: Item name, Category */}
                                                        <div className="inventory-item-title-row">
                                                            <h3 className="inventory-item-name">{item.name}</h3>
                                                            <span className="badge-role">
                                                                {item.category?.name || 'Uncategorized'}
                                                            </span>
                                                        </div>

                                                        {/* Second Row: In stock item status */}
                                                        <div className="inventory-item-stock-row">
                                                            {qty <= 0 ? (
                                                                <span className="badge-stock out-of-stock">
                                                                    <i className="bi bi-x-circle-fill"></i> Out of stock
                                                                </span>
                                                            ) : qty <= alertThreshold ? (
                                                                <span className="badge-stock low-stock">
                                                                    <i className="bi bi-exclamation-triangle-fill"></i> Low stock ({qty} {unit})
                                                                </span>
                                                            ) : (
                                                                <span className="badge-stock in-stock">
                                                                    <i className="bi bi-check-circle-fill"></i> In stock ({qty} {unit})
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Below that: Date */}
                                                        <div className="inventory-item-date-row">
                                                            <i className="bi bi-clock me-1 text-muted"></i>
                                                            <span>{getRelativeTime(item.updatedAt || item.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column: Stacked in vertical order (Purchase Amount in Red, Fixed Selling Price in Blue, Sales Amount in Green) */}
                                                <div className="inventory-item-right">
                                                    <div className="inventory-prices-group">
                                                        <div className="inventory-price-box purchase-box">
                                                            <span className="inventory-price-label">Purchase Amount:</span>
                                                            <span className="inventory-price-value purchase">
                                                                {formatCurrency(grossPurchase)}
                                                            </span>
                                                        </div>

                                                        {fixedSelling > 0 && (
                                                             <div className="inventory-price-box selling-box">
                                                                <span className="inventory-price-label">Fixed Selling Price:</span>
                                                                <span className="inventory-price-value selling">
                                                                    {formatCurrency(fixedSelling)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="inventory-price-box sales-box">
                                                            <span className="inventory-price-label">Sales Amount:</span>
                                                            <span className="inventory-price-value sales">
                                                                {formatCurrency(totalSales)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* View Product Modal with Single View, Edit, and Delete options */}
                            <ViewProductModal
                                isOpen={isViewModalOpen}
                                onClose={handleCloseViewModal}
                                item={viewingItem}
                                onEdit={(item) => handleEditItem(item)}
                                onDelete={(item) => handlePromptDelete(item)}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                isLoading={isFetchingSingle}
                            />
                        </>
                    )}
                    </div>

                    {/* Truly Sticky Floating Add Item Button - Fixed to Browser Viewport */}
                    {activeTab === 'products' && canAdd && (
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="sticky-add-btn"
                            title="Add New Product"
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add Item
                        </button>
                    )}

                    {/* Delete Confirmation Modal - Rendered via Portal for proper viewport centering & overlay */}
                    {isDeleteModalOpen && itemToDelete && ReactDOM.createPortal(
                        <div
                            className="delete-modal-overlay"
                            onClick={() => !isDeleting && handleCancelDelete()}
                        >
                            <div
                                className="delete-modal-card"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#dc2626',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '28px',
                                        margin: '0 auto 16px'
                                    }}>
                                        <i className="bi bi-trash3-fill"></i>
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                        Delete Product?
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                        Are you sure you want to delete <strong>"{itemToDelete.name}"</strong>? This action cannot be undone.
                                    </p>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    padding: '16px 24px',
                                    background: '#f8fafc',
                                    borderTop: '1px solid #e2e8f0',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={handleCancelDelete}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            background: '#ffffff',
                                            color: '#475569',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            cursor: isDeleting ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={handleConfirmDelete}
                                        style={{
                                            padding: '10px 22px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#dc2626',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                                        }}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-trash3"></i>
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;
