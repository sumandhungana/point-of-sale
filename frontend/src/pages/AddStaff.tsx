
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

  const [currentMonth, setCurrentMonth] = useState(
    new Date().getMonth()
  );

  const [currentYear, setCurrentYear] = useState(
    new Date().getFullYear()
  );

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
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => currentYear - 5 + i
  );

  const getDaysInMonth = (
    year: number,
    month: number
  ) => {
    return new Date(
      year,
      month + 1,
      0
    ).getDate();
  };

  const getFirstDayOfMonth = (
    year: number,
    month: number
  ) => {
    return new Date(
      year,
      month,
      1
    ).getDay();
  };

  const daysInMonth = getDaysInMonth(
    currentYear,
    currentMonth
  );

  const firstDayOfMonth =
    getFirstDayOfMonth(
      currentYear,
      currentMonth
    );

  /* =========================
     BACK BUTTON
     ========================= */

  const handleBack = () => {
    navigate(-1);
  };

  /* =========================
     DATE
     ========================= */

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());

    setFormData((prev) => ({
      ...prev,
      salaryStartDate:
        formatDateToYYYYMMDD(date),
    }));
  };

  /* =========================
     STAFF INPUT
     ========================= */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    if (
      name === 'salaryStartDate' &&
      value
    ) {
      const [
        year,
        month,
        day,
      ] = value
        .split('-')
        .map(Number);

      const newDate = new Date(
        year,
        month - 1,
        day
      );

      handleDateSelect(newDate);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     SALARY INPUT
     ========================= */

  const handleSalaryInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setSalaryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     IMAGE UPLOAD
     ========================= */

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      setError(
        'Please select a valid image file.'
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        'Image size must be less than 5 MB.'
      );
      return;
    }

    setError(null);

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result ===
        'string'
      ) {
        setImagePreview(
          result
        );

        setFormData(
          (prev) => ({
            ...prev,
            profileImageUrl:
              result,
          })
        );
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage =
    () => {
      setImagePreview('');

      setFormData(
        (prev) => ({
          ...prev,
          profileImageUrl:
            '',
        })
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          '';
      }
    };

  /* =========================
     SUBMIT
     ========================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const staffData =
        await createStaff(
          formData
        );

      const staffId =
        staffData.id;

      const selectedDateValue =
        formatDateForApi(
          selectedDate
        );

      const calculationDateValue =
        formatDateForApi(
          selectedDate
        );

      await createStaffSalary({
        ...salaryData,
        staffId,
        month:
          selectedDate.getMonth() +
          1,
        year:
          selectedDate.getFullYear(),
        selectedDate:
          selectedDateValue,
        calculationDate:
          calculationDateValue,
        isSlideOn,
      });

      alert(
        'Staff and salary record created successfully!'
      );

      navigate('/staff');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred'
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

          {/* BACK BUTTON */}

          <button
            type="button"
            className="add-staff-back-button"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back</span>
          </button>

          <form
            className="add-staff-form"
            onSubmit={handleSubmit}
          >

            {/* =========================
                STAFF INFORMATION
                ========================= */}

            <div className="add-staff-card">

              <div className="add-staff-sections">

                {/* PHOTO */}

                <div className="add-staff-section add-staff-photo-section">

                  <div className="add-staff-image-upload">

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="add-staff-file-input"
                      onChange={handleImageChange}
                    />

                    <button
                      type="button"
                      className={`add-staff-image-placeholder ${
                        imagePreview
                          ? 'has-image'
                          : ''
                      }`}
                      onClick={
                        handleImageClick
                      }
                    >

                      {imagePreview ? (

                        <img
                          src={imagePreview}
                          alt="Staff preview"
                          className="add-staff-image-preview"
                        />

                      ) : (

                        <>
                          <i className="bi bi-person"></i>

                          <span className="add-staff-upload-text">
                            Upload Photo
                          </span>

                          <small>
                            JPG, PNG up to 5MB
                          </small>
                        </>

                      )}

                    </button>

                    {imagePreview && (
                      <button
                        type="button"
                        className="add-staff-image-remove"
                        onClick={
                          handleRemoveImage
                        }
                      >
                        <i className="bi bi-trash"></i>
                        Remove Photo
                      </button>
                    )}

                  </div>

                </div>

                {/* NAME + ADDRESS */}

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
                      onChange={
                        handleInputChange
                      }
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
                      value={
                        formData.address
                      }
                      onChange={
                        handleInputChange
                      }
                      className="add-staff-input"
                      placeholder="Enter address"
                    />

                  </div>

                </div>

                {/* PHONE + EMAIL */}

                <div className="add-staff-section">

                  <div className="add-staff-form-group">

                    <label className="add-staff-label">
                      <i className="bi bi-telephone"></i>
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleInputChange
                      }
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
                      value={
                        formData.email
                      }
                      onChange={
                        handleInputChange
                      }
                      className="add-staff-input"
                      placeholder="Enter email address"
                    />

                  </div>

                </div>

              </div>

              {/* REMARKS */}

              <div className="add-staff-form-group">

                <label className="add-staff-label">
                  <i className="bi bi-chat-text"></i>
                  Remarks
                </label>

                <textarea
                  name="remarks"
                  value={
                    formData.remarks
                  }
                  onChange={
                    handleInputChange
                  }
                  className="add-staff-textarea"
                  placeholder="Enter any additional remarks..."
                />

              </div>

            </div>

            {/* =========================
                SALARY MANAGEMENT
                ========================= */}

            <div className="add-staff-salary-management-section">

              <h2 className="add-staff-salary-heading">
                <i className="bi bi-currency-rupee"></i>
                Manage Salary
              </h2>

              <div className="add-staff-salary-card">

                <div className="add-staff-salary-sections">

                  {/* CALENDAR */}

                  <div className="add-staff-salary-section">

                    <div className="add-staff-section-label">
                      Attendance and Salary
                    </div>

                    <div className="add-staff-calendar-container">

                      <div className="add-staff-calendar-controls">

                        <select
                          className="add-staff-calendar-select"
                          value={
                            currentMonth
                          }
                          onChange={(e) =>
                            setCurrentMonth(
                              Number(
                                e.target.value
                              )
                            )
                          }
                        >
                          {months.map(
                            (
                              month,
                              index
                            ) => (
                              <option
                                key={
                                  month
                                }
                                value={
                                  index
                                }
                              >
                                {month}
                              </option>
                            )
                          )}
                        </select>

                        <select
                          className="add-staff-calendar-select"
                          value={
                            currentYear
                          }
                          onChange={(e) =>
                            setCurrentYear(
                              Number(
                                e.target.value
                              )
                            )
                          }
                        >
                          {years.map(
                            (year) => (
                              <option
                                key={
                                  year
                                }
                                value={
                                  year
                                }
                              >
                                {year}
                              </option>
                            )
                          )}
                        </select>

                      </div>

                      <div className="add-staff-calendar-grid">

                        {[
                          'Sun',
                          'Mon',
                          'Tue',
                          'Wed',
                          'Thu',
                          'Fri',
                          'Sat',
                        ].map(
                          (day) => (
                            <div
                              key={day}
                              className="add-staff-calendar-day"
                            >
                              {day}
                            </div>
                          )
                        )}

                        {Array.from({
                          length:
                            firstDayOfMonth,
                        }).map(
                          (_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="add-staff-calendar-date empty"
                            ></div>
                          )
                        )}

                        {Array.from({
                          length:
                            daysInMonth,
                        }).map(
                          (
                            _,
                            index
                          ) => {

                            const date =
                              new Date(
                                currentYear,
                                currentMonth,
                                index + 1
                              );

                            const isSelected =
                              date.getDate() ===
                                selectedDate.getDate() &&
                              date.getMonth() ===
                                selectedDate.getMonth() &&
                              date.getFullYear() ===
                                selectedDate.getFullYear();

                            return (
                              <button
                                type="button"
                                key={
                                  index + 1
                                }
                                className={`add-staff-calendar-date ${
                                  isSelected
                                    ? 'selected'
                                    : ''
                                }`}
                                onClick={() =>
                                  handleDateSelect(
                                    date
                                  )
                                }
                              >
                                {
                                  index +
                                  1
                                }
                              </button>
                            );
                          }
                        )}

                      </div>

                    </div>

                  </div>

                  {/* SLIDE */}

                  <div className="add-staff-slide-section">

                    <div className="add-staff-section-label">
                      Slide
                    </div>

                    <div className="add-staff-slide-container">

                      <button
                        type="button"
                        className={`add-staff-slide-button ${
                          isSlideOn
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setIsSlideOn(
                            !isSlideOn
                          )
                        }
                      >
                        <div className="add-staff-slide-circle"></div>
                      </button>

                      <span className="add-staff-slide-status">
                        {isSlideOn
                          ? 'Enabled'
                          : 'Disabled'}
                      </span>

                    </div>

                  </div>

                </div>

                {/* SALARY FIELDS */}

                <div className="add-staff-salary-fields">

                  <div className="add-staff-field-group">

                    <label className="add-staff-field-label">
                      <i className="bi bi-calendar"></i>
                      Salary Start Date
                    </label>

                    <input
                      type="date"
                      name="salaryStartDate"
                      value={
                        formData.salaryStartDate
                      }
                      onChange={
                        handleInputChange
                      }
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
                      value={
                        salaryData.salaryType
                      }
                      onChange={
                        handleSalaryInputChange
                      }
                      className="add-staff-select"
                    >
                      <option value="monthly">
                        Monthly
                      </option>

                      <option value="weekly">
                        Weekly
                      </option>

                      <option value="daily">
                        Daily
                      </option>
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
                      value={
                        salaryData.amount
                      }
                      onChange={
                        handleSalaryInputChange
                      }
                      className="add-staff-field-input"
                      placeholder="Enter amount"
                      min="0"
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
                      value={
                        salaryData.permission
                      }
                      onChange={
                        handleSalaryInputChange
                      }
                      className="add-staff-select"
                    >
                      <option value="full">
                        Full Access
                      </option>

                      <option value="limited">
                        Limited Access
                      </option>

                      <option value="restricted">
                        Restricted Access
                      </option>
                    </select>

                  </div>

                </div>

              </div>

              {error && (
                <div className="add-staff-error">
                  <i className="bi bi-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="add-staff-save-button"
                disabled={loading}
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

          </form>

        </div>

      </div>

    </div>
  );
};

export default AddStaff;
