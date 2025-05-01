import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    const fetchStaff = async () => {
      try {
        const response = await axios.get('/api/Staff');
        setStaffList(response.data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
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
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '1.5rem',
    },
    th: {
      padding: '1rem',
      textAlign: 'left' as const,
      borderBottom: '2px solid #dee2e6',
      color: '#212529',
      fontWeight: 'bold',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
      color: '#212529',
    },
    amountCell: {
      fontWeight: 'bold',
      color: '#28a745',
    },
    attendanceCell: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      width: '100%',
    },
    attendanceItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      width: 'calc(50% - 0.5rem)',
    },
    attendanceValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    attendanceLabel: {
      fontSize: '0.875rem',
      color: '#6c757d',
    },
    actionButtons: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginTop: '1.5rem',
    },
    buttonRow: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    forStaffButton: {
      padding: '0.5rem 1rem',
      background: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      padding: '0.5rem',
      background: 'white',
      width: '100%',
      maxWidth: '300px',
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      flex: 1,
      padding: '0.25rem',
    },
    searchIcon: {
      color: '#6c757d',
      marginRight: '0.5rem',
    },
    dropdown: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      minWidth: '150px',
    },
    buttonIcon: {
      fontSize: '1.2rem',
      marginLeft: '0.5rem',
    },
    reminderButton: {
      padding: '0.5rem 1rem',
      background: '#ffc107',
      color: '#212529',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    staffCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      marginTop: '1.5rem',
    },
    staffHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    staffInfo: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    imagePlaceholder: {
      width: '60px',
      height: '60px',
      background: '#e9ecef',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
    },
    staffDetails: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    staffName: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    salaryPattern: {
      color: '#6c757d',
      fontSize: '0.875rem',
    },
    amount: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#28a745',
    },
    divider: {
      borderBottom: '1px solid #dee2e6',
      margin: '1rem 0',
    },
    permissionSection: {
      marginTop: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: '1rem',
    },
    permissionInput: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      flex: 1,
    },
    permissionLabel: {
      fontSize: '0.875rem',
      color: '#6c757d',
      fontWeight: 'bold',
    },
    permissionTags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    permissionTag: {
      background: '#e9ecef',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: '#212529',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    removeTag: {
      cursor: 'pointer',
      color: '#dc3545',
      fontSize: '1rem',
    },
    permissionField: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      width: '200px',
    },
    attendanceDropdown: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      background: 'white',
      minWidth: '150px',
      marginLeft: 'auto',
    },
    addStaffButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
       
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Total Due</th>
                <th style={styles.th}>Total Advance</th>
                <th style={styles.th}>Attendance Date ({today})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.amountCell }}>रु{totalDue.toLocaleString()}</td>
                <td style={{ ...styles.td, ...styles.amountCell }}>रु{totalAdvance.toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={styles.attendanceCell}>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>{todayAttendances['Present'] || 0}</span>
                      <span style={styles.attendanceLabel}>Present</span>
                    </div>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>{todayAttendances['Absent'] || 0}</span>
                      <span style={styles.attendanceLabel}>Absent</span>
                    </div>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>{todayAttendances['Half Day'] || 0}</span>
                      <span style={styles.attendanceLabel}>Half Day</span>
                    </div>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>{todayAttendances['Leave'] || 0}</span>
                      <span style={styles.attendanceLabel}>Leave</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div style={styles.actionButtons}>
            <div style={styles.buttonRow}>
              <button style={styles.forStaffButton}>
                👥 For Staff
              </button>
            </div>
            <div style={styles.buttonRow}>
              <div style={styles.searchBar}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button style={styles.reminderButton}>
                ⏰ Reminder
              </button>
            </div>
            <div style={styles.buttonRow}>
              <select 
                style={styles.dropdown}
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="">Filter By</option>
                <option value="monthly">Monthly Salary</option>
                <option value="daily">Daily Salary</option>
                <option value="full">Full Permission</option>
                <option value="restricted">Restricted Permission</option>
              </select>
            </div>
            <div style={styles.buttonRow}>
              <select 
                style={styles.dropdown}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="salary_asc">Salary (Low to High)</option>
                <option value="salary_desc">Salary (High to Low)</option>
              </select>
            </div>
          </div>
        
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading staff data...</div>
        ) : (
          filteredStaff.map(staff => (
            <div 
              key={staff.id}
              style={{
                ...styles.staffCard,
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/staff/payment/${staff.id}`)}
            >
              <div style={styles.staffHeader}>
                <div style={styles.staffInfo}>
                  <div style={styles.imagePlaceholder}>
                    {staff.profileImageUrl ? (
                      <img 
                        src={staff.profileImageUrl} 
                        alt={staff.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                      />
                    ) : '👤'}
                  </div>
                  <div style={styles.staffDetails}>
                    <div style={styles.staffName}>{staff.name}</div>
                    <div style={styles.salaryPattern}>
                      {staff.staffSalaries[0]?.salaryType || 'No salary record'}
                    </div>
                  </div>
                </div>
                <div style={styles.amount}>
                  रु{staff.staffSalaries[0]?.amount.toLocaleString() || '0'}
                </div>
              </div>
              <div style={styles.divider} />
              <div style={styles.permissionSection}>
                <div style={styles.permissionInput}>
                  <label style={styles.permissionLabel}>Add Permission</label>
                  <input
                    type="text"
                    value={permissionInput}
                    onChange={(e) => setPermissionInput(e.target.value)}
                    onKeyDown={handlePermissionKeyDown}
                    placeholder="Type to add permission and press Enter..."
                    style={styles.permissionField}
                  />
                  <div style={styles.permissionTags}>
                    {permissions.map((permission, index) => (
                      <div key={index} style={styles.permissionTag}>
                        {permission}
                        <span 
                          style={styles.removeTag}
                          onClick={(e) => {
                            e.stopPropagation();
                            removePermission(index);
                          }}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <select style={styles.attendanceDropdown}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button 
            style={styles.addStaffButton}
            onClick={() => navigate('/staff/add')}
          >
            👥 Add Staff
          </button>
        </div>
      </div>
    </div>
  );
}; 