import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const Service = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const services = [
    { id: 1, name: 'Haircut', price: '$25.00' },
    { id: 2, name: 'Manicure', price: '$35.00' },
    { id: 3, name: 'Massage', price: '$60.00' },
    { id: 4, name: 'Facial', price: '$45.00' },
  ];

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    salesCard: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      display: 'flex',
      gap: '2rem',
    },
    salesSection: {
      flex: 1,
      padding: '1.5rem',
      background: '#f8f9fa',
      borderRadius: '8px',
    },
    salesTitle: {
      fontSize: '1rem',
      color: '#6c757d',
      marginBottom: '0.5rem',
    },
    salesAmount: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    searchContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
    },
    searchInput: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    filterSelect: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
      minWidth: '200px',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderTop: '1px solid #dee2e6',
      borderBottom: '1px solid #dee2e6',
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    totalServices: {
      fontSize: '1rem',
      color: '#6c757d',
    },
    servicesGrid: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    serviceCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      width: '100%',
    },
    serviceImage: {
      width: '120px',
      height: '120px',
      background: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    imagePlaceholder: {
      fontSize: '2rem',
      color: '#6c757d',
    },
    priceLabel: {
      fontSize: '0.8rem',
      color: '#6c757d',
    },
    serviceDetails: {
      flex: 1,
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
    },
    serviceName: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    servicePrice: {
      fontSize: '1rem',
      color: '#28a745',
      fontWeight: 'bold',
    },
    addButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: '50px',
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.salesCard}>
            <div style={styles.salesSection}>
              <div style={styles.salesTitle}>Net Monthly Sales</div>
              <div style={styles.salesAmount}>$45,678.90</div>
            </div>
            <div style={styles.salesSection}>
              <div style={styles.salesTitle}>Gross Monthly Sales</div>
              <div style={styles.salesAmount}>$56,789.00</div>
            </div>
          </div>

          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Services</option>
              <option value="active">Active Services</option>
              <option value="inactive">Inactive Services</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>Services</div>
            <div style={styles.totalServices}>Total Services: {services.length}</div>
          </div>

          <div style={styles.servicesGrid}>
            {services.map(service => (
              <div key={service.id} style={styles.serviceCard}>
                <div style={styles.serviceImage}>
                  <div style={styles.imagePlaceholder}>📷</div>
                  <div style={styles.priceLabel}>Service Price</div>
                  <div style={styles.servicePrice}>{service.price}</div>
                </div>
                <div style={styles.serviceDetails}>
                  <div style={styles.serviceName}>{service.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.addButtonContainer}>
            <button 
              style={styles.addButton}
              onClick={() => navigate('/add-service')}
            >
              <span>+</span> Add Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 