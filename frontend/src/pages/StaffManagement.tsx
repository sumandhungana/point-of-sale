import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchStaff } from '../services/staffService';
import '../styles/StaffManagement.css';

interface StaffSalary {
  id: number;
  staffId: number;
  month: number;
  year: number;
  selectedDate: string;
  isSlideOn: boolean;
  calculationDate: string;
  salaryType: string;
  amount: number;
  permission: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffAttendance {
  id: number;
  staffId: number;
  date: string;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Staff {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  remarks: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  staffSalaries: StaffSalary[];
  staffAttendances: StaffAttendance[];
}

export const StaffManagement = () => {
  const navigate = useNavigate();
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | number | null>(null);
  const [permissionInput, setPermissionInput] = useState<string>('');
  const [staffPermissions, setStaffPermissions] = useState<Record<string | number, string[]>>({});
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const data = await fetchStaff();
        setStaffList(data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaffList();
  }, []);

  const handleOpenPermissionModal = (staffId: string | number) => {
    setSelectedStaffId(staffId);
    setIsPermissionModalOpen(true);
  };

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedStaffId(null);
    setPermissionInput('');
  };

  const handleAddPermission = () => {
    if (!permissionInput.trim() || !selectedStaffId) return;

    setStaffPermissions((prev) => {
      let currentList = prev[selectedStaffId] || [];
      // @ts-ignore
      if (currentList.includes(permissionInput.trim())) return prev;
      return {
        ...prev,
        [selectedStaffId]: [...currentList, permissionInput.trim()],
      };
    });

    setPermissionInput('');
  };

  const totalSalary = staffList.reduce((sum, staff) => {
    const salary = staff.staffSalaries[0];
    return sum + (salary?.amount || 0);
  }, 0);

