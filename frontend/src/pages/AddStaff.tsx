import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';

export const AddStaff: React.FC = () => {
  const [isSlideOn, setIsSlideOn] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
      minHeight: '100vh',
    },
    
    main: {
      flex: 1,
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    sections: {
      display: 'flex',
      gap: '2rem',
      marginBottom: '2rem',
    },
    section: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    imagePlaceholder: {
      width: '150px',
      height: '150px',
      background: '#e9ecef',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
      fontSize: '2rem',
      marginBottom: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      color: '#6c757d',
      fontWeight: 'bold',
    },
    input: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
    },
    textarea: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      minHeight: '100px',
      resize: 'vertical' as const,
    },
    button: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      marginTop: '1rem',
    },
    salaryManagementSection: {
      marginTop: '2rem',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    salaryHeading: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '1rem',
    },
    salaryCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
    },
    salarySections: {
      display: 'flex',
      gap: '2rem',
      justifyContent: 'space-between',
    },
    salarySection: {
      flex: 1,
      maxWidth: '300px',
    },
    sectionLabel: {
      fontSize: '0.875rem',
      color: '#6c757d',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    calendarContainer: {
      background: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '300px',
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    calendarTitle: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#212529',
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
    slideContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    slideButton: {
      width: '60px',
      height: '30px',
      background: isSlideOn ? '#28a745' : '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    slideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: isSlideOn ? '32px' : '2px',
      transition: 'transform 0.3s ease',
    },
    salaryFields: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    fieldLabel: {
      fontSize: '0.875rem',
      color: '#6c757d',
      fontWeight: 'bold',
    },
    fieldInput: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      width: '100%',
    },
    select: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      width: '100%',
    },
    slideSection: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      marginTop: '1.5rem',
      alignSelf: 'flex-end',
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
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
      
        <div style={styles.card}>
          <form style={styles.form}>
            <div style={styles.sections}>
              {/* First Section - Image */}
              <div style={styles.section}>
                <div style={styles.imagePlaceholder}>👤</div>
              </div>

              {/* Second Section - Name and Address */}
              <div style={styles.section}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Staff Name</label>
                  <input type="text" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <input type="text" style={styles.input} />
                </div>
              </div>

              {/* Third Section - Contact Information */}
              <div style={styles.section}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input type="tel" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input type="email" style={styles.input} />
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Remarks</label>
              <textarea style={styles.textarea} />
            </div>
        
          </form>
        </div>

        <div style={styles.salaryManagementSection}>
          <h2 style={styles.salaryHeading}>Manage Salary</h2>
          <div style={styles.salaryCard}>
            <div style={styles.salarySections}>
              <div style={styles.salarySection}>
                <div style={styles.sectionLabel}>Attendance and Salary</div>
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
                </div>
              </div>
              <div style={styles.slideSection}>
                <div style={styles.sectionLabel}>Slide</div>
                <div style={styles.slideContainer}>
                  <div 
                    style={styles.slideButton}
                    onClick={() => setIsSlideOn(!isSlideOn)}
                  >
                    <div style={styles.slideCircle} />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.salaryFields}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Salary Calculation Date</label>
                <input type="date" style={styles.fieldInput} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Salary Type</label>
                <select style={styles.select}>
                  <option value="">Select Type</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Salary Amount</label>
                <input type="number" style={styles.fieldInput} placeholder="Enter amount" />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Permission</label>
                <select style={styles.select}>
                  <option value="">Select Permission</option>
                  <option value="full">Full Access</option>
                  <option value="limited">Limited Access</option>
                  <option value="restricted">Restricted Access</option>
                </select>
              </div>
            </div>
          </div>
          <button style={styles.saveButton}>Save</button>
        </div>
      </div>
    </div>
  );
}; 