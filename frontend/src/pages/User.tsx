import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../services/userService';
import '../styles/User.css';

interface User {
  id: number;
  username: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  branch: string;
  permission: string;
  enable: boolean;
  parent: string;
  address: string;
  pan: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export const User = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [reseller, setReseller] = useState('');
  const [branch, setBranch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchUsersData();
  }, []);

  const handleUserClick = (user: User) => {
    navigate('/add-user', { 
      state: { 
        isEdit: true,
        initialValues: {
          id: user.id,
          username: user.username,
          name: user.name,
          company: user.company,
          email: user.email,
          phone: user.phone,
          branch: user.branch,
          permission: user.permission,
          enable: user.enable,
          parent: user.parent,
          address: user.address,
          pan: user.pan,
          remarks: user.remarks
        }
      }
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="user-container">
          <Navbar />
          <div className="user-loading-message">
            <i className="bi bi-arrow-clockwise"></i>
            Loading users...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="user-container">
          <Navbar />
          <div className="user-error-message">
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
      <div className="user-container">
        <Navbar />
        <div className="user-card">
          <div className="user-search-container">
            <div className="user-left-section">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="user-search-field"
              />
              <div className="user-dropdown-row">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="user-dropdown"
                >
                  <option value="">Filter</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="user-dropdown"
                >
                  <option value="">Sort</option>
                  <option value="name">Name</option>
                  <option value="company">Company</option>
                  <option value="branch">Branch</option>
                </select>
              </div>
            </div>
            <div className="user-right-section">
              <div className="user-dropdown-row">
                <select
                  value={reseller}
                  onChange={(e) => setReseller(e.target.value)}
                  className="user-dropdown"
                >
                  <option value="">Reseller</option>
                  <option value="parent1">Parent 1</option>
                  <option value="parent2">Parent 2</option>
                </select>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="user-dropdown"
                >
                  <option value="">Branch</option>
                  <option value="branch1">Branch 1</option>
                  <option value="branch2">Branch 2</option>
                </select>
              </div>
              <button className="user-reminder-button">
                <i className="bi bi-bell"></i>
                Reminder
              </button>
            </div>
          </div>

          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th className="user-table-header">
                    <i className="bi bi-person"></i>
                    Name
                  </th>
                  <th className="user-table-header">
                    <i className="bi bi-building"></i>
                    Company
                  </th>
                  <th className="user-table-header">
                    <i className="bi bi-envelope"></i>
                    Email
                  </th>
                  <th className="user-table-header">
                    <i className="bi bi-telephone"></i>
                    Phone
                  </th>
                  <th className="user-table-header">
                    <i className="bi bi-geo-alt"></i>
                    Branch
                  </th>
                  <th className="user-table-header">
                    <i className="bi bi-shield-check"></i>
                    Permission
                  </th>
                  <th className="user-table-header">
                    <i className="bi bi-circle-fill"></i>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="user-table-row"
                  >
                    <td className="user-table-cell">{user.name}</td>
                    <td className="user-table-cell">{user.company}</td>
                    <td className="user-table-cell">{user.email}</td>
                    <td className="user-table-cell">{user.phone}</td>
                    <td className="user-table-cell">{user.branch}</td>
                    <td className="user-table-cell">{user.permission}</td>
                    <td className="user-status-cell">
                      <span className={`user-status-badge ${user.enable ? 'user-status-active' : 'user-status-inactive'}`}>
                        {user.enable ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="user-add-button-container">
            <button 
              className="user-add-button"
              onClick={() => navigate('/add-user')}
            >
              <i className="bi bi-plus-circle"></i>
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 