  const handlePermissionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPermission();
    }
  };

  const handleRemovePermission = (staffId: string | number, permToRemove: string) => {
    setStaffPermissions((prev) => ({
      ...prev,
      [staffId]: (prev[staffId] || []).filter((p) => p !== permToRemove),
    }));
  };

  const activePermissions: string[] = selectedStaffId
    ? staffPermissions[selectedStaffId] || []
    : [];

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalAdvance = staffList.reduce((sum, staff) => {
    const advancePayments = staff.staffSalaries.filter(s => s.salaryType === 'Advance');
    return sum + advancePayments.reduce((advanceSum, salary) => advanceSum + salary.amount, 0);
  }, 0);

  const todayAttendances = staffList.reduce((acc, staff) => {
    const todayAttendance = staff.staffAttendances.find(a =>
      new Date(a.date).toDateString() === new Date().toDateString()
    );
    if (todayAttendance) {
      acc[todayAttendance.status] = (acc[todayAttendance.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredStaff = staffList
    .filter(staff => {
      if (!searchQuery) return true;
      return staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const calculateAccruedSalary = (staff: Staff): number => {
    const salary = staff.staffSalaries?.find(
      (s) => s.salaryType?.toLowerCase() !== 'advance'
    ) || staff.staffSalaries?.[0];

    if (!salary || !salary.calculationDate || !salary.amount || isNaN(salary.amount)) {
      return 0;
    }

    const salaryAmount = Number(salary.amount);

    const rawDateString = String(salary.calculationDate).split('T')[0];
    const dateParts = rawDateString.split('-');
    if (dateParts.length !== 3) return 0;

    const startYear = parseInt(dateParts[0], 10);
    const startMonth = parseInt(dateParts[1], 10) - 1;
    const startDay = parseInt(dateParts[2], 10);

    if (isNaN(startYear) || startYear < 2000 || isNaN(startMonth) || isNaN(startDay)) {
      return 0;
    }

    const startUtc = Date.UTC(startYear, startMonth, startDay);

    const now = new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    if (todayUtc < startUtc) {
      return 0;
    }

    const diffInMs = todayUtc - startUtc;
    const elapsedDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    if (elapsedDays < 1) return 0;

    switch (salary.salaryType?.toLowerCase()) {
      case 'monthly': {
        const daysInMonth = new Date(startYear, startMonth + 1, 0).getDate();
        if (!daysInMonth || daysInMonth <= 0) return 0;

        const dailySalary = salaryAmount / daysInMonth;
        return Math.round(dailySalary * elapsedDays);
      }

      case 'daily': {
        return Math.round(salaryAmount * elapsedDays);
      }

      case 'weekly': {
        const dailySalary = salaryAmount / 7;
        return Math.round(dailySalary * elapsedDays);
      }

      default:
        return 0;
    }
  };

  const totalDue = staffList.reduce((total, staff) => {
    const accrued = calculateAccruedSalary(staff);
    return total + (isNaN(accrued) || !isFinite(accrued) ? 0 : accrued);
  }, 0);

  // Format relative time (e.g., "1 day ago", "10 days ago")
  const formatRelativeTime = (dateString?: string | null): string => {
    if (!dateString) return 'not set';

    const raw = String(dateString).split('T')[0];
    const parts = raw.split('-');
    if (parts.length !== 3) return 'not set';

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return 'not set';

    const startUtc = Date.UTC(y, m, d);
    const now = new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.floor((todayUtc - startUtc) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'scheduled';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;

    const months = Math.floor(diffDays / 30);
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;

    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  };

  // Salary accrual start date (from calculationDate, fallback to createdAt)
  const getSalaryStartDate = (staff: Staff): string | null => {
    const primary =
      staff.staffSalaries?.find(
        (s) => s.salaryType?.toLowerCase() !== 'advance'
      ) || staff.staffSalaries?.[0];

    return primary?.calculationDate ?? primary?.createdAt ?? null;
  };

  return (
    <div className="staff-management-page-wrapper">
      <Sidebar />
      <div className="staff-management-container">
        <Navbar />
        <div className="staff-management-card">
          <div className="staff-management-header">
            <h1 className="staff-management-title">Staff Management</h1>
            <p className="staff-management-subtitle">Manage your team members, salaries, and attendance</p>
          </div>

          <div className="staff-summary-container">
            <div className="staff-summary-card">
              <div className="summary-box due">
                <span className="summary-title">Total Due</span>
                <span className="summary-value">₹{totalDue.toLocaleString()}</span>
              </div>

              <div className="summary-box advance">
                <span className="summary-title">Total Advance</span>
                <span className="summary-value">₹{totalAdvance.toLocaleString()}</span>
              </div>
            </div>

            <div className="attendance-card">
              <div className="attendance-header">Attendance ({today})</div>

              <div className="attendance-grid">
                <div className="attendance-item">
                  <i className="bi bi-check-circle-fill attendance-icon present"></i>
                  <span>{todayAttendances["Present"] || 0}</span>
                  <small>PRESENT</small>
                </div>

                <div className="attendance-item">
                  <i className="bi bi-x-circle-fill attendance-icon absent"></i>
                  <span>{todayAttendances["Absent"] || 0}</span>
                  <small>ABSENT</small>
                </div>

                <div className="attendance-item">
                  <i className="bi bi-clock-fill attendance-icon halfday"></i>
                  <span>{todayAttendances["Half Day"] || 0}</span>
                  <small>HALF DAY</small>
                </div>

                <div className="attendance-item">
                  <i className="bi bi-calendar-x-fill attendance-icon leave"></i>
                  <span>{todayAttendances["Leave"] || 0}</span>
                  <small>LEAVE</small>
                </div>
              </div>
            </div>
          </div>

          <div className="staff-toolbar">
            <button className="toolbar-btn staff-btn">
              <i className="bi bi-people"></i>
              For Staff ({staffList.length})
            </button>

            <div className="toolbar-search">
              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                <option value="">Filter</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="full">Full Access</option>
                <option value="restricted">Restricted</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">Sort</option>
                <option value="name_asc">A-Z</option>
                <option value="name_desc">Z-A</option>
                <option value="salary_asc">Low-High</option>
                <option value="salary_desc">High-Low</option>
              </select>

              {searchQuery && (
                <button className="clear-btn" onClick={() => setSearchQuery("")}>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>

            <button className="toolbar-btn reminder-btn">
              <i className="bi bi-bell"></i>
              Reminder
            </button>

            <div className="toolbar-info">
              <div className="total-salary-highlight">
                <i className="bi bi-cash-stack"></i>
                Total Salary: Rs. {totalSalary.toLocaleString()}
              </div>

              <div>
                <i className="bi bi-calendar-check"></i>
                Total Attendance: {Object.values(todayAttendances).reduce((a, b) => a + b, 0)}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="staff-management-loading">
            <i className="bi bi-arrow-clockwise me-2"></i>
            Loading staff data...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="staff-management-empty">
            <i className="bi bi-people me-2"></i>
            {searchQuery ? 'No staff found matching your search' : 'No staff members found'}
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <div key={staff.id} className="staff-management-staff-card">
              <div className="staff-management-staff-header">
                <div
                  className="staff-management-staff-info"
                  onClick={() => navigate(`/staff/payment/${staff.id}`)}
                >
                  <div className="staff-management-image-placeholder">
                    {staff.profileImageUrl ? (
                      <img
                        src={staff.profileImageUrl}
                        alt={staff.name}
                        className="staff-management-staff-image"
                      />
                    ) : (
                      <i className="bi bi-person"></i>
                    )}
                  </div>
                  <div className="staff-management-staff-details">
                    <div className="staff-management-staff-name">{staff.name}</div>
                    <div className="staff-management-staff-contact">
                      <i className="bi bi-telephone me-1"></i>
                      {staff.phone || 'No phone'}
                    </div>
                    <div className="staff-management-staff-lastpaid">
                      <i className="bi bi-calendar-event me-1"></i>
                      Salary from {formatRelativeTime(getSalaryStartDate(staff))}
                    </div>
                  </div>
                </div>

                <div
                  className="staff-management-middle-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="staff-management-permission-btn"
                    onClick={() => handleOpenPermissionModal(staff.id)}
                  >
                    <i className="bi bi-shield-plus me-1"></i>
                    Add Permission
                  </button>
                  <select className="staff-management-attendance-dropdown">
                    <option value="">Today's Attendance</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="halfday">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>

                <div
                  className="staff-management-amount-section"
                  onClick={() => navigate(`/staff/payment/${staff.id}`)}
                >
                  <span className="staff-management-salary-type">
                    {staff.staffSalaries[0]?.salaryType || 'Salary'}:
                  </span>
                  <span className="staff-management-amount">
                    Rs.{staff.staffSalaries[0]?.amount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {isPermissionModalOpen && (
          <div className="modal-overlay" onClick={handleClosePermissionModal}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5>Manage Permissions</h5>
                <button className="modal-close-btn" onClick={handleClosePermissionModal}>
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <label className="staff-management-permission-label">Add Permission</label>
                <div className="permission-input-group">
                  <input
                    type="text"
                    value={permissionInput}
                    onChange={(e) => setPermissionInput(e.target.value)}
                    onKeyDown={handlePermissionKeyDown}
                    placeholder="Type permission and press Enter..."
                    className="staff-management-permission-field"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="permission-add-btn"
                    onClick={handleAddPermission}
                  >
                    Add
                  </button>
                </div>

                <div className="staff-management-permission-tags">
                  {activePermissions.length > 0 ? (
                    activePermissions.map((permission: string, index: number) => (
                      <div key={index} className="staff-management-permission-tag">
                        <i className="bi bi-shield-check me-1"></i>
                        {permission}
                        <span
                          className="staff-management-remove-tag"
                          onClick={() =>
                            selectedStaffId && handleRemovePermission(selectedStaffId, permission)
                          }
                        >
                          ×
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="staff-management-no-permissions">
                      <i className="bi bi-shield-x me-1"></i>
                      No permissions added yet
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="modal-secondary-btn" onClick={handleClosePermissionModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="staff-management-add-staff-button"
          onClick={() => navigate('/staff/add')}
        >
          <i className="bi bi-person-plus me-2"></i>
          Add Staff
        </button>
      </div>
    </div>
  );
};