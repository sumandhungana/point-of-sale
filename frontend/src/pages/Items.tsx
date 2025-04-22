import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/Item');
        const data = await response.json();
        setItems(data.items);
        setTotalSalesPrice(data.totalSalesPrice);
        setTotalItems(data.totalItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const infoCards: InfoCard[] = [
    {
      title: 'Total Value Stock',
      value: `₹${totalSalesPrice.toLocaleString()}`,
      icon: '📦',
      color: '#4CAF50',
    },
    {
      title: 'Total Items',
      value: `${totalItems} Items`,
      icon: '⚠️',
      color: '#F44336',
    },
    {
      title: 'View Report',
      value: 'Click to View',
      icon: '📊',
      color: '#2196F3',
      action: () => navigate('/items/report'),
    },
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8f9fa',
    },
 
    mainContent: {
      padding: '2rem',
      marginTop: '64px',
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    },
    card: {
      background: 'white',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderRight: '1px solid #e9ecef',
      '&:last-child': {
        borderRight: 'none',
      },
      '&:hover': {
        backgroundColor: '#f8f9fa',
      },
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    cardIcon: {
      fontSize: '1.5rem',
    },
    cardTitle: {
      fontSize: '0.875rem',
      color: '#6c757d',
      margin: 0,
    },
    cardValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#212529',
      margin: 0,
    },
    searchCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
    },
    searchRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    searchContainer: {
      flex: 1,
      position: 'relative' as const,
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6c757d',
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '0.875rem',
      '&:focus': {
        outline: 'none',
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,0.25)',
      },
    },
    sortDropdown: {
      padding: '0.75rem 1rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      minWidth: '150px',
    },
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    filterDropdown: {
      padding: '0.75rem 1rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      minWidth: '150px',
    },
    lowStockButton: {
      padding: '0.75rem 1.5rem',
      border: '1px solid #dc3545',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      color: '#dc3545',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#dc3545',
        color: 'white',
      },
    },
    actionLinks: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '1.5rem',
    },
    actionLink: {
      color: '#007bff',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f8f9fa',
        textDecoration: 'underline',
      },
    },
    itemsContainer: {
      marginTop: '1.5rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    itemCard: {
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      borderBottom: '1px solid #e9ecef',
    },
    itemImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover' as const,
      borderRadius: '4px',
    },
    itemName: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#212529',
      margin: 0,
    },
    priceCard: {
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    priceLabel: {
      fontSize: '0.75rem',
      color: '#6c757d',
    },
    priceValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    stockInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0.25rem',
    },
    stockValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#28a745',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
    },
    actionButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    inButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: '#218838',
      },
    },
    outButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: '#c82333',
      },
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1.5rem',
    },
    addButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      '&:hover': {
        backgroundColor: '#218838',
      },
    },
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'inStock' && item.openingStock > 0) ||
      (filterBy === 'outOfStock' && item.openingStock <= 0);
    return matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.salesPrice - b.salesPrice;
      case 'stock':
        return a.openingStock - b.openingStock;
      default:
        return 0;
    }
  });

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <div style={styles.cardsContainer}>
          {infoCards.map((card) => (
            <div
              key={card.title}
              style={styles.card}
              onClick={card.action}
            >
              <div style={styles.cardHeader}>
                <span style={{ ...styles.cardIcon, color: card.color }}>{card.icon}</span>
                <h3 style={styles.cardTitle}>{card.title}</h3>
              </div>
              <p style={styles.cardValue}>{card.value}</p>
            </div>
          ))}
        </div>

        <div style={styles.searchCard}>
          <div style={styles.searchRow}>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search items..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              style={styles.sortDropdown}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
          </div>
          <div style={styles.filterRow}>
            <select
              style={styles.filterDropdown}
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
            <button style={styles.lowStockButton}>
              Low Stock Items
            </button>
          </div>
        </div>

        <div style={styles.actionLinks}>
          <a href="#" style={styles.actionLink}>My Items</a>
          <a href="#" style={styles.actionLink}>Count Items</a>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading items...</div>
        ) : (
          sortedItems.map((item) => (
            <div key={item.id} style={styles.itemsContainer}>
              <div style={styles.itemCard}>
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/60'}
                  alt={item.name}
                  style={styles.itemImage}
                />
                <h3 style={styles.itemName}>{item.name}</h3>
              </div>
              <div style={styles.priceCard}>
                <div style={styles.priceInfo}>
                  <span style={styles.priceLabel}>Sale Price</span>
                  <span style={styles.priceValue}>₹{item.salesPrice.toLocaleString()}</span>
                </div>
                <div style={styles.stockInfo}>
                  <span style={styles.priceLabel}>Stock</span>
                  <span style={styles.stockValue}>{item.openingStock}</span>
                </div>
                <div style={styles.actionButtons}>
                  <button style={{ ...styles.actionButton, ...styles.inButton }}>
                    +IN
                  </button>
                  <button style={{ ...styles.actionButton, ...styles.outButton }}>
                    -OUT
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <div style={styles.buttonContainer}>
          <button
            style={styles.addButton}
            onClick={() => navigate('/inventory/items/add')}
          >
            <span>+</span> Add Item
          </button>
        </div>
      </main>
    </div>
  );
}; 