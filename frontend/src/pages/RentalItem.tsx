import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchRentalItems } from '../services/rentalItemService';
import '../styles/RentalItem.css';

interface RentalItem {
  id: number;
  rentalItemName: string;
  phoneNumber: string;
  address: string;
  rentalAmount: number;
  rentalPeriod: string;
  startDate: string;
  endDate: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface RentalResponse {
  rentalItem: RentalItem[];
  youGive: number;
  advanceAmount: number;
}

export const RentalItem = () => {
  const navigate = useNavigate();
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  const [youGive, setYouGive] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    const fetchRentalItemsList = async () => {
      try {
        const data = await fetchRentalItems();
        setRentalItems(data.rentalItem);
        setYouGive(data.youGive);
        setAdvanceAmount(data.advanceAmount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchRentalItemsList();
  }, []);

  const filteredItems = rentalItems.filter(item => 
    item.rentalItemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sort) {
      case 'name_asc':
        return a.rentalItemName.localeCompare(b.rentalItemName);
      case 'name_desc':
        return b.rentalItemName.localeCompare(a.rentalItemName);
      case 'date_asc':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'date_desc':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      default:
        return 0;
    }
  });

  const calculateRentalAmount = (item: RentalItem) => {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    const currentDate = new Date();
    
    // If current date is before start date, return 0
    if (currentDate < startDate) {
      return 0;
    }
    
    // If current date is after end date, return total amount
    if (currentDate > endDate) {
      return item.rentalAmount;
    }
    
    // Calculate total days in rental period
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate days passed
    const daysPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate amount based on days passed
    const dailyRate = item.rentalAmount / totalDays;
    return Math.round(dailyRate * daysPassed);
  };

  const getRentalStatus = (item: RentalItem) => {
    const currentDate = new Date();
    const endDate = new Date(item.endDate);
    
    if (currentDate > endDate) {
      return 'Completed';
    }
    
    const startDate = new Date(item.startDate);
    if (currentDate < startDate) {
      return 'Not Started';
    }
    
    return 'In Progress';
  };

  if (loading) {
    return (
      <div className="rental-item-container">
        <Sidebar />
        <div className="rental-item-main">
          <div className="rental-item-loading-message">
            <i className="bi bi-arrow-clockwise spin"></i>
            Loading rental items...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rental-item-container">
        <Sidebar />
        <div className="rental-item-main">
          <div className="rental-item-error-message">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="rental-item-container">
        <Sidebar />
        <div className="rental-item-main">
          <div className="rental-item-search-container">
            <div className="rental-item-search-bar">
              <i className="bi bi-search rental-item-search-icon"></i>
              <input
                type="text"
                placeholder="Search rental items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rental-item-search-input"
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="rental-item-dropdown"
            >
              <option value="">Filter By</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="date">Date</option>
            </select>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="rental-item-dropdown"
            >
              <option value="">Sort By</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="date_desc">Date (Newest)</option>
            </select>
            <button className="rental-item-reminder-button">
              <i className="bi bi-alarm"></i>
              Reminder
            </button>
          </div>

          <div className="rental-item-summary-card">
            <div className="rental-item-summary-grid">
              <div className="rental-item-summary-item">
                <span className="rental-item-summary-label">
                  <i className="bi bi-arrow-up-circle me-1"></i>
                  You Give
                </span>
                <span className="rental-item-summary-amount">रु{youGive.toFixed(2)}</span>
              </div>
              <div className="rental-item-summary-item">
                <span className="rental-item-summary-label">
                  <i className="bi bi-cash-coin me-1"></i>
                  Advance Amount
                </span>
                <span className="rental-item-summary-amount">रु{advanceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {sortedItems.map(item => {
            const calculatedAmount = calculateRentalAmount(item);
            const status = getRentalStatus(item);
            const statusClass = status === 'Completed' ? 'rental-item-status-completed' : 
                              status === 'Not Started' ? 'rental-item-status-not-started' : 
                              'rental-item-status-in-progress';

            return (
              <div key={item.id} className="rental-item-card">
                <div className="rental-item-info">
                  <div className="rental-item-image-placeholder">
                    <i className="bi bi-image"></i>
                  </div>
                  <div className="rental-item-details">
                    <div className="rental-item-name">{item.rentalItemName}</div>
                    <div className="rental-item-time">
                      <i className="bi bi-calendar-event me-1"></i>
                      Period: {item.rentalPeriod} | 
                      Start: {new Date(item.startDate).toLocaleDateString()} | 
                      End: {new Date(item.endDate).toLocaleDateString()}
                    </div>
                    <div className="rental-item-time">
                      <i className="bi bi-telephone me-1"></i>
                      Phone: {item.phoneNumber} | 
                      <i className="bi bi-geo-alt me-1"></i>
                      Address: {item.address}
                    </div>
                    {item.remarks && (
                      <div className="rental-item-time">
                        <i className="bi bi-chat-text me-1"></i>
                        Remarks: {item.remarks}
                      </div>
                    )}
                    <div className={`rental-item-status ${statusClass}`}>
                      <i className="bi bi-circle-fill me-1"></i>
                      Status: {status}
                    </div>
                  </div>
                </div>
                <div className="rental-item-amount">
                  <div>रु{calculatedAmount.toFixed(2)}</div>
                  <div className="rental-item-amount-total">
                    of रु{item.rentalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rental-item-add-button-container">
            <button 
              className="rental-item-add-button"
              onClick={() => navigate('/rental/add')}
            >
              <i className="bi bi-plus-circle"></i>
              Add Rental Items
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 