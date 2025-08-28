import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { BackButton } from '../components/BackButton';
import { useNavigate } from 'react-router-dom';
import '../styles/StaffPayment.css';

export const StaffPayment: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const handleAddPayment = () => {
    navigate('/staff/payment/add');
  };

  return (
    <div className="staff-payment-container">
      <Sidebar />
      <div className="staff-payment-main">
        <div className="staff-payment-header" style={{ position: 'relative', marginBottom: '1rem', minHeight: '120px' }}>
          <BackButton 
            to="/staff" 
            label="Back to Staff" 
            className="below-navbar"
          />
        </div>
      
        <div className="staff-payment-summary-cards">
          <div className="staff-payment-summary-card">
            <div className="staff-payment-summary-title">
              <i className="bi bi-cash-stack me-1"></i>
              Total Due
            </div>
            <div className="staff-payment-summary-amount">रु25,000</div>
          </div>
          <div className="staff-payment-summary-card">
            <div className="staff-payment-summary-title">
              <i className="bi bi-eye me-1"></i>
              Show Permission
            </div>
            <button className="staff-payment-permission-button">
              <i className="bi bi-eye me-1"></i>
              Show
            </button>
          </div>
        </div>

        <div className="staff-payment-card">
          <div className="staff-payment-calendar-container">
            <div className="staff-payment-calendar-controls">
              <select
                className="staff-payment-calendar-select"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <select
                className="staff-payment-calendar-select"
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="staff-payment-calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="staff-payment-calendar-day">
                  <i className="bi bi-calendar-week me-1"></i>
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="staff-payment-calendar-date"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const date = new Date(currentYear, currentMonth, index + 1);
                const isSelected = selectedDate &&
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();

                return (
                  <div
                    key={index + 1}
                    className={`staff-payment-calendar-date ${isSelected ? 'staff-payment-selected-date' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
            <div className="staff-payment-attendance-status">
              <div className="staff-payment-status-item">
                <input
                  type="radio"
                  name="attendance"
                  value="present"
                  checked={selectedStatus === 'present'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="staff-payment-radio-button"
                />
                <span className="staff-payment-status-label">
                  <i className="bi bi-check-circle me-1"></i>
                  Present
                </span>
              </div>
              <div className="staff-payment-status-item">
                <input
                  type="radio"
                  name="attendance"
                  value="absent"
                  checked={selectedStatus === 'absent'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="staff-payment-radio-button"
                />
                <span className="staff-payment-status-label">
                  <i className="bi bi-x-circle me-1"></i>
                  Absent
                </span>
              </div>
              <div className="staff-payment-status-item">
                <input
                  type="radio"
                  name="attendance"
                  value="halfDay"
                  checked={selectedStatus === 'halfDay'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="staff-payment-radio-button"
                />
                <span className="staff-payment-status-label">
                  <i className="bi bi-clock me-1"></i>
                  Half Day
                </span>
              </div>
              <div className="staff-payment-status-item">
                <input
                  type="radio"
                  name="attendance"
                  value="leave"
                  checked={selectedStatus === 'leave'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="staff-payment-radio-button"
                />
                <span className="staff-payment-status-label">
                  <i className="bi bi-calendar-x me-1"></i>
                  Leave
                </span>
              </div>
            </div>
            <div className="staff-payment-bottom-controls">
              <input
                type="date"
                className="staff-payment-date-picker"
              />
              <button className="staff-payment-view-summary-button">
                <i className="bi bi-graph-up me-1"></i>
                View Summary
              </button>
            </div>
          </div>
          <table className="staff-payment-salary-table">
            <thead>
              <tr>
                <th className="staff-payment-table-header">
                  <i className="bi bi-calendar-day me-1"></i>
                  Today(Salary)
                </th>
                <th className="staff-payment-table-header">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Due
                </th>
                <th className="staff-payment-table-header">
                  <i className="bi bi-check-circle me-1"></i>
                  Paid
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु15,000</span>
                </td>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु25,000</span>
                </td>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु10,000</span>
                </td>
              </tr>
              <tr>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु12,000</span>
                </td>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु18,000</span>
                </td>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु6,000</span>
                </td>
              </tr>
              <tr>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु20,000</span>
                </td>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु30,000</span>
                </td>
                <td className="staff-payment-table-cell">
                  <span className="staff-payment-amount-cell">रु10,000</span>
                </td>
              </tr>
            </tbody>
          </table>
          <button 
            className="staff-payment-add-payment-button"
            onClick={handleAddPayment}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add Payments
          </button>
        </div>
      </div>
    </div>
  );
}; 