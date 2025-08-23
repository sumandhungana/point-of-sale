import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchIncomes as fetchIncomesService } from '../services/incomeService';
import '../styles/Income.css';

interface Income {
  id: number;
  incomeNo: string;
  date: string;
  amount: number;
  paymentMode: string;
  remarks: string | null;
  photoPath: string | null;
  category: {
    name: string;
  };
  item: {
    name: string;
    imageUrl: string | null;
  };
}

export const Income = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('');

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const data = await fetchIncomesService();
      setIncomes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleDateSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateSort(e.target.value);
  };

  const handleIncomeClick = (income: Income) => {
    navigate('/bills/income/add', { state: { income } });
  };

  const filteredIncomes = incomes
    .filter(income => {
      const matchesSearch = 
        income.incomeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || income.paymentMode === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (dateSort === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (dateSort === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const pendingAmount = 0; // This would be calculated based on business logic

  return (
    <div className="income-page-wrapper">
      <Sidebar />
      <div className="income-container">
        <Navbar />
        <div className="income-card">
          <div className="income-search-container">
            <div className="income-search-bar">
              <div className="income-search-input-container">
                <i className="bi bi-search income-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search by income number, category, or item..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="income-search-input"
                />
              </div>
              <div className="income-filter-group">
                <label className="income-label">Filter:</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="income-select"
                >
                  <option value="">All Payment Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div className="income-filter-group">
                <label className="income-label">Sort:</label>
                <select
                  value={dateSort}
                  onChange={handleDateSortChange}
                  className="income-select"
                >
                  <option value="">Default</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="income-action-buttons">
                <button 
                  className="income-button income-primary-button"
                  onClick={() => navigate('/bills/income/add')}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Income
                </button>
                <button className="income-button income-secondary-button">
                  <i className="bi bi-download"></i>
                  Export
                </button>
              </div>
            </div>
            <div className="income-info-card">
              <div className="income-info-section">
                <div className="income-info-title">Total Income</div>
                <div className="income-info-value">₹{totalIncome.toLocaleString()}</div>
                <button className="income-view-report-button">
                  <i className="bi bi-graph-up me-1"></i>
                  View Report
                </button>
              </div>
              <div className="income-info-section">
                <div className="income-info-title">Pending Amount</div>
                <div className="income-info-value">₹{pendingAmount.toLocaleString()}</div>
                <button className="income-view-report-button">
                  <i className="bi bi-clock me-1"></i>
                  View Details
                </button>
              </div>
              <div className="income-info-section">
                <div className="income-info-title">Total Entries</div>
                <div className="income-info-value">{incomes.length}</div>
                <button className="income-view-report-button">
                  <i className="bi bi-list-ul me-1"></i>
                  View All
                </button>
              </div>
            </div>
          </div>
          
          <div className="income-list">
            {loading ? (
              <div className="income-loading-message">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Loading incomes...
              </div>
            ) : error ? (
              <div className="income-error-message">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : filteredIncomes.length === 0 ? (
              <div className="income-loading-message">
                <i className="bi bi-inbox me-2"></i>
                No incomes found
              </div>
            ) : (
              filteredIncomes.map(income => (
                <div
                  key={income.id}
                  className="income-item"
                  onClick={() => handleIncomeClick(income)}
                >
                  <div className="income-image-container">
                    {income.photoPath ? (
                      <img
                        src={income.photoPath}
                        alt={income.item.name}
                        className="income-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="income-placeholder-image">
                      <i className="bi bi-image"></i>
                    </div>
                  </div>
                  <div className="income-details-container">
                    <div className="income-number">{income.incomeNo}</div>
                    <div className="income-details-row">
                      <span className="income-detail-pill">
                        <i className="bi bi-tag me-1"></i>
                        {income.category.name}
                      </span>
                      <span className="income-detail-pill">
                        <i className="bi bi-box me-1"></i>
                        {income.item.name}
                      </span>
                      <span className="income-detail-pill">
                        <i className="bi bi-credit-card me-1"></i>
                        {income.paymentMode}
                      </span>
                    </div>
                    <div className="income-date">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(income.date).toLocaleDateString()}
                    </div>
                    {income.remarks && (
                      <div className="income-remarks">
                        <i className="bi bi-chat-text me-1"></i>
                        {income.remarks}
                      </div>
                    )}
                  </div>
                  <div className="income-amount">
                    ₹{income.amount.toLocaleString()}
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