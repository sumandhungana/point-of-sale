import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchServices } from '../services/serviceService';
import '../styles/Service.css';

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
          <div className="service-loading-message">
            <i className="bi bi-arrow-clockwise spin me-2"></i>
            Loading services...
          </div>
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
          <div className="service-error-message">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
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
        <div className="service-container">
          <div className="service-sales-card">
            <div className="service-sales-section">
              <div className="service-sales-title">
                <i className="bi bi-graph-up me-1"></i>
                Net Monthly Sales
              </div>
              <div className="service-sales-amount">${netMonthlySales.toFixed(2)}</div>
            </div>
            <div className="service-sales-section">
              <div className="service-sales-title">
                <i className="bi bi-graph-up-arrow me-1"></i>
                Gross Monthly Sales
              </div>
              <div className="service-sales-amount">${grossMonthlySales.toFixed(2)}</div>
            </div>
          </div>

          <div className="service-search-container">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="service-search-input"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="service-filter-select"
            >
              <option value="all">All Services</option>
              <option value="active">Active Services</option>
              <option value="inactive">Inactive Services</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="service-section-header">
            <div className="service-section-title">
              <i className="bi bi-tools me-2"></i>
              Services
            </div>
            <div className="service-total-services">
              <i className="bi bi-collection me-1"></i>
              Total Services: {totalItems}
            </div>
          </div>

          <div className="service-services-grid">
            {filteredServices.map(service => (
              <div 
                key={service.id} 
                className="service-card"
                onClick={() => handleServiceClick(service)}
              >
                <div className="service-image">
                  {service.imagePath ? (
                    <img src={service.imagePath} alt={service.serviceName} />
                  ) : (
                    <div className="service-image-placeholder">
                      <i className="bi bi-image"></i>
                    </div>
                  )}
                  <div className="service-price">${service.price.toFixed(2)}</div>
                </div>
                <div className="service-details">
                  <div className="service-name">{service.serviceName}</div>
                  <div className="service-info">
                    <i className="bi bi-info-circle me-1"></i>
                    {service.taxIncluded ? 'Tax Included' : 'Tax Excluded'} | 
                    Tax: {service.tax?.toFixed(2) || '0'}% | 
                    VAT: {service.vat?.toFixed(2) || '0'}%
                  </div>
                  {service.taxIncluded && (
                    <div className="service-info">
                      <i className="bi bi-calculator me-1"></i>
                      Total with Tax: ${service.taxIncludedAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="service-add-button-container">
            <button 
              className="service-add-button"
              onClick={() => navigate('/add-service')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 