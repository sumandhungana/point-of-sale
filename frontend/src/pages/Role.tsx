import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchRoles } from '../services/roleService';
import '../styles/Role.css';

interface Role {
  id: number;
  name: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions: any[];
}

export const Role = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRolesList = async () => {
      try {
        const data = await fetchRoles();
        setRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchRolesList();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'role-status-active';
      case 'manage_staff':
        return 'role-status-manage-staff';
      default:
        return 'role-status-inactive';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Inactive';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="role-container">
          <Navbar />
          <div className="role-loading-message">
            <i className="bi bi-arrow-clockwise"></i>
            Loading roles...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="role-container">
          <Navbar />
          <div className="role-error-message">
            <i className="bi bi-exclamation-triangle"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="role-container">
        <Navbar />
        <div className="role-card">
          <div className="role-header">
            <input
              type="text"
              placeholder="Search role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="role-search-bar"
            />
          </div>

          <div className="role-divider" />

          <h2 className="role-section-header">
            <i className="bi bi-shield-check"></i>
            Role List
          </h2>

          {filteredRoles.map((role) => (
            <div key={role.id} className="role-item-card">
              <div className="role-name">
                <i className="bi bi-person-badge"></i>
                {role.name}
              </div>
              <div className={`role-status ${getStatusClass(role.status)}`}>
                {formatStatus(role.status)}
              </div>
              <div className="role-description">
                {role.description || 'No description available'}
              </div>
            </div>
          ))}

          <div className="role-button-container">
            <button 
              className="role-add-button"
              onClick={() => navigate('/add-role')}
            >
              <i className="bi bi-plus-circle"></i>
              Add Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 