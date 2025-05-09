import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface Permission {
  id: number;
  module: string;
  permissionName: string;
}

interface Role {
  id: number;
  name: string;
  status: string;
  description: string;
}

export const Permission = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          fetch('/api/Role'),
          fetch('/api/Permission')
        ]);

        if (!rolesResponse.ok || !permissionsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const rolesData = await rolesResponse.json();
        const permissionsData = await permissionsResponse.json();

        setRoles(rolesData);
        setPermissions(permissionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    selectContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
    },
    select: {
      padding: '0.75rem',
      width: '300px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '0.5rem',
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1rem',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '0.5rem',
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      color: '#495057',
    },
    errorMessage: {
      color: 'red',
      textAlign: 'center' as const,
      marginBottom: '1rem',
    },
    loadingMessage: {
      textAlign: 'center' as const,
      marginBottom: '1rem',
      color: '#495057',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '40px', 
        marginLeft: '50px',
        
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.selectContainer}>
            <select 
              style={styles.select}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {loading && <div style={styles.loadingMessage}>Loading data...</div>}
          {error && <div style={styles.errorMessage}>{error}</div>}

          <h2 style={styles.sectionHeader}>Permission Role</h2>

          <div style={styles.cardGrid}>
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <div key={module} style={styles.card}>
                <h3 style={styles.cardHeader}>{module}</h3>
                <div style={styles.checkboxGroup}>
                  {modulePermissions.map((permission) => (
                    <label key={permission.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name={`${module}-${permission.permissionName}`}
                        disabled={!selectedRole}
                      />
                      {permission.permissionName}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 