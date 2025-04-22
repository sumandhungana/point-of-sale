import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

export const StaffManagement = () => {
  const navigate = useNavigate();
  const [permissionInput, setPermissionInput] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

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
                <td style={{ ...styles.td, ...styles.amountCell }}>₹25,000</td>
                <td style={{ ...styles.td, ...styles.amountCell }}>₹10,000</td>
                <td style={styles.td}>
                  <div style={styles.attendanceCell}>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>15</span>
                      <span style={styles.attendanceLabel}>Present</span>
                    </div>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>2</span>
                      <span style={styles.attendanceLabel}>Absent</span>
                    </div>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>1</span>
                      <span style={styles.attendanceLabel}>Home</span>
                    </div>
                    <div style={styles.attendanceItem}>
                      <span style={styles.attendanceValue}>1</span>
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
                  placeholder="Search..."
                  style={styles.searchInput}
                />
              </div>
              <button style={styles.reminderButton}>
                ⏰ Reminder
              </button>
            </div>
            <div style={styles.buttonRow}>
              <select style={styles.dropdown}>
                <option value="">Filter By</option>
                <option value="name">Name</option>
                <option value="department">Department</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div style={styles.buttonRow}>
              <select style={styles.dropdown}>
                <option value="">Sort By</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="date_asc">Date (Oldest)</option>
                <option value="date_desc">Date (Newest)</option>
              </select>
            </div>
          </div>
        
        </div>

        <div 
          style={{
            ...styles.staffCard,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/staff/payment/1')}
        >
          <div style={styles.staffHeader}>
            <div style={styles.staffInfo}>
              <div style={styles.imagePlaceholder}>👤</div>
              <div style={styles.staffDetails}>
                <div style={styles.staffName}>John Doe</div>
                <div style={styles.salaryPattern}>Monthly Salary</div>
              </div>
            </div>
            <div style={styles.amount}>₹25,000</div>
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