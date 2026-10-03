import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { fetchItemsList } from '../../services/productListService';
import Navbar from '@/components/Navbar';
import '../../../styles/Products.css';

interface ItemCategory {
    id?: number;
    name: string;
}

interface Item {
    id: number;
    sku?: string;
    name: string;
    salesPrice: number;
    openingStock: number;
    imageUrl?: string;
    category: ItemCategory;
}

interface ItemsResponse {
    items: Item[];
    totalSalesPrice: number;
    totalItems: number;
}

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

    useEffect(() => {
        const fetchItemsData = async () => {
            try {
                setLoading(true);
                const data: ItemsResponse = await fetchItemsList();
                setItems(data.items || []);
                setTotalSalesPrice(data.totalSalesPrice || 0);
                setTotalItems(data.totalItems || 0);
                setError(null);
            } catch (err) {
                console.error('Error fetching inventory items:', err);
                setError('Failed to load items. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchItemsData();
    }, []);

    // Filter & Sort Logic
    const filteredItems = items
        .filter((item) => {
            const categoryName = item.category?.name || '';
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                categoryName.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (filterBy === 'inStock') return item.openingStock > 0;
            if (filterBy === 'outOfStock') return item.openingStock <= 0;
            if (filterBy === 'lowStock') return item.openingStock > 0 && item.openingStock <= 5;

            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return b.salesPrice - a.salesPrice;
                case 'stock':
                    return b.openingStock - a.openingStock;
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
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div className="items-container" style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                <Navbar />

                <div className="items-card" style={{ marginTop: '1rem' }}>
                    {/* Top Search & Filter Controls */}
                    <div className="items-search-container">
                        <div className="items-search-bar">
                            <div style={{ position: 'relative', flex: 2 }}>
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
                                    <option value="name">Name</option>
                                    <option value="price">Price (High to Low)</option>
                                    <option value="stock">Stock (High to Low)</option>
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
                                className="items-button items-warning-button"
                                onClick={() => setFilterBy('lowStock')}
                            >
                                Low Stock Items
                            </button>
                        </div>

                        {/* Stat Cards Header Section */}
                        <div className="items-info-card">
                            <div
                                className="items-info-section"
                                onClick={() => navigate('/items/report')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="items-info-icon">
                                    <i className="bi bi-box" style={{ color: '#4CAF50' }}></i>
                                </div>
                                <div className="items-info-title">Total Value Stock</div>
                                <div className="items-info-value">₹{totalSalesPrice.toLocaleString()}</div>
                            </div>

                            <div className="items-info-section">
                                <div className="items-info-icon">
                                    <i className="bi bi-exclamation-triangle" style={{ color: '#F44336' }}></i>
                                </div>
                                <div className="items-info-title">Total Items</div>
                                <div className="items-info-value">{totalItems} Items</div>
                            </div>

                            <div
                                className="items-info-section"
                                onClick={() => navigate('/items/report')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="items-info-icon">
                                    <i className="bi bi-graph-up" style={{ color: '#2196F3' }}></i>
                                </div>
                                <div className="items-info-title">View Report</div>
                                <div className="items-info-value">Click to View</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Links Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0 0.5rem 0' }}>
                        <button
                            type="button"
                            style={{ background: 'transparent', border: 'none', color: '#0d6efd', cursor: 'pointer', fontWeight: 500 }}
                            onClick={() => navigate('/items/my')}
                        >
                            My Items
                        </button>
                        <button
                            type="button"
                            style={{ background: 'transparent', border: 'none', color: '#0d6efd', cursor: 'pointer', fontWeight: 500 }}
                            onClick={() => navigate('/items/count')}
                        >
                            Count Items
                        </button>
                    </div>

                    {/* Items List Content */}
                    <div className="items-list">
                        {loading ? (
                            <div className="items-loading-message">
                                <i className="bi bi-arrow-clockwise me-2 spin"></i>
                                Loading items...
                            </div>
                        ) : error ? (
                            <div className="items-error-message">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="items-loading-message">
                                <i className="bi bi-inbox me-2"></i>
                                No items found
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="items-item"
                                    onClick={() => handleItemClick(item)}
                                >
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
                                            <i className="bi bi-image"></i>
                                        </div>
                                    </div>

                                    <div className="items-details-container">
                                        <div className="items-name">{item.name}</div>
                                        <div className="items-details-row">
                      <span className="items-detail-pill">
                        <i className="bi bi-tag me-1"></i>
                          {item.category?.name || 'Uncategorized'}
                      </span>
                                            <span className="items-detail-pill">
                        <i className="bi bi-box me-1"></i>
                        Stock: {item.openingStock}
                      </span>
                                        </div>
                                    </div>

                                    <div className="items-price">
                                        ₹{item.salesPrice.toLocaleString()}
                                    </div>

                                    <div className="items-stock">
                                        {item.openingStock > 0 ? (
                                            <span style={{ color: '#28a745', fontWeight: 500 }}>
                        <i className="bi bi-check-circle me-1"></i>
                        In Stock
                      </span>
                                        ) : (
                                            <span style={{ color: '#dc3545', fontWeight: 500 }}>
                        <i className="bi bi-x-circle me-1"></i>
                        Out of Stock
                      </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Add Item Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="items-add-button btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <i className="bi bi-plus-circle"></i>
                        Add Item
                    </button>
                </div>
            </div>
        </div>
    );
};