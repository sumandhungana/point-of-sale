import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { createStaff, createStaffSalary } from '../services/staffService';

export const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const [isSlideOn, setIsSlideOn] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    remarks: '',
    profileImageUrl: '',
  });

  const [salaryData, setSalaryData] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    selectedDate: new Date().toISOString(),
    isSlideOn: false,
    calculationDate: new Date().toISOString(),
    salaryType: 'monthly',
    amount: '',
    permission: 'full',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSalaryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First API call to create staff
      const staffData = await createStaff(formData);
      const staffId = staffData.id;

      await createStaffSalary({
        ...salaryData,
        staffId,
        month: currentMonth,
        year: currentYear,
        selectedDate: selectedDate?.toISOString() || new Date().toISOString(),
        isSlideOn,
        calculationDate: new Date().toISOString(),
      });

      // Navigate to staff list or show success message
      alert('Staff and salary record created successfully!');
      navigate('/staff');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.sections}>
              {/* First Section - Image */}
              <div style={styles.section}>
                <div style={styles.imagePlaceholder}>👤</div>
              </div>

              {/* Second Section - Name and Address */}
              <div style={styles.section}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Staff Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input} 
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={styles.input} 
                  />
                </div>
              </div>

              {/* Third Section - Contact Information */}
              <div style={styles.section}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={styles.input} 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input} 
                  />
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Remarks</label>
              <textarea 
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                style={styles.textarea} 
              />
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
                <input 
                  type="date" 
                  name="calculationDate"
                  value={salaryData.calculationDate.split('T')[0]}
                  onChange={handleSalaryInputChange}
                  style={styles.fieldInput} 
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Salary Type</label>
                <select 
                  name="salaryType"
                  value={salaryData.salaryType}
                  onChange={handleSalaryInputChange}
                  style={styles.select}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Salary Amount</label>
                <input 
                  type="number" 
                  name="amount"
                  value={salaryData.amount}
                  onChange={handleSalaryInputChange}
                  style={styles.fieldInput} 
                  placeholder="Enter amount" 
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Permission</label>
                <select 
                  name="permission"
                  value={salaryData.permission}
                  onChange={handleSalaryInputChange}
                  style={styles.select}
                >
                  <option value="full">Full Access</option>
                  <option value="limited">Limited Access</option>
                  <option value="restricted">Restricted Access</option>
                </select>
              </div>
            </div>
          </div>
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            style={styles.saveButton}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}; 