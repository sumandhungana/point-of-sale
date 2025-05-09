import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch('/api/Role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200 || response.status === 201) {
        alert('Role created successfully!');
        navigate('/role');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create role');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '2rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    row: {
      display: 'flex',
      gap: '2rem',
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
    textarea: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      minHeight: '100px',
      resize: 'vertical' as const,
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
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
          <div style={styles.card}>
            <h1 style={styles.heading}>Add Role</h1>
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Role Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={styles.select}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="manage_staff">Manage Staff</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Enter role description"
                />
              </div>

              {error && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <div style={styles.buttonGroup}>
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
    </div>
  );
}; 