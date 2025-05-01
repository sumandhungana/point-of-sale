import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export const AppSetting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    // Side menu style
    sideMenuBgColor: '#343a40',
    sideMenuBgEndColor: '#212529',
    sideMenuFontColor: '#ffffff',
    sideMenuHoverFontColor: '#ffffff',
    sideMenuHoverBgColor: '#495057',
    
    // Top menu style
    topMenuBgColor: '#ffffff',
    topMenuFontColor: '#212529',
    
    // App content style
    appBgColor: '#f8f9fa',
    appForegroundColor: '#212529',
    
    // General settings
    currency: '₹',
    currencyPosition: 'before',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    language: 'English',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/AppSettings');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const firstSetting = data[0];
            setSettingsId(firstSetting.id);
            setFormData(prev => ({
              ...prev,
              ...firstSetting
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const url = settingsId 
        ? `/api/AppSettings/${settingsId}`
        : '/api/AppSettings';
      
      const method = settingsId ? 'PUT' : 'POST';
      const body = settingsId 
        ? { ...formData, id: settingsId }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
        if (!settingsId) {
          const data = await response.json();
          setSettingsId(data.id);
        }
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving settings');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    main: {
      marginLeft: '280px',
      flex: 1,
      padding: '2rem',
      paddingTop: '80px',
    },
    section: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      color: '#212529',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '0.5rem',
    },
    formRow: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    formGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#495057',
    },
    input: {
      padding: '0.75rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '1rem',
      outline: 'none',
      '&:focus': {
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    colorInput: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    colorPreview: {
      width: '30px',
      height: '30px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
    },
    imageCard: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    imagePreview: {
      width: '120px',
      height: '120px',
      background: '#e9ecef',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
      fontSize: '0.875rem',
    },
    imageUpload: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    uploadButton: {
      padding: '0.5rem 1rem',
      background: '#e9ecef',
      color: '#495057',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    buttonContainer: {
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
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <form onSubmit={handleSubmit}>
            {/* Section 1: Side Menu Style */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Side Menu Style</h2>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Side Menu Background Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="sideMenuBgColor"
                      value={formData.sideMenuBgColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="sideMenuBgColor"
                      value={formData.sideMenuBgColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Side Menu Background End Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="sideMenuBgEndColor"
                      value={formData.sideMenuBgEndColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="sideMenuBgEndColor"
                      value={formData.sideMenuBgEndColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Side Menu Font Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="sideMenuFontColor"
                      value={formData.sideMenuFontColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="sideMenuFontColor"
                      value={formData.sideMenuFontColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Side Menu Hover Font Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="sideMenuHoverFontColor"
                      value={formData.sideMenuHoverFontColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="sideMenuHoverFontColor"
                      value={formData.sideMenuHoverFontColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Side Menu Hover Background Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="sideMenuHoverBgColor"
                      value={formData.sideMenuHoverBgColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="sideMenuHoverBgColor"
                      value={formData.sideMenuHoverBgColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Top Menu Bar Style */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Top Menu Bar Style</h2>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Top Menu Background Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="topMenuBgColor"
                      value={formData.topMenuBgColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="topMenuBgColor"
                      value={formData.topMenuBgColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Top Menu Font Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="topMenuFontColor"
                      value={formData.topMenuFontColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="topMenuFontColor"
                      value={formData.topMenuFontColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: App Content Style */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>App Content Style</h2>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Background Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="appBgColor"
                      value={formData.appBgColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="appBgColor"
                      value={formData.appBgColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Foreground Color</label>
                  <div style={styles.colorInput}>
                    <input
                      type="color"
                      name="appForegroundColor"
                      value={formData.appForegroundColor}
                      onChange={handleInputChange}
                      style={styles.colorPreview}
                    />
                    <input
                      type="text"
                      name="appForegroundColor"
                      value={formData.appForegroundColor}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: App Images */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>App Images</h2>
              
              {/* Logo */}
              <div style={styles.imageCard}>
                <div style={styles.imagePreview}>
                  Logo Preview
                </div>
                <div style={styles.imageUpload}>
                  <label style={styles.label}>Logo</label>
                  <button type="button" style={styles.uploadButton}>
                    📁 Choose File
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              {/* Favicon */}
              <div style={styles.imageCard}>
                <div style={styles.imagePreview}>
                  Favicon Preview
                </div>
                <div style={styles.imageUpload}>
                  <label style={styles.label}>Favicon</label>
                  <button type="button" style={styles.uploadButton}>
                    📁 Choose File
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              {/* Login Background Image */}
              <div style={styles.imageCard}>
                <div style={styles.imagePreview}>
                  Login Background
                </div>
                <div style={styles.imageUpload}>
                  <label style={styles.label}>Login Background Image</label>
                  <button type="button" style={styles.uploadButton}>
                    📁 Choose File
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: General Settings */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>General Settings</h2>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter currency symbol"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Currency Position</label>
                  <select
                    name="currencyPosition"
                    value={formData.currencyPosition}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date Format</label>
                  <select
                    name="dateFormat"
                    value={formData.dateFormat}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Time Format</label>
                  <select
                    name="timeFormat"
                    value={formData.timeFormat}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="HH:mm">24 Hour (HH:mm)</option>
                    <option value="hh:mm A">12 Hour (hh:mm AM/PM)</option>
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Number Format</label>
                  <select
                    name="numberFormat"
                    value={formData.numberFormat}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="1,234.56">1,234.56</option>
                    <option value="1.234,56">1.234,56</option>
                    <option value="1234.56">1234.56</option>
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={styles.buttonContainer}>
              <button 
                type="submit" 
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Saving...' : '💾 Save'}
              </button>
            </div>

            {error && (
              <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}; 