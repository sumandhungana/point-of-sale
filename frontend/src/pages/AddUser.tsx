import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    enable: false,
    password: '',
    branch: '',
    permission: '',
    parent: '',
    name: '',
    address: '',
    company: '',
    email: '',
    phone: '',
    pan: '',
    remarks: '',
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
      const response = await fetch('/api/User', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200 || response.status === 201) {
        alert('User created successfully!');
        navigate('/user');
      } else {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create user');
        } catch (error) {
          throw new Error('User already exists');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    row: {
      display: 'flex',
      gap: '2rem',
      marginBottom: '1rem',
    },
    inputGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      color: '#495057',
      fontWeight: '500',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
    },
    sliderContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    slider: {
      width: '50px',
      height: '24px',
      backgroundColor: '#dee2e6',
      borderRadius: '12px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    sliderCircle: {
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: '2px',
      transition: 'transform 0.2s',
    },
    sliderActive: {
      backgroundColor: '#28a745',
    },
    sliderCircleActive: {
      transform: 'translateX(26px)',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      alignSelf: 'flex-end',
    },
    saveButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1rem',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: '300px',
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionHeader}>Basic Information</h2>
              <div style={styles.card}>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Enable</label>
                    <div style={styles.sliderContainer}>
                      <div 
                        style={{
                          ...styles.slider,
                          ...(formData.enable ? styles.sliderActive : {})
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, enable: !prev.enable }))}
                      >
                        <div 
                          style={{
                            ...styles.sliderCircle,
                            ...(formData.enable ? styles.sliderCircleActive : {})
                          }}
                        />
                      </div>
                      <span>{formData.enable ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Branch</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="branch1">Branch 1</option>
                      <option value="branch2">Branch 2</option>
                    </select>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Permission</label>
                    <select
                      name="permission"
                      value={formData.permission}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Select Permission</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Parent</label>
                    <select
                      name="parent"
                      value={formData.parent}
                      onChange={handleInputChange}
                      style={styles.select}
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
            <div style={styles.section}>
              <h2 style={styles.sectionHeader}>Personal Information</h2>
              <div style={styles.card}>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter address"
                      required
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>PAN</label>
                    <input
                      type="text"
                      name="pan"
                      value={formData.pan}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter PAN number"
                      required
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={{...styles.inputGroup, flex: 2}}>
                    <label style={styles.label}>Remarks</label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter remarks"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: 'red', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={styles.saveButtonContainer}>
              <button 
                type="submit" 
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 