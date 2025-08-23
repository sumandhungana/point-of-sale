import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchRoles, fetchPermissions } from '../services/permissionService';
import '../styles/Permission.css';

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
        const [rolesData, permissionsData] = await Promise.all([
          fetchRoles(),
          fetchPermissions()
        ]);
        setRoles(rolesData);
        setPermissions(permissionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="permission-container">
        <Navbar />
        <div className="permission-card">
          <div className="permission-select-container">
            <select 
              className="permission-select"
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

          {loading && (
            <div className="permission-loading-message">
              <i className="bi bi-arrow-clockwise"></i>
              Loading data...
            </div>
          )}
          {error && (
            <div className="permission-error-message">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <h2 className="permission-section-header">
            <i className="bi bi-shield-lock"></i>
            Permission Role
          </h2>

          <div className="permission-card-grid">
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <div key={module} className="permission-module-card">
                <h3 className="permission-card-header">
                  <i className="bi bi-folder"></i>
                  {module}
                </h3>
                <div className="permission-checkbox-group">
                  {modulePermissions.map((permission) => (
                    <label key={permission.id} className="permission-checkbox-label">
                      <input
                        type="checkbox"
                        className="permission-checkbox"
                        name={`${module}-${permission.permissionName}`}
                        disabled={!selectedRole}
                      />
                      <i className="bi bi-check-square"></i>
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