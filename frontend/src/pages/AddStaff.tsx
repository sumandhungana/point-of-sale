import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { createStaff, createStaffSalary } from '../services/staffService';
import '../styles/AddStaff.css';

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-staff-container">
        <Navbar />
        <div className="add-staff-card">
          <form className="add-staff-form" onSubmit={handleSubmit}>
            <div className="add-staff-sections">
              {/* First Section - Image */}
              <div className="add-staff-section">
                <div className="add-staff-image-placeholder">
                  <i className="bi bi-person"></i>
                </div>
              </div>

              {/* Second Section - Name and Address */}
              <div className="add-staff-section">
                <div className="add-staff-form-group">
                  <label className="add-staff-label">
                    <i className="bi bi-person"></i>
                    Staff Name
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="add-staff-input" 
                    required
                    placeholder="Enter staff name"
                  />
                </div>
                <div className="add-staff-form-group">
                  <label className="add-staff-label">
                    <i className="bi bi-geo-alt"></i>
                    Address
                  </label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="add-staff-input" 
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Third Section - Contact Information */}
              <div className="add-staff-section">
                <div className="add-staff-form-group">
                  <label className="add-staff-label">
                    <i className="bi bi-telephone"></i>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="add-staff-input" 
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="add-staff-form-group">
                  <label className="add-staff-label">
                    <i className="bi bi-envelope"></i>
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="add-staff-input" 
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="add-staff-form-group">
              <label className="add-staff-label">
                <i className="bi bi-chat-text"></i>
                Remarks
              </label>
              <textarea 
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="add-staff-textarea" 
                placeholder="Enter any additional remarks..."
              />
            </div>
          </form>
        </div>

        <div className="add-staff-salary-management-section">
          <h2 className="add-staff-salary-heading">
            <i className="bi bi-currency-dollar"></i>
            Manage Salary
          </h2>
          <div className="add-staff-salary-card">
            <div className="add-staff-salary-sections">
              <div className="add-staff-salary-section">
                <div className="add-staff-section-label">Attendance and Salary</div>
                <div className="add-staff-calendar-container">
                  <div className="add-staff-calendar-controls">
                    <select 
                      className="add-staff-calendar-select"
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(Number(e.target.value))}
                    >
                      {months.map((month, index) => (
                        <option key={month} value={index}>{month}</option>
                      ))}
                    </select>
                    <select 
                      className="add-staff-calendar-select"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="add-staff-calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="add-staff-calendar-day">{day}</div>
                    ))}
                    {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                      <div key={`empty-${index}`} className="add-staff-calendar-date"></div>
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
                          className={`add-staff-calendar-date ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedDate(date)}
                        >
                          {index + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="add-staff-slide-section">
                <div className="add-staff-section-label">Slide</div>
                <div className="add-staff-slide-container">
                  <div 
                    className={`add-staff-slide-button ${isSlideOn ? 'active' : ''}`}
                    onClick={() => setIsSlideOn(!isSlideOn)}
                  >
                    <div className="add-staff-slide-circle" />
                  </div>
                </div>
              </div>
            </div>

            <div className="add-staff-salary-fields">
              <div className="add-staff-field-group">
                <label className="add-staff-field-label">
                  <i className="bi bi-calendar"></i>
                  Salary Calculation Date
                </label>
                <input 
                  type="date" 
                  name="calculationDate"
                  value={salaryData.calculationDate.split('T')[0]}
                  onChange={handleSalaryInputChange}
                  className="add-staff-field-input" 
                />
              </div>
              <div className="add-staff-field-group">
                <label className="add-staff-field-label">
                  <i className="bi bi-clock"></i>
                  Salary Type
                </label>
                <select 
                  name="salaryType"
                  value={salaryData.salaryType}
                  onChange={handleSalaryInputChange}
                  className="add-staff-select"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div className="add-staff-field-group">
                <label className="add-staff-field-label">
                  <i className="bi bi-currency-rupee"></i>
                  Salary Amount
                </label>
                <input 
                  type="number" 
                  name="amount"
                  value={salaryData.amount}
                  onChange={handleSalaryInputChange}
                  className="add-staff-field-input" 
                  placeholder="Enter amount" 
                  required
                />
              </div>
              <div className="add-staff-field-group">
                <label className="add-staff-field-label">
                  <i className="bi bi-shield-check"></i>
                  Permission
                </label>
                <select 
                  name="permission"
                  value={salaryData.permission}
                  onChange={handleSalaryInputChange}
                  className="add-staff-select"
                >
                  <option value="full">Full Access</option>
                  <option value="limited">Limited Access</option>
                  <option value="restricted">Restricted Access</option>
                </select>
              </div>
            </div>
          </div>
          {error && (
            <div className="add-staff-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="add-staff-save-button"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <div className="add-staff-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i>
                Save Staff
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 