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
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncomesService();
      setIncomes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = 
      income.incomeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.paymentMode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    if (dateSort === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (dateSort === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

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

  const handleAddBill = () => {
    navigate('/bills/income/add');
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const pendingAmount = 0; // This would be calculated based on business logic

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="income-container">
        <Navbar />
        <div className="income-card">
          <div className="income-search-container">
            <div className="income-search-bar">
              <div style={{ position: 'relative', flex: 2 }}>
                <i className="bi bi-search income-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search incomes..."
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
                  <option value="">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="income-filter-group">
                <label className="income-label">Sort:</label>
                <select
                  value={dateSort}
                  onChange={handleDateSortChange}
                  className="income-select"
                >
                  <option value="">Date Added</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="income-action-buttons">
                <button className="income-button income-primary-button">
                  <i className="bi bi-file-earmark-text"></i>
                  Bulk Reminder
                </button>
                <button className="income-button income-secondary-button">
                  <i className="bi bi-file-pdf"></i>
                  PDF
                </button>
              </div>
            </div>
            <div className="income-info-card">
              <div className="income-info-section">
                <div className="income-info-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="income-info-header">
                  <div className="income-info-title">Total Income</div>
                </div>
                <div className="income-info-value">₹{totalIncome.toLocaleString()}</div>
                <button className="income-view-more-button">
                  <i className="bi bi-eye"></i>
                  View More
                </button>
              </div>
              <div className="income-info-section">
                <div className="income-info-icon">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="income-info-header">
                  <div className="income-info-title">Pending Amount</div>
                </div>
                <div className="income-info-value">₹{pendingAmount.toLocaleString()}</div>
                <button className="income-view-more-button">
                  <i className="bi bi-eye"></i>
                  View More
                </button>
              </div>
              <div className="income-info-section">
                <div className="income-info-icon">
                  <i className="bi bi-list-ul"></i>
                </div>
                <div className="income-info-header">
                  <div className="income-info-title">Total Bills</div>
                </div>
                <div className="income-info-value">{incomes.length}</div>
                <button className="income-view-more-button">
                  <i className="bi bi-eye"></i>
                  View More
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
              filteredIncomes.map((income) => (
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
                          const next = e.currentTarget.nextElementSibling as HTMLElement;
                          if (next) next.style.display = 'flex';
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
      
      {/* Floating Add New Bill Button */}
      <button 
        className="income-add-button"
        onClick={handleAddBill}
      >
        <i className="bi bi-plus-circle"></i>
        Add New Bill
      </button>
    </div>
  );
};