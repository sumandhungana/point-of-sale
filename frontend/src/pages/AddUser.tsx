import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUser, updateUser } from '../services/userService';
import '../styles/AddUser.css';

interface LocationState {
  isEdit: boolean;
  initialValues: {
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
  };
}

export const AddUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const isEdit = locationState?.isEdit || false;
  const initialValues = locationState?.initialValues;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: initialValues?.id || 0,
    username: initialValues?.username || '',
    enable: initialValues?.enable || false,
    password: '',
    branch: initialValues?.branch || '',
    permission: initialValues?.permission || '',
    parent: initialValues?.parent || '',
    name: initialValues?.name || '',
    address: initialValues?.address || '',
    company: initialValues?.company || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    pan: initialValues?.pan || '',
    remarks: initialValues?.remarks || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        formData.id = initialValues?.id;
        await updateUser(initialValues?.id, formData);
        alert('User updated successfully!');
      } else {
        await createUser(formData);
        alert('User created successfully!');
      }
      navigate('/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEdit ? 'Failed to update user' : 'User already exists'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-user-container">
        <Navbar />
        <div className="add-user-card">
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="add-user-section">
              <h2 className="add-user-section-header">
                <i className="bi bi-person-badge"></i>
                Basic Information
              </h2>
              <div className="add-user-form-card">
                <div className="add-user-row">
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-person"></i>
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-toggle-on"></i>
                      Enable
                    </label>
                    <div className="add-user-slider-container">
                      <div 
                        className={`add-user-slider ${formData.enable ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, enable: !prev.enable }))}
                      >
                        <div className={`add-user-slider-circle ${formData.enable ? 'active' : ''}`} />
                      </div>
                      <span className="add-user-slider-text">{formData.enable ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                <div className="add-user-row">
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-key"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-geo-alt"></i>
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="add-user-select"
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="branch1">Branch 1</option>
                      <option value="branch2">Branch 2</option>
                    </select>
                  </div>
                </div>

                <div className="add-user-row">
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-shield-check"></i>
                      Permission
                    </label>
                    <select
                      name="permission"
                      value={formData.permission}
                      onChange={handleInputChange}
                      className="add-user-select"
                      required
                    >
                      <option value="">Select Permission</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-diagram-3"></i>
                      Parent
                    </label>
                    <select
                      name="parent"
                      value={formData.parent}
                      onChange={handleInputChange}
                      className="add-user-select"
                      required
                    >
                      <option value="">Select Parent</option>
                      <option value="parent1">Parent 1</option>
                      <option value="parent2">Parent 2</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="add-user-section">
              <h2 className="add-user-section-header">
                <i className="bi bi-person-lines-fill"></i>
                Personal Information
              </h2>
              <div className="add-user-form-card">
                <div className="add-user-row">
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-person"></i>
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-geo-alt"></i>
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter address"
                      required
                    />
                  </div>
                </div>

                <div className="add-user-row">
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-building"></i>
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-envelope"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </div>

                <div className="add-user-row">
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-telephone"></i>
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-card-text"></i>
                      PAN
                    </label>
                    <input
                      type="text"
                      name="pan"
                      value={formData.pan}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter PAN number"
                      required
                    />
                  </div>
                </div>

                <div className="add-user-row">
                  <div className="add-user-input-group" style={{ flex: 2 }}>
                    <label className="add-user-label">
                      <i className="bi bi-chat-text"></i>
                      Remarks
                    </label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className="add-user-input"
                      placeholder="Enter remarks"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="add-user-error">
                <i className="bi bi-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div className="add-user-save-button-container">
              <button 
                type="submit" 
                className="add-user-save-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="add-user-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    {isEdit ? 'Update' : 'Save'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 