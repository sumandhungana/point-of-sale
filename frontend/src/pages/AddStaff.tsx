import React, { useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { createStaff, createStaffSalary } from '../services/staffService';
import '../styles/AddStaff.css';

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
};

export const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSlideOn, setIsSlideOn] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    remarks: '',
    profileImageUrl: '',
    salaryStartDate: formatDateToYYYYMMDD(new Date()),
  });

  const [salaryData, setSalaryData] = useState({
    salaryType: 'monthly',
    amount: '',
    permission: 'full',
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
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

  /* =========================
     HANDLERS
     ========================= */

  const handleCancel = () => {
    navigate('/staff');
  };

  const handleBack = () => {
    navigate('/staff');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());

    setFormData((prev) => ({
      ...prev,
      salaryStartDate: formatDateToYYYYMMDD(date),
    }));
  };

  const handleInputChange = (
      e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
  ) => {
    const { name, value } = e.target;

    if (name === 'salaryStartDate' && value) {
      const [year, month, day] = value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      handleDateSelect(newDate);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSalaryInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSalaryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, profileImageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, profileImageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const staffData = await createStaff(formData);
      const staffId = staffData?.id;

      const selectedDateValue = formatDateForApi(selectedDate);
      const calculationDateValue = formatDateForApi(selectedDate);

      await createStaffSalary({
        ...salaryData,
        staffId,
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
        selectedDate: selectedDateValue,
        calculationDate: calculationDateValue,
        isSlideOn,
      });

      alert('Staff and salary record created successfully!');
      navigate('/staff');
    } catch (err) {
      setError(
          err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="add-staff-page">
        <Sidebar />

        <div className="add-staff-container">
          <Navbar />

          <div className="add-staff-content">
            <div className="add-staff-main-card">
              {/* Header with Title and Top-Right Cross Button */}
              <div className="add-staff-header">
                <div className="add-staff-header-left">
                  <div className="add-staff-header-icon-wrap">
                    <i className="bi bi-person-badge-fill" />
                  </div>

                  <div>
                    <h1 className="add-staff-title">Add New Staff</h1>
                    <p className="add-staff-subtitle">Register staff member profile and configure salary settings</p>
                  </div>
                </div>

                {/* Cross button on Top Right */}
                <button
                    type="button"
                    className="add-staff-close-btn"
                    onClick={handleCancel}
                    aria-label="Close"
                    title="Close"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <form className="add-staff-form" onSubmit={handleSubmit}>
                {/* Interactive Avatar Upload Card */}
                <div className="avatar-card-banner">
                  <div
                      className="avatar-preview-wrapper"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                  >
                    <div className="avatar-display-frame">
                      {imagePreview ? (
                          <img
                              src={imagePreview}
                              alt="Staff Preview"
                              className="avatar-img-preview"
                          />
                      ) : (
                          <div className="avatar-icon-fallback">
                            <i className="bi bi-person-fill" />
                          </div>
                      )}
                      <div className="avatar-hover-overlay">
                        <i className="bi bi-camera-fill" />
                        <span>Change</span>
                      </div>
                    </div>
                    <div className="avatar-camera-badge" title="Upload Photo">
                      <i className="bi bi-camera-fill" />
                    </div>
                  </div>

                  <div className="avatar-meta-info">
                    <h3 className="avatar-meta-title">Staff Photo</h3>
                    <p className="avatar-meta-hint">Upload a high-resolution JPG, PNG or WEBP image (max 5MB)</p>
                    <div className="avatar-action-buttons">
                      <button
                          type="button"
                          className="btn-upload-avatar"
                          onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="bi bi-cloud-arrow-up me-1" />
                        {imagePreview ? 'Replace Photo' : 'Choose Photo'}
                      </button>
                      {imagePreview && (
                          <button
                              type="button"
                              className="btn-remove-avatar"
                              onClick={handleRemoveImage}
                          >
                            <i className="bi bi-trash3 me-1" />
                            Remove
                          </button>
                      )}
                    </div>
                  </div>

                  <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                  />
                </div>

                {/* =========================
                  STAFF DETAILS GRID
                  ========================= */}
                <div className="add-staff-form-grid">
                  <div className="add-staff-form-group">
                    <label className="add-staff-label">
                      Staff Name <span className="add-staff-required">*</span>
                    </label>
                    <div className="add-staff-input-with-icon">
                      <i className="bi bi-person add-staff-field-icon" />
                      <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="add-staff-input"
                          required
                          placeholder="Enter staff full name"
                      />
                    </div>
                  </div>

                  <div className="add-staff-form-group">
                    <label className="add-staff-label">Address</label>
                    <div className="add-staff-input-with-icon">
                      <i className="bi bi-geo-alt add-staff-field-icon" />
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

                  <div className="add-staff-form-group">
                    <label className="add-staff-label">Phone Number</label>
                    <div className="add-staff-input-with-icon">
                      <i className="bi bi-telephone add-staff-field-icon" />
                      <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="add-staff-input"
                          placeholder="Enter contact phone number"
                      />
                    </div>
                  </div>

                  <div className="add-staff-form-group">
                    <label className="add-staff-label">Email Address</label>
                    <div className="add-staff-input-with-icon">
                      <i className="bi bi-envelope add-staff-field-icon" />
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

                  <div className="add-staff-form-group add-staff-full-width">
                    <label className="add-staff-label">Remarks</label>
                    <div className="add-staff-input-with-icon">
                      <i className="bi bi-chat-text add-staff-field-icon add-staff-textarea-icon" />
                      <textarea
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          className="add-staff-textarea"
                          placeholder="Enter any additional remarks..."
                          rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* =========================
                  SALARY MANAGEMENT
                  ========================= */}
                <div className="add-staff-salary-card">
                  <h2 className="add-staff-salary-heading">
                    <i className="bi bi-currency-rupee" />
                    Manage Salary & Schedule
                  </h2>

                  <div className="add-staff-salary-sections">
                    {/* CALENDAR */}
                    <div className="add-staff-salary-section">
                      <div className="add-staff-section-label">
                        Effective Start Month
                      </div>

                      <div className="add-staff-calendar-container">
                        <div className="add-staff-calendar-controls">
                          <select
                              className="add-staff-calendar-select"
                              value={currentMonth}
                              onChange={(e) =>
                                  setCurrentMonth(Number(e.target.value))
                              }
                          >
                            {months.map((month, index) => (
                                <option key={month} value={index}>
                                  {month}
                                </option>
                            ))}
                          </select>

                          <select
                              className="add-staff-calendar-select"
                              value={currentYear}
                              onChange={(e) =>
                                  setCurrentYear(Number(e.target.value))
                              }
                          >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                            ))}
                          </select>
                        </div>

                        <div className="add-staff-calendar-grid">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                              (day) => (
                                  <div
                                      key={day}
                                      className="add-staff-calendar-day"
                                  >
                                    {day}
                                  </div>
                              )
                          )}

                          {Array.from({ length: firstDayOfMonth }).map(
                              (_, index) => (
                                  <div
                                      key={`empty-${index}`}
                                      className="add-staff-calendar-date empty"
                                  />
                              )
                          )}

                          {Array.from({ length: daysInMonth }).map((_, index) => {
                            const date = new Date(
                                currentYear,
                                currentMonth,
                                index + 1
                            );

                            const isSelected =
                                date.getDate() === selectedDate.getDate() &&
                                date.getMonth() === selectedDate.getMonth() &&
                                date.getFullYear() === selectedDate.getFullYear();

                            return (
                                <button
                                    type="button"
                                    key={index + 1}
                                    className={`add-staff-calendar-date ${
                                        isSelected ? 'selected' : ''
                                    }`}
                                    onClick={() => handleDateSelect(date)}
                                >
                                  {index + 1}
                                </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SLIDE SWITCH */}
                    <div className="add-staff-slide-section">
                      <div className="add-staff-section-label">
                        Auto-Deduction / Overtime Slide
                      </div>

                      <div className="add-staff-slide-container">
                        <button
                            type="button"
                            className={`add-staff-slide-button ${
                                isSlideOn ? 'active' : ''
                            }`}
                            onClick={() => setIsSlideOn(!isSlideOn)}
                            aria-label="Toggle Auto-Deduction"
                        >
                          <div className="add-staff-slide-circle" />
                        </button>

                        <span className="add-staff-slide-status">
                          {isSlideOn ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SALARY INPUT FIELDS */}
                  <div className="add-staff-salary-fields">
                    <div className="add-staff-field-group">
                      <label className="add-staff-field-label">
                        Salary Start Date
                      </label>
                      <div className="add-staff-input-with-icon">
                        <i className="bi bi-calendar3 add-staff-field-icon" />
                        <input
                            type="date"
                            name="salaryStartDate"
                            value={formData.salaryStartDate}
                            onChange={handleInputChange}
                            className="add-staff-field-input"
                        />
                      </div>
                    </div>

                    <div className="add-staff-field-group">
                      <label className="add-staff-field-label">
                        Salary Type
                      </label>
                      <div className="add-staff-input-with-icon">
                        <i className="bi bi-clock-history add-staff-field-icon" />
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
                    </div>

                    <div className="add-staff-field-group">
                      <label className="add-staff-field-label">
                        Salary Amount <span className="add-staff-required">*</span>
                      </label>
                      <div className="add-staff-input-with-icon">
                        <i className="bi bi-currency-rupee add-staff-field-icon" />
                        <input
                            type="number"
                            name="amount"
                            value={salaryData.amount}
                            onChange={handleSalaryInputChange}
                            className="add-staff-field-input"
                            placeholder="Enter amount"
                            min="0"
                            required
                        />
                      </div>
                    </div>

                    <div className="add-staff-field-group">
                      <label className="add-staff-field-label">
                        Permission
                      </label>
                      <div className="add-staff-input-with-icon">
                        <i className="bi bi-shield-lock add-staff-field-icon" />
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
                </div>

                {error && (
                    <div className="add-staff-error">
                      <i className="bi bi-exclamation-triangle" />
                      <span>{error}</span>
                    </div>
                )}

                {/* =========================
                  FOOTER ACTION BUTTONS (CANCEL + SAVE)
                  ========================= */}
                <div className="add-staff-action-footer">
                  <button
                      type="button"
                      className="add-staff-cancel-button"
                      onClick={handleCancel}
                      disabled={loading}
                  >
                    <i className="bi bi-x-circle me-1" />
                    Cancel
                  </button>

                  <button
                      type="submit"
                      className="add-staff-save-button"
                      disabled={loading}
                  >
                    {loading ? (
                        <>
                          <div className="add-staff-spinner" />
                          Saving...
                        </>
                    ) : (
                        <>
                          <i className="bi bi-check2-circle me-1" />
                          Save Staff
                        </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AddStaff;