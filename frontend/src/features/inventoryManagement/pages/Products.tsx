import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import '../../../styles/Products.css';
import { getProduct, Item } from "@/features/services/productService";

export const Products: React.FC = () => {
    const navigate = useNavigate();

    // State Management
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
            const data = await getProduct();
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

    // Calculate aggregated inventory purchase valuation using backend grossPurchasePrice
    const totalPurchaseValuation = items.reduce(
        (sum, item) => sum + (item.grossPurchasePrice || 0),
        0
    );

    // Filter & Sort Logic
    const filteredItems = items
        .filter((item) => {
            const categoryName = item.category?.name || '';
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                categoryName.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            const currentQty = item.itemCount ?? item.openingStock ?? 0;

            if (filterBy === 'inStock') return currentQty > 0;
            if (filterBy === 'outOfStock') return currentQty <= 0;
            if (filterBy === 'lowStock') return currentQty > 0 && currentQty <= 5;

            return true;
        })
        .sort((a, b) => {
            const qtyA = a.itemCount ?? a.openingStock ?? 0;
            const qtyB = b.itemCount ?? b.openingStock ?? 0;

            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return (b.salesPrice || 0) - (a.salesPrice || 0);
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

    const handleItemClick = (item: Item) => {
        navigate('/inventory/items/add', { state: { isEdit: true, initialValues: item } });
    };

    const handleAddItem = () => {
        navigate('/inventory/items/add');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Sidebar />
            <div className="items-container">
                <Navbar />

                <div className="items-card">
                    {/* Header Banner */}
                    <div className="items-page-header">
                        <div>
                            <h2>Inventory Management</h2>
                            <p>Track, filter, and review stock values across product categories.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="items-add-button"
                        >
                            <i className="bi bi-plus-lg"></i>
                            Add Item
                        </button>
                    </div>

                    {/* Stat Cards Summary */}
                    <div className="items-info-card">
                        <div className="items-info-section valuation">
                            <div className="items-info-icon">
                                <i className="bi bi-wallet2"></i>
                            </div>
                            <div>
                                <div className="items-info-title">Total Purchase Valuation</div>
                                <div className="items-info-value">Rs. {totalPurchaseValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        <div className="items-info-section sales">
                            <div className="items-info-icon">
                                <i className="bi bi-graph-up-arrow"></i>
                            </div>
                            <div>
                                <div className="items-info-title">Total Sales Valuation</div>
                                <div className="items-info-value">Rs. {totalSalesPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        <div className="items-info-section count">
                            <div className="items-info-icon">
                                <i className="bi bi-box-seam"></i>
                            </div>
                            <div>
                                <div className="items-info-title">Total Unique Items</div>
                                <div className="items-info-value">{totalItems} Items</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Search & Filter Controls */}
                    <div className="items-search-container">
                        <div className="items-search-bar">
                            <div className="items-search-wrapper">
                                <i className="bi bi-search items-search-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Search by item name or category..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="items-search-input"
                                />
                            </div>

                            <div className="items-filter-group">
                                <label className="items-label">Sort:</label>
                                <select value={sortBy} onChange={handleSortChange} className="items-select">
                                    <option value="name">Name (A-Z)</option>
                                    <option value="price">Sales Price (High to Low)</option>
                                    <option value="purchasePrice">Purchase Price (High to Low)</option>
                                    <option value="stock">Stock Quantity (High to Low)</option>
                                </select>
                            </div>

                            <div className="items-filter-group">
                                <label className="items-label">Filter:</label>
                                <select value={filterBy} onChange={handleFilterChange} className="items-select">
                                    <option value="all">All Items</option>
                                    <option value="inStock">In Stock</option>
                                    <option value="outOfStock">Out of Stock</option>
                                    <option value="lowStock">Low Stock</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="items-warning-button"
                                onClick={() => setFilterBy(filterBy === 'lowStock' ? 'all' : 'lowStock')}
                            >
                                <i className="bi bi-exclamation-circle me-1"></i>
                                {filterBy === 'lowStock' ? 'Show All' : 'Low Stock Only'}
                            </button>
                        </div>
                    </div>

                    {/* Secondary Navigation / Quick Links */}
                    <div className="items-action-links">
                        <div className="items-link-group">
                            <button type="button" className="items-link-btn" onClick={() => navigate('/items/my')}>
                                <i className="bi bi-person-workspace me-1"></i> My Items
                            </button>
                            <span className="items-link-divider">•</span>
                            <button type="button" className="items-link-btn" onClick={() => navigate('/items/count')}>
                                <i className="bi bi-clipboard-check me-1"></i> Stock Audit
                            </button>
                        </div>
                    </div>

                    {/* Items Table Container */}
                    <div className="items-table-wrapper">
                        <div className="items-table-header">
                            <div>Item & Category</div>
                            <div>Stock Quantity</div>
                            <div>Unit Purchase Price</div>
                            <div>Gross Purchase Price</div>
                            <div>Sales Price</div>
                        </div>

                        <div className="items-list">
                            {loading ? (
                                <div className="items-loading-message">
                                    <i className="bi bi-arrow-repeat spin me-2"></i>
                                    Fetching inventory items...
                                </div>
                            ) : error ? (
                                <div className="items-error-message">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="items-empty-message">
                                    <i className="bi bi-inbox me-2"></i>
                                    No items match the selected filter criteria.
                                </div>
                            ) : (
                                filteredItems.map((item) => {
                                    const qty = item.itemCount ?? item.openingStock ?? 0;
                                    const unitPurchase = item.perUnitPurchasePrice || 0;
                                    const grossPurchase = item.grossPurchasePrice || (qty * unitPurchase);

                                    return (
                                        <div
                                            key={item.id}
                                            className="items-item"
                                            onClick={() => handleItemClick(item)}
                                        >
                                            {/* Name & Category */}
                                            <div className="items-cell-primary">
                                                <div className="items-image-container">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="items-image"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                if (placeholder) placeholder.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="items-placeholder-image"
                                                        style={{ display: item.imageUrl ? 'none' : 'flex' }}
                                                    >
                                                        <i className="bi bi-box"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="items-name">{item.name}</div>
                                                    <span className="items-detail-pill">
                                                        <i className="bi bi-tag-fill me-1"></i>
                                                        {item.category?.name || 'Uncategorized'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <div className="items-qty-text">
                                                    {qty.toLocaleString()} <span className="items-unit">{item.unit || 'pcs'}</span>
                                                </div>
                                                {qty <= 0 ? (
                                                    <span className="stock-badge badge-out">Out of stock</span>
                                                ) : qty <= 5 ? (
                                                    <span className="stock-badge badge-low">Low stock</span>
                                                ) : (
                                                    <span className="stock-badge badge-in">In stock</span>
                                                )}
                                            </div>

                                            {/* Unit Purchase Price */}
                                            <div className="items-price-text">
                                                Rs. {unitPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>

                                            {/* Gross Purchase Price */}
                                            <div className="items-gross-price-text">
                                                Rs. {grossPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>

                                            {/* Sales Price */}
                                            <div className="items-sales-price-text">
                                                Rs. {(item.salesPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};