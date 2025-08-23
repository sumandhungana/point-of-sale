import React, { useState, useEffect } from 'react';
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
  const [permissionInput, setPermissionInput] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
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

  const handlePermissionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && permissionInput.trim()) {
      setPermissions([...permissions, permissionInput.trim()]);
      setPermissionInput('');
    }
  };

  const removePermission = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index));
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate totals from staff data
  const totalDue = staffList.reduce((sum, staff) => {
    const latestSalary = staff.staffSalaries[0];
    return sum + (latestSalary?.amount || 0);
  }, 0);

  const totalAdvance = staffList.reduce((sum, staff) => {
    const advancePayments = staff.staffSalaries.filter(s => s.salaryType === 'Advance');
    return sum + advancePayments.reduce((advanceSum, salary) => advanceSum + salary.amount, 0);
  }, 0);

  // Calculate attendance counts
  const todayAttendances = staffList.reduce((acc, staff) => {
    const todayAttendance = staff.staffAttendances.find(a => 
      new Date(a.date).toDateString() === new Date().toDateString()
    );
    if (todayAttendance) {
      acc[todayAttendance.status] = (acc[todayAttendance.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Filter and sort staff
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
          
          <table className="staff-management-table">
            <thead>
              <tr>
                <th className="staff-management-th">Total Due</th>
                <th className="staff-management-th">Total Advance</th>
                <th className="staff-management-th">Attendance Date ({today})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={`staff-management-td staff-management-amount-cell`}>₹{totalDue.toLocaleString()}</td>
                <td className={`staff-management-td staff-management-amount-cell`}>₹{totalAdvance.toLocaleString()}</td>
                <td className="staff-management-td">
                  <div className="staff-management-attendance-cell">
                    <div className="staff-management-attendance-item">
                      <i className="bi bi-check-circle-fill staff-management-attendance-icon present"></i>
                      <span className="staff-management-attendance-value">{todayAttendances['Present'] || 0}</span>
                      <span className="staff-management-attendance-label">Present</span>
                    </div>
                    <div className="staff-management-attendance-item">
                      <i className="bi bi-x-circle-fill staff-management-attendance-icon absent"></i>
                      <span className="staff-management-attendance-value">{todayAttendances['Absent'] || 0}</span>
                      <span className="staff-management-attendance-label">Absent</span>
                    </div>
                    <div className="staff-management-attendance-item">
                      <i className="bi bi-clock-fill staff-management-attendance-icon halfday"></i>
                      <span className="staff-management-attendance-value">{todayAttendances['Half Day'] || 0}</span>
                      <span className="staff-management-attendance-label">Half Day</span>
                    </div>
                    <div className="staff-management-attendance-item">
                      <i className="bi bi-calendar-x-fill staff-management-attendance-icon leave"></i>
                      <span className="staff-management-attendance-value">{todayAttendances['Leave'] || 0}</span>
                      <span className="staff-management-attendance-label">Leave</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="staff-management-action-buttons">
            <button className="staff-management-for-staff-button">
              <i className="bi bi-people"></i>
              For Staff
            </button>
            <div className="staff-management-search-bar">
              <i className="bi bi-search staff-management-search-icon"></i>
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="staff-management-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="staff-management-clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
            <select 
              className="staff-management-dropdown"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="">Filter By</option>
              <option value="monthly">Monthly Salary</option>
              <option value="daily">Daily Salary</option>
              <option value="full">Full Permission</option>
              <option value="restricted">Restricted Permission</option>
            </select>
            <select 
              className="staff-management-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="salary_asc">Salary (Low to High)</option>
              <option value="salary_desc">Salary (High to Low)</option>
            </select>
            <button className="staff-management-reminder-button">
              <i className="bi bi-clock"></i>
              Reminder
            </button>
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
          filteredStaff.map(staff => (
            <div 
              key={staff.id}
              className="staff-management-staff-card"
              onClick={() => navigate(`/staff/payment/${staff.id}`)}
            >
              <div className="staff-management-staff-header">
                <div className="staff-management-staff-info">
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
                    <div className="staff-management-salary-pattern">
                      <i className="bi bi-cash-coin me-1"></i>
                      {staff.staffSalaries[0]?.salaryType || 'No salary record'}
                    </div>
                  </div>
                </div>
                <div className="staff-management-amount-section">
                  <div className="staff-management-amount">
                    ₹{staff.staffSalaries[0]?.amount.toLocaleString() || '0'}
                  </div>
                  <div className="staff-management-amount-label">
                    {staff.staffSalaries[0]?.salaryType || 'Salary'}
                  </div>
                </div>
              </div>
              <div className="staff-management-divider" />
              <div className="staff-management-permission-section">
                <div className="staff-management-permission-input">
                  <label className="staff-management-permission-label">Add Permission</label>
                  <input
                    type="text"
                    value={permissionInput}
                    onChange={(e) => setPermissionInput(e.target.value)}
                    onKeyDown={handlePermissionKeyDown}
                    placeholder="Type to add permission and press Enter..."
                    className="staff-management-permission-field"
                  />
                  <div className="staff-management-permission-tags">
                    {permissions.map((permission, index) => (
                      <div key={index} className="staff-management-permission-tag">
                        <i className="bi bi-shield-check me-1"></i>
                        {permission}
                        <span 
                          className="staff-management-remove-tag"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePermission(index);
                          }}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                    {permissions.length === 0 && (
                      <div className="staff-management-no-permissions">
                        <i className="bi bi-shield-x me-1"></i>
                        No permissions added
                      </div>
                    )}
                  </div>
                </div>
                <select className="staff-management-attendance-dropdown">
                  <option value="">Today's Attendance</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="halfday">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>
          ))
        )}
        <div className="staff-management-button-container">
          <div className="staff-management-summary">
            <div className="staff-management-summary-item">
              <i className="bi bi-people-fill"></i>
              <span>Total Staff: {staffList.length}</span>
            </div>
            <div className="staff-management-summary-item">
              <i className="bi bi-cash-stack"></i>
              <span>Total Salary: ₹{totalDue.toLocaleString()}</span>
            </div>
            <div className="staff-management-summary-item">
              <i className="bi bi-calendar-check"></i>
              <span>Today's Attendance: {Object.values(todayAttendances).reduce((a, b) => a + b, 0)}</span>
            </div>
          </div>
          <button 
            className="staff-management-add-staff-button"
            onClick={() => navigate('/staff/add')}
          >
            <i className="bi bi-person-plus"></i>
            Add Staff
          </button>
        </div>
      </div>
    </div>
  );
}; 