import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const AddSMS = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partnerName: '',
    active: false,
    form: '',
    token: '',
    apiUrl: '',
    testSms: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTest = () => {
    console.log('Testing SMS...');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/SmsGateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200 || response.status === 201) {
        alert('SMS Gateway created successfully!');
        navigate('/sms');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create SMS Gateway');
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
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '1rem',
    },
    testButton: {
      padding: '0.75rem 1.5rem',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    testRow: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-end',
    },
    testInputGroup: {
      flex: 2,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    testButtonContainer: {
      flex: 1,
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
            <h1 style={styles.heading}>Add SMS Gateway</h1>
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>SMS Partner Name</label>
                  <input
                    type="text"
                    name="partnerName"
                    value={formData.partnerName}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>&nbsp;</label>
                  <div style={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      id="active"
                    />
                    <label htmlFor="active" style={styles.label}>Active</label>
                  </div>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Form</label>
                  <input
                    type="text"
                    name="form"
                    value={formData.form}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Token</label>
                  <input
                    type="text"
                    name="token"
                    value={formData.token}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>SMS API URL</label>
                <input
                  type="url"
                  name="apiUrl"
                  value={formData.apiUrl}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.testRow}>
                <div style={styles.testInputGroup}>
                  <label style={styles.label}>Test SMS</label>
                  <input
                    type="text"
                    name="testSms"
                    value={formData.testSms}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter test message"
                  />
                </div>
                <div style={styles.testButtonContainer}>
                  <button 
                    type="button" 
                    style={styles.testButton}
                    onClick={handleTest}
                  >
                    Test
                  </button>
                </div>
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