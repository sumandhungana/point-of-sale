import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { fetchStaff } from '@/features/services/staffService';
import {
  fetchStaffAttendances,
  recordStaffAttendance,
  StaffAttendanceRecord,
  AttendanceStatusType
} from '@/features/services/staffAttendanceService';
import { toast } from 'react-toastify';
import { usePermission } from '@/core/rbac/usePermission';
import '../styles/StaffManagement.css';

export interface StaffSalary {
  id: number;
  staffId?: number;
  memberId?: number;
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

export interface StaffAttendance {
  id: number;
  staffId?: number;
  memberId?: number;
  date: string;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  remarks: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  // Support both backend field names and frontend fallback names
  // Backend response keys
  salaryResponses?: StaffSalary[];
  // salaryResponse?: StaffSalary;
  // staffSalaryEntities?: StaffSalary[];
  staffAttendanceEntities?: StaffAttendance[];
  // staffSalaries?: StaffSalary[];
  // staffAttendances?: StaffAttendance[];
}

export const StaffManagement = () => {
  const navigate = useNavigate();
  const { hasModule, hasPermission } = usePermission();
  const canCreateStaff = hasPermission('staffManagement:create');
  const canViewAttendance = hasModule('staffAttendance') || hasPermission('staffAttendance:list') || hasPermission('staffManagement:list');
  const canMarkAttendance = hasPermission('staffAttendance:create') || hasPermission('staffAttendance:update') || hasPermission('staffManagement:update') || hasPermission('staffManagement:create');

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Helper getters to safely retrieve nested arrays regardless of property name
  const getSalaries = (staff: Staff): StaffSalary[] => {
    if (Array.isArray(staff.salaryResponses)) {
      return staff.salaryResponses;
    }
    return [];
  };

  const getAttendances = (staff: Staff): StaffAttendance[] => {
    return (staff as any).attendanceResponses || staff.staffAttendanceEntities || [];
  };

  const loadData = async () => {
    try {
      const [staffData, attendances] = await Promise.all([
        fetchStaff(),
        canViewAttendance ? fetchStaffAttendances().catch(() => []) : Promise.resolve([]),
      ]);
      setStaffList(staffData || []);
      setAttendanceRecords(attendances || []);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTodayStatusForStaff = (staffId: number): AttendanceStatusType | '' => {
    const todayStr = new Date().toDateString();
    // 1. Check in attendanceRecords fetched from backend
    const record = attendanceRecords.find(
      (a) => a.staffId === staffId && a.date && new Date(a.date).toDateString() === todayStr
    );
    if (record?.status) {
      return record.status.toUpperCase() as AttendanceStatusType;
    }

    // 2. Fallback to nested staff attendance responses
    const staff = staffList.find((s) => s.id === staffId);
    if (staff) {
      const attendances = getAttendances(staff);
      const match = attendances.find((a: any) => {
        const d = a.attendanceDate || a.date;
        return d && new Date(d).toDateString() === todayStr;
      });
      if (match?.status) {
        return match.status.toUpperCase() as AttendanceStatusType;
      }
    }
    return '';
  };

  const handleAttendanceChange = async (staffId: number, staffName: string, newStatus: string) => {
    if (!newStatus) return;
    const statusType = newStatus.toUpperCase() as AttendanceStatusType;

    // Optimistically update local records state
    setAttendanceRecords((prev) => {
      const todayStr = new Date().toDateString();
      const filtered = prev.filter(
        (a) => !(a.staffId === staffId && a.date && new Date(a.date).toDateString() === todayStr)
      );
      return [
        {
          id: Date.now(),
          staffId,
          date: new Date().toISOString(),
          status: statusType,
          createdAt: new Date().toISOString(),
        },
        ...filtered,
      ];
    });

    const success = await recordStaffAttendance({
      staffId,
      status: statusType,
      date: new Date().toISOString(),
    });

    if (success) {
      toast.success(`${staffName} marked as ${statusType.replace('_', ' ')}!`, {
        position: 'top-right',
        autoClose: 2500,
      });
      // Refresh attendances in background
      fetchStaffAttendances().then(setAttendanceRecords);
    } else {
      toast.error(`Failed to record attendance for ${staffName}`);
    }
  };

  const totalSalary = staffList.reduce((sum, staff) => {
    const salaries = getSalaries(staff);
    const salary = salaries[0];
    return sum + (salary?.amount || 0);
  }, 0);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalAdvance = staffList.reduce((sum, staff) => {
    const salaries = getSalaries(staff);
    const advancePayments = salaries.filter(s => s?.salaryType?.toLowerCase() === 'advance');
    return sum + advancePayments.reduce((advanceSum, salary) => advanceSum + (salary?.amount || 0), 0);
  }, 0);

  const todayAttendances = staffList.reduce((acc, staff) => {
    const status = getTodayStatusForStaff(staff.id);
    if (status) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredStaff = staffList
      .filter(staff => {
        if (!searchQuery) return true;
        return (
            staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.phone?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'name_desc':
            return (b.name || '').localeCompare(a.name || '');
          case 'date_asc':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'date_desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });

  const calculateAccruedSalary = (staff: Staff): number => {
    const salaries = getSalaries(staff);
    const salary = salaries.find(
        (s) => s?.salaryType?.toLowerCase() !== 'advance'
    ) || salaries[0];

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
    const salaries = getSalaries(staff);
    const primary =
        salaries.find(
            (s) => s?.salaryType?.toLowerCase() !== 'advance'
        ) || salaries[0];

    return primary?.calculationDate ?? primary?.createdAt ?? null;
  };

  return (
      <div className="staff-management-page-wrapper">
        <Sidebar />
        <div className="staff-management-container">
          <div className="staff-management-card">
            <div className="staff-summary-container">
              <div className="staff-summary-card">
                <div className="summary-box due">
                  <span className="summary-title">Total Due</span>
                  <span className="summary-value">Rs.{totalDue.toLocaleString()}</span>
                </div>

                <div className="summary-box advance">
                  <span className="summary-title">Total Advance</span>
                  <span className="summary-value">Rs.{totalAdvance.toLocaleString()}</span>
                </div>
              </div>

              {canViewAttendance && (
                <div className="attendance-card">
                  <div className="attendance-header">Attendance ({today})</div>

                  <div className="attendance-grid">
                    <div className="attendance-item">
                      <i className="bi bi-check-circle-fill attendance-icon present"></i>
                      <span>{todayAttendances["PRESENT"] || todayAttendances["Present"] || 0}</span>
                      <small>PRESENT</small>
                    </div>

                    <div className="attendance-item">
                      <i className="bi bi-x-circle-fill attendance-icon absent"></i>
                      <span>{todayAttendances["ABSENT"] || todayAttendances["Absent"] || 0}</span>
                      <small>ABSENT</small>
                    </div>

                    <div className="attendance-item">
                      <i className="bi bi-clock-fill attendance-icon halfday"></i>
                      <span>{todayAttendances["HALF_DAY"] || todayAttendances["Half Day"] || 0}</span>
                      <small>HALF DAY</small>
                    </div>

                    <div className="attendance-item">
                      <i className="bi bi-calendar-x-fill attendance-icon leave"></i>
                      <span>{todayAttendances["LEAVE"] || todayAttendances["Leave"] || 0}</span>
                      <small>LEAVE</small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="staff-toolbar">
              <button className="toolbar-btn staff-btn">
                <i className="bi bi-people"></i>
                For Staff ({staffList.length})
              </button>

              <div className="toolbar-search">
                <div className="toolbar-search-input-wrap">
                  <i className="bi bi-search"></i>
                  <input
                      type="text"
                      placeholder="Search name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                      <button className="clear-btn" onClick={() => setSearchQuery("")}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                  )}
                </div>

                <div className="toolbar-search-selects-wrap">
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
                </div>
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
              filteredStaff.map((staff) => {
                const salaries = getSalaries(staff);
                const primarySalary = salaries[0];

                return (
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
                            {(() => {
                              const todayStatus = getTodayStatusForStaff(staff.id);
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <div className="staff-management-staff-name">{staff.name}</div>
                                  {todayStatus && (
                                    <span
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background:
                                          todayStatus === 'PRESENT' ? '#dcfce7' :
                                          todayStatus === 'ABSENT' ? '#fee2e2' :
                                          todayStatus === 'HALF_DAY' ? '#fef3c7' : '#f3e8ff',
                                        color:
                                          todayStatus === 'PRESENT' ? '#166534' :
                                          todayStatus === 'ABSENT' ? '#991b1b' :
                                          todayStatus === 'HALF_DAY' ? '#92400e' : '#6b21a8',
                                        border: `1px solid ${
                                          todayStatus === 'PRESENT' ? '#86efac' :
                                          todayStatus === 'ABSENT' ? '#fca5a5' :
                                          todayStatus === 'HALF_DAY' ? '#fde047' : '#d8b4fe'
                                        }`
                                      }}
                                    >
                                      <i className="bi bi-circle-fill" style={{ fontSize: '5px' }}></i>
                                      {todayStatus === 'HALF_DAY' ? 'Half Day' : todayStatus === 'PRESENT' ? 'Present' : todayStatus === 'ABSENT' ? 'Absent' : 'Leave'}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                            <div className="staff-management-staff-contact">
                              <i className="bi bi-telephone me-1"></i>
                              {staff.phone || 'No phone'}
                            </div>
                            <div className="staff-management-staff-lastpaid">
                              <i className="bi bi-calendar-event me-1"></i>
                              Salary from {formatRelativeTime(getSalaryStartDate(staff))}
                            </div>
                            {staff.remarks && (
                              <div
                                className="staff-management-staff-notes"
                                title={staff.remarks}
                                style={{
                                  marginTop: '4px',
                                  fontSize: '0.78rem',
                                  color: '#334155',
                                  background: 'rgba(13, 110, 253, 0.08)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  maxWidth: '320px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <i className="bi bi-journal-text" style={{ color: '#0d6efd' }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  Note: {staff.remarks}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {canViewAttendance && (
                          <div
                              className="staff-management-middle-actions"
                              onClick={(e) => e.stopPropagation()}
                          >
                            {(() => {
                              const todayStatus = getTodayStatusForStaff(staff.id);
                              return canMarkAttendance ? (
                                <select
                                  className="staff-management-attendance-dropdown"
                                  value={todayStatus}
                                  onChange={(e) => handleAttendanceChange(staff.id, staff.name, e.target.value)}
                                  title="Mark today's attendance"
                                >
                                  <option value="">Today's Attendance</option>
                                  <option value="PRESENT">✓ Present</option>
                                  <option value="ABSENT">✗ Absent</option>
                                  <option value="HALF_DAY">◷ Half Day</option>
                                  <option value="LEAVE">✈ Leave</option>
                                </select>
                              ) : (
                                <span
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    background: todayStatus === 'PRESENT' ? '#dcfce7' : todayStatus === 'ABSENT' ? '#fee2e2' : todayStatus === 'HALF_DAY' ? '#fef3c7' : '#f1f5f9',
                                    color: todayStatus === 'PRESENT' ? '#166534' : todayStatus === 'ABSENT' ? '#991b1b' : todayStatus === 'HALF_DAY' ? '#92400e' : '#64748b',
                                  }}
                                >
                                  {todayStatus ? `✓ ${todayStatus.replace('_', ' ')}` : 'No Attendance'}
                                </span>
                              );
                            })()}
                          </div>
                        )}

                        <div
                            className="staff-management-amount-section"
                            onClick={() => navigate(`/staff/payment/${staff.id}`)}
                        >
                    <span className="staff-management-salary-type">
                      {primarySalary?.salaryType || 'Salary'}:
                    </span>
                          <span className="staff-management-amount">
                      Rs.{primarySalary?.amount?.toLocaleString() || '0'}
                    </span>
                        </div>
                      </div>
                    </div>
                );
              })
          )}

          {canCreateStaff && (
            <button
                type="button"
                className="staff-management-add-staff-button"
                onClick={() => navigate('/staff/add')}
            >
              <i className="bi bi-person-plus me-2"></i>
              Add Staff
            </button>
          )}
        </div>
      </div>
  );
};