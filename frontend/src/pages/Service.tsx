import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchServices } from '../services/serviceService';

interface Service {
  id: number;
  serviceName: string;
  price: number;
  taxIncluded: boolean;
  taxIncludedAmount: number;
  tax: number | null;
  vat: number | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export const Service = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [netMonthlySales, setNetMonthlySales] = useState(0);
  const [grossMonthlySales, setGrossMonthlySales] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicesList = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
        // Calculate sales metrics
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const monthlyServices = data.filter((service: any) => {
          const serviceDate = new Date(service.createdAt);
          return serviceDate.getMonth() === currentMonth && 
                 serviceDate.getFullYear() === currentYear;
        });
        // Calculate net sales (price without tax)
        const netSales = monthlyServices.reduce((sum: number, service: any) => {
          return sum + (service.taxIncluded ? service.price - (service.taxIncludedAmount - service.price) : service.price);
        }, 0);
        // Calculate gross sales (price with tax)
        const grossSales = monthlyServices.reduce((sum: number, service: any) => {
          return sum + (service.taxIncluded ? service.taxIncludedAmount : service.price);
        }, 0);
        setNetMonthlySales(netSales);
        setGrossMonthlySales(grossSales);
        setTotalItems(data.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchServicesList();
  }, []);

  const filteredServices = services.filter(service => 
    service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
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
      flexDirection: 'column' as const,
      gap: '0.5rem',
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
    serviceInfo: {
      fontSize: '0.9rem',
      color: '#6c757d',
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
    loadingMessage: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: '#6c757d',
    },
    errorMessage: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: '#dc3545',
    },
  };

  const handleServiceClick = (service: Service) => {
    navigate('/add-service', { 
      state: { 
        isEdit: true,
        initialValues: {
          id: service.id,
          serviceName: service.serviceName,
          price: service.price,
          taxIncluded: service.taxIncluded,
          taxIncludedAmount: service.taxIncludedAmount,
          tax: service.tax,
          vat: service.vat,
          imagePath: service.imagePath
        }
      }
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ 
          flex: 1, 
          marginLeft: '50px',
          
          minHeight: '100vh',
          background: '#f8f9fa',
        }}>
          <Navbar />
          <div style={styles.loadingMessage}>Loading services...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ 
          flex: 1, 
          marginLeft: '50px',
          
          minHeight: '100vh',
          background: '#f8f9fa',
        }}>
          <Navbar />
          <div style={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '40px', 
        marginLeft: '50px',
        
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.salesCard}>
            <div style={styles.salesSection}>
              <div style={styles.salesTitle}>Net Monthly Sales</div>
              <div style={styles.salesAmount}>${netMonthlySales.toFixed(2)}</div>
            </div>
            <div style={styles.salesSection}>
              <div style={styles.salesTitle}>Gross Monthly Sales</div>
              <div style={styles.salesAmount}>${grossMonthlySales.toFixed(2)}</div>
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
            <div style={styles.totalServices}>Total Services: {totalItems}</div>
          </div>

          <div style={styles.servicesGrid}>
            {filteredServices.map(service => (
              <div 
                key={service.id} 
                style={styles.serviceCard}
                onClick={() => handleServiceClick(service)}
              >
                <div style={styles.serviceImage}>
                    {service.imagePath && <img src={service.imagePath} alt={service.serviceName} style={styles.serviceImage} />}
                  <div style={styles.servicePrice}>${service.price.toFixed(2)}</div>
                </div>
                <div style={styles.serviceDetails}>
                  <div style={styles.serviceName}>{service.serviceName}</div>
                  <div style={styles.serviceInfo}>
                    {service.taxIncluded ? 'Tax Included' : 'Tax Excluded'} | 
                    Tax: {service.tax?.toFixed(2) || '0'}% | 
                    VAT: {service.vat?.toFixed(2) || '0'}%
                  </div>
                  {service.taxIncluded && (
                    <div style={styles.serviceInfo}>
                      Total with Tax: ${service.taxIncludedAmount.toFixed(2)}
                    </div>
                  )}
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