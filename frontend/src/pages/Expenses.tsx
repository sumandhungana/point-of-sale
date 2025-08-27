import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchExpenses } from '../services/expensesListService';
import '../styles/Expenses.css';

interface Expense {
  id: number;
  expensesNo: string;
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

export const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('');

  useEffect(() => {
    fetchExpensesList();
  }, []);

  const fetchExpensesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.expensesNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.paymentMode.toLowerCase().includes(searchQuery.toLowerCase());

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

  const handleExpenseClick = (expense: Expense) => {
    navigate('/bills/expenses/add', { state: { expense } });
  };



  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = 0; // This would be calculated based on business logic

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="expenses-container">
        <Navbar />
        <div className="expenses-card">
          <div className="expenses-search-container">
            <div className="expenses-search-bar">
              <div style={{ position: 'relative', flex: 2 }}>
                <i className="bi bi-search expenses-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="expenses-search-input"
                />
              </div>
              <div className="expenses-filter-group">
                <label className="expenses-label">Filter:</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="expenses-select"
                >
                  <option value="">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="expenses-filter-group">
                <label className="expenses-label">Sort:</label>
                <select
                  value={dateSort}
                  onChange={handleDateSortChange}
                  className="expenses-select"
                >
                  <option value="">Date Added</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

            </div>
            <div className="expenses-info-card">
              <div className="expenses-info-section">
                <div className="expenses-info-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="expenses-info-header">
                  <div className="expenses-info-title">Total Expenses</div>
                </div>
                <div className="expenses-info-value">₹{totalExpenses.toLocaleString()}</div>
                <button className="expenses-view-more-button">
                  <i className="bi bi-graph-up"></i>
                  View Report
                </button>
              </div>
              <div className="expenses-info-section">
                <div className="expenses-info-icon">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="expenses-info-header">
                  <div className="expenses-info-title">Pending Amount</div>
                </div>
                <div className="expenses-info-value">₹{pendingAmount.toLocaleString()}</div>
                <button className="expenses-view-more-button">
                  <i className="bi bi-clock"></i>
                  View Details
                </button>
              </div>
              <div className="expenses-info-section">
                <div className="expenses-info-icon">
                  <i className="bi bi-list-ul"></i>
                </div>
                <div className="expenses-info-header">
                  <div className="expenses-info-title">Total Bills</div>
                </div>
                <div className="expenses-info-value">{expenses.length}</div>
                <button className="expenses-view-more-button">
                  <i className="bi bi-list-ul"></i>
                  View All
                </button>
              </div>
            </div>
          </div>

          <div className="expenses-list">
            {loading ? (
              <div className="expenses-loading-message">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Loading expenses...
              </div>
            ) : error ? (
              <div className="expenses-error-message">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="expenses-loading-message">
                <i className="bi bi-inbox me-2"></i>
                No expenses found
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="expenses-item"
                  onClick={() => handleExpenseClick(expense)}
                >
                  <div className="expenses-image-container">
                    {expense.photoPath ? (
                      <img 
                        src={expense.photoPath} 
                        alt={expense.item.name}
                        className="expenses-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const next = e.currentTarget.nextElementSibling as HTMLElement;
                          if (next) next.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="expenses-placeholder-image">
                      <i className="bi bi-image"></i>
                    </div>
                  </div>
                  <div className="expenses-details-container">
                    <div className="expenses-number">{expense.expensesNo}</div>
                    <div className="expenses-details-row">
                      <span className="expenses-detail-pill">
                        <i className="bi bi-tag me-1"></i>
                        {expense.category.name}
                      </span>
                      <span className="expenses-detail-pill">
                        <i className="bi bi-box me-1"></i>
                        {expense.item.name}
                      </span>
                      <span className="expenses-detail-pill">
                        <i className="bi bi-credit-card me-1"></i>
                        {expense.paymentMode}
                      </span>
                    </div>
                    <div className="expenses-date">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                    {expense.remarks && (
                      <div className="expenses-remarks">
                        <i className="bi bi-chat-text me-1"></i>
                        {expense.remarks}
                      </div>
                    )}
                  </div>
                  <div className="expenses-amount">
                    ₹{expense.amount.toLocaleString()}
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