import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import '../../../styles/Products.css';
import { getProduct, Item } from "@/features/services/productService";
import { Categories } from './Categories';
import { useAppSettings } from '@/context/AppSettingsContext';
import { resolveImageSrc } from '@/utils/ImageResolver';
import ViewProductModal from '../components/ViewProductModal';

export const Products: React.FC = () => {
    const navigate = useNavigate();
    const { formatCurrency, formatNumber } = useAppSettings();

    // Module Active Tab State ('products' | 'categories')
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

    // View mode: 'list' (matching Organization/Customers) vs 'table'
    const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

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
    };

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
                    {/* Module Tabs */}
                    <div className="tab-container">
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            <i className="bi bi-box-seam me-2"></i>
                            Products List
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            <i className="bi bi-tags me-2"></i>
                            Categories
                        </button>
                    </div>

                    {activeTab === 'categories' ? (
                        <Categories />
                    ) : (
                        <>
                            {/* Stat Cards Summary (Matching Organization & Customers) */}
                            <div className="stat-card-grid">
                                <div className="stat-card">
                                    <div className="stat-icon-box navy">
                                        <i className="bi bi-wallet2"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label">Total Purchase Valuation</div>
                                        <div className="stat-value">{formatCurrency(totalPurchaseValuation)}</div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon-box blue">
                                        <i className="bi bi-graph-up-arrow"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label">Total Realized Sales</div>
                                        <div className="stat-value">{formatCurrency(totalSalesPrice)}</div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon-box navy">
                                        <i className="bi bi-box-seam"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label">Total Unique Items</div>
                                        <div className="stat-value">{formatNumber(totalItems, 0)} Items</div>
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
                                        className={`btn-secondary ${filterBy === 'lowStock' ? 'active' : ''}`}
                                        onClick={() => setFilterBy(filterBy === 'lowStock' ? 'all' : 'lowStock')}
                                    >
                                        <i className="bi bi-exclamation-circle me-1"></i>
                                        {filterBy === 'lowStock' ? 'Show All' : `Low Stock (${lowStockCount})`}
                                    </button>

                                    {/* View Mode Toggle: List View (default) vs Table View */}
                                    <div className="view-mode-toggle">
                                        <button
                                            type="button"
                                            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                                            onClick={() => setViewMode('list')}
                                            title="Card List View (Matching Customers & Organization)"
                                        >
                                            <i className="bi bi-list-ul"></i>
                                            List
                                        </button>
                                        <button
                                            type="button"
                                            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                                            onClick={() => setViewMode('table')}
                                            title="Table View"
                                        >
                                            <i className="bi bi-table"></i>
                                            Table
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* View Representation: Card List View (Primary) vs Table View */}
                            {viewMode === 'list' ? (
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
                                            const unitPurchase = item.perUnitPurchasePrice || 0;
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
                                                            <div className="inventory-item-title-row">
                                                                <h3 className="inventory-item-name">{item.name}</h3>
                                                                <span className="item-id-badge">#ITEM-{item.id}</span>
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

                                                            <div className="inventory-item-meta">
                                                                <span>
                                                                    <i className="bi bi-boxes me-1" style={{ color: '#255DCE' }}></i>
                                                                    Stock: <strong>{formatNumber(qty, 0)} {unit}</strong>
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    <i className="bi bi-receipt me-1" style={{ color: '#64748b' }}></i>
                                                                    Unit Purchase: <strong>{formatCurrency(unitPurchase)}</strong>
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    <i className="bi bi-wallet2 me-1" style={{ color: '#64748b' }}></i>
                                                                    Gross Purchase: <strong>{formatCurrency(grossPurchase)}</strong>
                                                                </span>
                                                                {totalSales > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>
                                                                            <i className="bi bi-graph-up me-1" style={{ color: '#059669' }}></i>
                                                                            Realized Sales: <strong>{formatCurrency(totalSales)}</strong>
                                                                        </span>
                                                                    </>
                                                                )}
                                                                {item.updatedAt && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>
                                                                            <i className="bi bi-clock me-1 text-muted"></i>
                                                                            {getRelativeTime(item.updatedAt)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="inventory-item-right">
                                                        <div className="inventory-price-box">
                                                            <span className="inventory-price-label">Fixed Selling</span>
                                                            <span className="inventory-price-value">
                                                                {fixedSelling > 0 ? formatCurrency(fixedSelling) : 'Dynamic'}
                                                            </span>
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
                            ) : (
                                /* Table View as alternate option */
                                <div className="user-table-card">
                                    <table className="user-table">
                                        <thead>
                                        <tr>
                                            <th>Item & Category</th>
                                            <th>Stock Quantity</th>
                                            <th>Unit Purchase</th>
                                            <th>Gross Purchase</th>
                                            <th>Fixed Selling</th>
                                            <th>Sales Revenue</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4">
                                                    <i className="bi bi-arrow-repeat spin me-2"></i>
                                                    Fetching inventory items...
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4 text-danger">
                                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                                    {error}
                                                </td>
                                            </tr>
                                        ) : filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4 text-muted">
                                                    <i className="bi bi-inbox me-2"></i>
                                                    No items match the selected filter criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item: Item) => {
                                                const qty = item.itemCount ?? 0;
                                                const unitPurchase = item.perUnitPurchasePrice || 0;
                                                const grossPurchase = item.grossPurchasePrice || 0;
                                                const fixedSelling = item.fixedSellingPrice || 0;
                                                const totalSales = item.totalSalesAmount || 0;
                                                const imageSrc = item.imageUrl ? resolveImageSrc(item.imageUrl) : '';

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="clickable-row"
                                                        onClick={() => handleViewItem(item)}
                                                    >
                                                        <td>
                                                            <div className="item-cell-content">
                                                                <div className="item-thumb-box">
                                                                    {imageSrc ? (
                                                                        <img
                                                                            src={imageSrc}
                                                                            alt={item.name}
                                                                            className="item-thumb"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = 'none';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <i className="bi bi-box"></i>
                                                                    )}
                                                                </div>
                                                                <div className="item-info-wrapper">
                                                                    <div className="text-navy">{item.name}</div>
                                                                    <div>
                                                                        <span className="badge-role">
                                                                            {item.category?.name || 'Uncategorized'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="stock-cell-wrapper">
                                                                <div className="fw-semibold">
                                                                    {qty.toLocaleString()} <span className="text-muted">{item.unit || 'pcs'}</span>
                                                                </div>
                                                                <div>
                                                                    {qty <= 0 ? (
                                                                        <span className="badge-status inactive">Out of stock</span>
                                                                    ) : qty <= 5 ? (
                                                                        <span className="badge-status inactive" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#856404', borderColor: 'rgba(255, 193, 7, 0.25)' }}>Low stock</span>
                                                                    ) : (
                                                                        <span className="badge-status active">In stock</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{formatCurrency(unitPurchase)}</td>
                                                        <td>{formatCurrency(grossPurchase)}</td>
                                                        <td>{formatCurrency(fixedSelling)}</td>
                                                        <td className="fw-semibold" style={{ color: '#255DCE' }}>
                                                            {formatCurrency(totalSales)}
                                                        </td>
                                                        <td onClick={(e) => e.stopPropagation()}>
                                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                                <button
                                                                    type="button"
                                                                    className="table-action-btn view"
                                                                    title="View Details"
                                                                    onClick={(e) => handleViewItem(item, e)}
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="table-action-btn edit"
                                                                    title="Edit Product"
                                                                    onClick={(e) => handleEditItem(item, e)}
                                                                >
                                                                    <i className="bi bi-pencil-square"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* View Product Modal */}
                            <ViewProductModal
                                isOpen={isViewModalOpen}
                                onClose={handleCloseViewModal}
                                item={viewingItem}
                                onEdit={(item) => handleEditItem(item)}
                            />

                            {/* Sticky Bottom-Right Add Item Floating Button */}
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="sticky-add-btn"
                                title="Add New Product"
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Item
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;