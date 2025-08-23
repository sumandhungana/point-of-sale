import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { createRole } from '../services/roleService';
import '../styles/AddRole.css';

export const AddRole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createRole(formData);
      alert('Role created successfully!');
      navigate('/role');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-role-container">
        <Navbar />
        <div className="add-role-card">
          <div className="add-role-form-card">
            <h1 className="add-role-heading">
              <i className="bi bi-shield-plus"></i>
              Add Role
            </h1>
            <form className="add-role-form" onSubmit={handleSubmit}>
              <div className="add-role-row">
                <div className="add-role-input-group">
                  <label className="add-role-label">
                    <i className="bi bi-person-badge"></i>
                    Role Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="add-role-input"
                    placeholder="Enter role name"
                    required
                  />
                </div>
                <div className="add-role-input-group">
                  <label className="add-role-label">
                    <i className="bi bi-toggle-on"></i>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="add-role-select"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="manage_staff">Manage Staff</option>
                  </select>
                </div>
              </div>

              <div className="add-role-input-group">
                <label className="add-role-label">
                  <i className="bi bi-chat-text"></i>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="add-role-textarea"
                  placeholder="Enter role description"
                />
              </div>

              {error && (
                <div className="add-role-error">
                  <i className="bi bi-exclamation-triangle"></i>
                  {error}
                </div>
              )}

              <div className="add-role-button-group">
                <button 
                  type="submit" 
                  className="add-role-save-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="add-role-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Save Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 