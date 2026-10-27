import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import '../../../styles/Products.css';
import { getProduct, Item } from "@/features/services/productService";
import { fetchCategories } from '@/features/services/categoryService';
import { Categories } from './Categories';
import { useAppSettings } from '@/context/AppSettingsContext';
import { resolveImageSrc } from '../../../utils/ImageResolver';
import ViewProductModal from '../components/ViewProductModal';

export const Products: React.FC = () => {
    const navigate = useNavigate();
    const { formatCurrency, formatNumber } = useAppSettings();

    // Module Active Tab State ('products' | 'categories')
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
    const [categoriesCount, setCategoriesCount] = useState<number>(0);


    // View Product Modal State
    const [viewingItem, setViewingItem] = useState<Item | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

    // Products State Management
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('name');
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
        loadData();
    }, []);

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

    // Calculate low stock and out of stock counts
    const lowStockCount = items.filter(
        (item) => (item.itemCount ?? 0) > 0 && (item.itemCount ?? 0) <= (item.lowStockAlert || 5)
    ).length;

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
            const alertThreshold = item.lowStockAlert || 5;

            if (filterBy === 'inStock') return currentQty > 0;
            if (filterBy === 'outOfStock') return currentQty <= 0;
            if (filterBy === 'lowStock') return currentQty > 0 && currentQty <= alertThreshold;

            return true;
        })
        .sort((a: Item, b: Item) => {
            const qtyA = a.itemCount ?? 0;
            const qtyB = b.itemCount ?? 0;

            switch (sortBy) {
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
                default:
                    return 0;
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

    const handleViewItem = (item: Item, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setViewingItem(item);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingItem(null);
    };

    const handleEditItem = (item: Item, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsViewModalOpen(false);
        navigate(`/inventory/items/edit/${item.id}`, { state: { isEdit: true, initialValues: item } });
    };

    const handleAddItem = () => {
        navigate('/inventory/items/add');
    };

    return (
        <div className="user-management-page-wrapper">
            <Sidebar />
            <div className="user-management-container">
                <Navbar />

                <div className="user-management-content">
                    {/* Module Navigation Header with Modern Segmented Switcher & Contextual Chip */}
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

                        {/* Visual Context Indicator Chip */}
                        {/*<div className={`tab-context-chip ${activeTab === 'products' ? 'products-chip' : 'categories-chip'}`}>*/}
                        {/*    {activeTab === 'products' ? (*/}
                        {/*        <>*/}
                        {/*            <i className="bi bi-boxes"></i>*/}
                        {/*            <span>Product Catalog & Stock</span>*/}
                        {/*        </>*/}
                        {/*    ) : (*/}
                        {/*        <>*/}
                        {/*            <i className="bi bi-diagram-3-fill"></i>*/}
                        {/*            <span>Category Classifications</span>*/}
                        {/*        </>*/}
                        {/*    )}*/}
                        {/*</div>*/}
                    </div>

                    {/* Animated Tab View Content */}
                    <div key={activeTab} className={`tab-view-content tab-${activeTab}`}>
                        {activeTab === 'categories' ? (
                            <Categories />
                        ) : (
                            <>
                            {/* Stat Cards Summary (Centered KPI Cards) */}
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
                                            <option value="name">Name (A-Z)</option>
                                            <option value="price">Fixed Selling Price (High to Low)</option>
                                            <option value="salesRevenue">Total Sales Revenue (High to Low)</option>
                                            <option value="purchasePrice">Unit Purchase Price (High to Low)</option>
                                            <option value="stock">Stock Quantity (High to Low)</option>
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
                                        </div>
                                    ) : (
                                        filteredItems.map((item: Item) => {
                                            const qty = item.itemCount ?? 0;
                                            const unit = item.unit || 'pcs';
                                            const grossPurchase = item.grossPurchasePrice || 0;
                                            const fixedSelling = item.fixedSellingPrice || 0;
                                            const totalSales = item.totalSalesAmount || 0;
                                            const alertThreshold = item.lowStockAlert || 5;
                                            const imageSrc = item.imageUrl ? resolveImageSrc(item.imageUrl) : '';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="inventory-item-card"
                                                    onClick={() => handleViewItem(item)}
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
                                                            {/* Top Row: Item name, Category, Stock info (No Item ID) */}
                                                            <div className="inventory-item-title-row">
                                                                <h3 className="inventory-item-name">{item.name}</h3>
                                                                <span className="badge-role">
                                                                    {item.category?.name || 'Uncategorized'}
                                                                </span>

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

                                                            {/* Second Row: Total Sales */}
                                                            <div className="inventory-item-sales-row">
                                                                <span className="sales-label">Total Sales:</span>
                                                                <strong className="sales-value">{formatCurrency(totalSales)}</strong>
                                                            </div>

                                                            {/* Below that: Date (e.g. 18d ago) */}
                                                            <div className="inventory-item-date-row">
                                                                <i className="bi bi-clock me-1 text-muted"></i>
                                                                <span>{getRelativeTime(item.updatedAt || item.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Row: Total Purchase and Fixed Selling side-by-side + Action Buttons */}
                                                    <div className="inventory-item-right">
                                                        <div className="inventory-prices-group">
                                                            <div className="inventory-price-box">
                                                                <span className="inventory-price-label">Total Purchase</span>
                                                                <span className="inventory-price-value purchase">
                                                                    {formatCurrency(grossPurchase)}
                                                                </span>
                                                            </div>

                                                            <div className="inventory-price-box">
                                                                <span className="inventory-price-label">Fixed Selling</span>
                                                                <span className="inventory-price-value selling">
                                                                    {fixedSelling > 0 ? formatCurrency(fixedSelling) : 'Dynamic'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions: View & Edit */}
                                                        <div className="inventory-actions-group">
                                                            <button
                                                                type="button"
                                                                className="inventory-view-action"
                                                                onClick={(e) => handleViewItem(item, e)}
                                                                title="View product details"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                                <span>View</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="inventory-edit-action"
                                                                onClick={(e) => handleEditItem(item, e)}
                                                                title="Edit product"
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                                <span>Edit</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                            {/* View Product Modal */}
                            <ViewProductModal
                                isOpen={isViewModalOpen}
                                onClose={handleCloseViewModal}
                                item={viewingItem}
                                onEdit={(item) => handleEditItem(item)}
                            />
                        </>
                    )}
                    </div>

                    {/* Truly Sticky Floating Add Item Button - Fixed to Browser Viewport */}
                    {activeTab === 'products' && (
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
                </div>
            </div>
        </div>
    );
};

export default Products;