import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import '../../../styles/Products.css';
import { getProduct, Item } from "@/features/services/productService";
import { Categories } from './Categories';

export const Products: React.FC = () => {
    const navigate = useNavigate();

    // Module Active Tab State ('products' | 'categories')
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

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

    // Calculate aggregated total gross purchase valuation across items
    const totalPurchaseValuation = items.reduce(
        (sum, item) => sum + (item.grossPurchasePrice || 0),
        0
    );

    // Filter & Sort Logic (Explicitly typing `a` and `b` as `Item` prevents TS7022)
    const filteredItems = items
        .filter((item: Item) => {
            const categoryName = item.category?.name || '';
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                categoryName.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            const currentQty = item.itemCount ?? 0;

            if (filterBy === 'inStock') return currentQty > 0;
            if (filterBy === 'outOfStock') return currentQty <= 0;
            if (filterBy === 'lowStock') return currentQty > 0 && currentQty <= 5;

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

    const handleItemClick = (item: Item) => {
        navigate('/inventory/items/add', { state: { isEdit: true, initialValues: item } });
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
                            {/* Stat Cards Summary */}
                            <div className="stat-card-grid">
                                <div className="stat-card">
                                    <div className="stat-icon-box navy">
                                        <i className="bi bi-wallet2"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label">Total Purchase Valuation</div>
                                        <div className="stat-value">Rs. {totalPurchaseValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon-box blue">
                                        <i className="bi bi-graph-up-arrow"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label">Total Realized Sales</div>
                                        <div className="stat-value">Rs. {totalSalesPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon-box navy">
                                        <i className="bi bi-box-seam"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label">Total Unique Items</div>
                                        <div className="stat-value">{totalItems} Items</div>
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
                                            placeholder="Search by item name or category..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="form-control search-input"
                                        />
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
                                            <option value="lowStock">Low Stock</option>
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setFilterBy(filterBy === 'lowStock' ? 'all' : 'lowStock')}
                                    >
                                        <i className="bi bi-exclamation-circle me-1"></i>
                                        {filterBy === 'lowStock' ? 'Show All' : 'Low Stock Only'}
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
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
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4">
                                                <i className="bi bi-arrow-repeat spin me-2"></i>
                                                Fetching inventory items...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-danger">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                {error}
                                            </td>
                                        </tr>
                                    ) : filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-muted">
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

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="clickable-row"
                                                    onClick={() => handleItemClick(item)}
                                                >
                                                    <td>
                                                        <div className="item-cell-content">
                                                            <div className="item-thumb-box">
                                                                {item.imageUrl ? (
                                                                    <img
                                                                        src={item.imageUrl}
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
                                                    <td>Rs. {unitPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td>Rs. {grossPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td>Rs. {fixedSelling.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="fw-semibold" style={{ color: '#255DCE' }}>
                                                        Rs. {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                </table>
                            </div>

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