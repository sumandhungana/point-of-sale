import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

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

  const styles = {
    container: {
      display: 'flex',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    main: {
      flex: 1,
      padding: '2rem',
    },
   
    summaryCards: {
      display: 'flex',
      gap: '2rem',
      marginBottom: '1.5rem',
      justifyContent: 'center',
    },
    summaryCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1rem',
      minWidth: '250px',
      textAlign: 'center' as const,
    },
    summaryTitle: {
      fontSize: '0.875rem',
      color: '#6c757d',
      marginBottom: '0.5rem',
    },
    summaryAmount: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    permissionButton: {
      padding: '0.5rem 1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      marginTop: '1.5rem',
    },
    calendarContainer: {
      background: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '0 auto',
    },
    salaryTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '1.5rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    addPaymentButton: {
      padding: '0.5rem 1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '1rem',
      marginLeft: 'auto',
    },
    tableHeader: {
      padding: '0.75rem',
      textAlign: 'left' as const,
      borderBottom: '1px solid #dee2e6',
      color: '#6c757d',
      fontWeight: 'bold',
      fontSize: '0.875rem',
    },
    tableCell: {
      padding: '0.75rem',
      textAlign: 'left' as const,
      borderBottom: '1px solid #dee2e6',
      fontSize: '0.875rem',
    },
    amountCell: {
      fontWeight: 'bold',
      color: '#212529',
    },
    calendarControls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    calendarSelect: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      fontSize: '0.875rem',
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem',
    },
    calendarDay: {
      textAlign: 'center' as const,
      padding: '0.5rem',
      fontSize: '0.875rem',
      color: '#6c757d',
    },
    calendarDate: {
      textAlign: 'center' as const,
      padding: '0.5rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      borderRadius: '4px',
      '&:hover': {
        background: '#f8f9fa',
      },
    },
    selectedDate: {
      background: '#28a745',
      color: 'white',
      '&:hover': {
        background: '#28a745',
      },
    },
    attendanceStatus: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #dee2e6',
    },
    bottomControls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #dee2e6',
    },
    datePicker: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      fontSize: '0.875rem',
      width: '200px',
    },
    viewSummaryButton: {
      padding: '0.5rem 1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    statusItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    radioButton: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      accentColor: '#28a745',
    },
    statusLabel: {
      fontSize: '0.875rem',
      color: '#6c757d',
    },
  };

  const handleAddPayment = () => {
    navigate('/staff/payment/add');
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
      
        <div style={styles.summaryCards}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryTitle}>Total Due</div>
            <div style={styles.summaryAmount}>₹25,000</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryTitle}>Show Permission</div>
            <button style={styles.permissionButton}>Show</button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.calendarContainer}>
            <div style={styles.calendarControls}>
              <select
                style={styles.calendarSelect}
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <select
                style={styles.calendarSelect}
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div style={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={styles.calendarDay}>{day}</div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} style={styles.calendarDate}></div>
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
                    style={{
                      ...styles.calendarDate,
                      ...(isSelected ? styles.selectedDate : {}),
                    }}
                    onClick={() => setSelectedDate(date)}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
            <div style={styles.attendanceStatus}>
              <div style={styles.statusItem}>
                <input
                  type="radio"
                  name="attendance"
                  value="present"
                  checked={selectedStatus === 'present'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={styles.radioButton}
                />
                <span style={styles.statusLabel}>Present</span>
              </div>
              <div style={styles.statusItem}>
                <input
                  type="radio"
                  name="attendance"
                  value="absent"
                  checked={selectedStatus === 'absent'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={styles.radioButton}
                />
                <span style={styles.statusLabel}>Absent</span>
              </div>
              <div style={styles.statusItem}>
                <input
                  type="radio"
                  name="attendance"
                  value="halfDay"
                  checked={selectedStatus === 'halfDay'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={styles.radioButton}
                />
                <span style={styles.statusLabel}>Half Day</span>
              </div>
              <div style={styles.statusItem}>
                <input
                  type="radio"
                  name="attendance"
                  value="leave"
                  checked={selectedStatus === 'leave'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={styles.radioButton}
                />
                <span style={styles.statusLabel}>Leave</span>
              </div>
            </div>
            <div style={styles.bottomControls}>
              <input
                type="date"
                style={styles.datePicker}
              />
              <button style={styles.viewSummaryButton}>
                View Summary
              </button>
            </div>
          </div>
          <table style={styles.salaryTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Today(Salary)</th>
                <th style={styles.tableHeader}>Due</th>
                <th style={styles.tableHeader}>Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹15,000</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹25,000</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹10,000</span>
                </td>
              </tr>
              <tr>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹12,000</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹18,000</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹6,000</span>
                </td>
              </tr>
              <tr>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹20,000</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹30,000</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.amountCell}>₹10,000</span>
                </td>
              </tr>
            </tbody>
          </table>
          <button 
            style={styles.addPaymentButton}
            onClick={handleAddPayment}
          >
            Add Payments
            <span>➕</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 