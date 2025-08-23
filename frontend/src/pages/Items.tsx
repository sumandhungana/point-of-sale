import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { fetchItemsList } from '../services/itemsListService';
import Navbar from '../components/Navbar';
import '../styles/Items.css';

interface Item {
  id: number;
  name: string;
  salesPrice: number;
  openingStock: number;
  imageUrl: string;
  category: {
    name: string;
  };
}

interface InfoCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  action?: () => void;
}

export const Items = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [items, setItems] = useState<Item[]>([]);
  const [totalSalesPrice, setTotalSalesPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const data = await fetchItemsList();
        setItems(data.items);
        setTotalSalesPrice(data.totalSalesPrice);
        setTotalItems(data.totalItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    fetchItemsData();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
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
    navigate('/items/add', { state: { item } });
  };

  const handleAddItem = () => {
    navigate('/items/add');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="items-container">
        <Navbar />
        <div className="items-card">
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
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="items-select"
                >
                  <option value="name">Name</option>
                  <option value="price">Price (High to Low)</option>
                  <option value="stock">Stock (High to Low)</option>
                </select>
              </div>
              <div className="items-filter-group">
                <label className="items-label">Filter:</label>
                <select
                  value={filterBy}
                  onChange={handleFilterChange}
                  className="items-select"
                >
                  <option value="all">All Items</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>
              <div className="items-action-buttons">
                <button 
                  className="items-button items-primary-button"
                  onClick={handleAddItem}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Item
                </button>
                <button className="items-button items-secondary-button">
                  <i className="bi bi-download"></i>
                  Export
                </button>
              </div>
            </div>
            <div className="items-info-card">
              <div className="items-info-section" onClick={() => navigate('/items/report')}>
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
              <div className="items-info-section" onClick={() => navigate('/items/report')}>
                <div className="items-info-icon">
                  <i className="bi bi-graph-up" style={{ color: '#2196F3' }}></i>
                </div>
                <div className="items-info-title">View Report</div>
                <div className="items-info-value">Click to View</div>
              </div>
            </div>
          </div>
          
          <div className="items-list">
            {loading ? (
              <div className="items-loading-message">
                <i className="bi bi-arrow-clockwise me-2"></i>
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
              filteredItems.map(item => (
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
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="items-placeholder-image">
                      <i className="bi bi-image"></i>
                    </div>
                  </div>
                  <div className="items-details-container">
                    <div className="items-name">{item.name}</div>
                    <div className="items-details-row">
                      <span className="items-detail-pill">
                        <i className="bi bi-tag me-1"></i>
                        {item.category.name}
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
                      <span style={{ color: '#28a745' }}>
                        <i className="bi bi-check-circle me-1"></i>
                        In Stock
                      </span>
                    ) : (
                      <span style={{ color: '#dc3545' }}>
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
      </div>
    </div>
  );
}; 