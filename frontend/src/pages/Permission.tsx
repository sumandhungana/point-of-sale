import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchRoles } from '@/services/permissionService';
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

  // State to track selected permission IDs
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

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

  // Reset or load existing permissions when role selection changes
  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    if (!roleId) {
      setSelectedPermissions([]);
      return;
    }
    // Fetch or map current permissions for selected role here if available
  };

  // Toggle single permission selection
  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
        prev.includes(permissionId)
            ? prev.filter((id) => id !== permissionId)
            : [...prev, permissionId]
    );
  };

  // Select / Deselect all permissions within a module
  const handleSelectAllModule = (modulePermissions: Permission[]) => {
    const moduleIds = modulePermissions.map((p) => p.id);
    const isAllSelected = moduleIds.every((id) => selectedPermissions.includes(id));

    if (isAllSelected) {
      // Remove all module IDs from selection
      setSelectedPermissions((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      // Add missing module IDs to selection
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...moduleIds])));
    }
  };

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
                  onChange={(e) => handleRoleChange(e.target.value)}
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
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                const moduleIds = modulePermissions.map((p) => p.id);
                const isAllModuleSelected = moduleIds.every((id) =>
                    selectedPermissions.includes(id)
                );

                return (
                    <div key={module} className="permission-module-card">
                      <div className="permission-card-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="permission-card-header">
                          <i className="bi bi-folder"></i>
                          {module}
                        </h3>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => handleSelectAllModule(modulePermissions)}
                            disabled={!selectedRole}
                            style={{ fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isAllModuleSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="permission-checkbox-group">
                        {modulePermissions.map((permission) => {
                          const isChecked = selectedPermissions.includes(permission.id);
                          return (
                              <label key={permission.id} className="permission-checkbox-label">
                                <input
                                    type="checkbox"
                                    className="permission-checkbox"
                                    checked={isChecked}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                    disabled={!selectedRole}
                                />
                                <i className={`bi ${isChecked ? 'bi-check-square-fill' : 'bi-square'}`}></i>
                                {permission.permissionName}
                              </label>
                          );
                        })}
                      </div>
                    </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
};