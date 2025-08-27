import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchAppSettings, saveAppSettings } from '../services/appSettingService';
import { useAppSettings } from '../context/AppSettingsContext';
import '../styles/AppSetting.css';

export const AppSetting = () => {
  const navigate = useNavigate();
  const { settings, refreshSettings } = useAppSettings();
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
    currency: 'रु',
    currencyPosition: 'before',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    language: 'English',
  });

  useEffect(() => {
    // Initialize form data with current settings
    setFormData(prev => ({
      ...prev,
      ...settings
    }));
    if (settings.id) {
      setSettingsId(settings.id);
    }
  }, [settings]);

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
      console.log('Saving app settings...', { settingsId, formData });
      await saveAppSettings(settingsId, formData);
      console.log('Settings saved successfully!');
      
      // Refresh settings in context to apply changes immediately
      await refreshSettings();
      
      alert('Settings saved successfully!');
      if (!settingsId) {
        const data = await fetchAppSettings();
        if (data && data.length > 0) {
          setSettingsId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="app-setting-container">
        <Sidebar />
        <div className="app-setting-main">
          {error && (
            <div className="app-setting-error" style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #f5c6cb'
            }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}
          

          <form onSubmit={handleSubmit}>
            {/* Section 1: Side Menu Style */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-list me-2"></i>
                Side Menu Style
              </h2>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette me-1"></i>
                    Side Menu Background Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuBgColor"
                      value={formData.sideMenuBgColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuBgColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuBgColor"
                      value={formData.sideMenuBgColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette me-1"></i>
                    Side Menu Background End Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuBgEndColor"
                      value={formData.sideMenuBgEndColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuBgEndColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuBgEndColor"
                      value={formData.sideMenuBgEndColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-type me-1"></i>
                    Side Menu Font Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuFontColor"
                      value={formData.sideMenuFontColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuFontColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuFontColor"
                      value={formData.sideMenuFontColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-type-bold me-1"></i>
                    Side Menu Hover Font Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuHoverFontColor"
                      value={formData.sideMenuHoverFontColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuHoverFontColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuHoverFontColor"
                      value={formData.sideMenuHoverFontColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette me-1"></i>
                    Side Menu Hover Background Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuHoverBgColor"
                      value={formData.sideMenuHoverBgColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuHoverBgColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuHoverBgColor"
                      value={formData.sideMenuHoverBgColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Top Menu Bar Style */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-window me-2"></i>
                Top Menu Bar Style
              </h2>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette me-1"></i>
                    Top Menu Background Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="topMenuBgColor"
                      value={formData.topMenuBgColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.topMenuBgColor }}
                    />
                    <input
                      type="text"
                      name="topMenuBgColor"
                      value={formData.topMenuBgColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-type me-1"></i>
                    Top Menu Font Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="topMenuFontColor"
                      value={formData.topMenuFontColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.topMenuFontColor }}
                    />
                    <input
                      type="text"
                      name="topMenuFontColor"
                      value={formData.topMenuFontColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: App Content Style */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-layout-text-window me-2"></i>
                App Content Style
              </h2>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette me-1"></i>
                    Background Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="appBgColor"
                      value={formData.appBgColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.appBgColor }}
                    />
                    <input
                      type="text"
                      name="appBgColor"
                      value={formData.appBgColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-type me-1"></i>
                    Foreground Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="appForegroundColor"
                      value={formData.appForegroundColor}
                      onChange={handleInputChange}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.appForegroundColor }}
                    />
                    <input
                      type="text"
                      name="appForegroundColor"
                      value={formData.appForegroundColor}
                      onChange={handleInputChange}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: App Images */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-images me-2"></i>
                App Images
              </h2>
              
              {/* Logo */}
              <div className="app-setting-image-card">
                <div className="app-setting-image-preview">
                  <i className="bi bi-image me-2"></i>
                  Logo Preview
                </div>
                <div className="app-setting-image-upload">
                  <label className="app-setting-label image">
                    <i className="bi bi-image me-1"></i>
                    Logo
                  </label>
                  <button type="button" className="app-setting-upload-button">
                    <i className="bi bi-folder me-1"></i>
                    Choose File
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              {/* Favicon */}
              <div className="app-setting-image-card">
                <div className="app-setting-image-preview">
                  <i className="bi bi-star me-2"></i>
                  Favicon Preview
                </div>
                <div className="app-setting-image-upload">
                  <label className="app-setting-label image">
                    <i className="bi bi-star me-1"></i>
                    Favicon
                  </label>
                  <button type="button" className="app-setting-upload-button">
                    <i className="bi bi-folder me-1"></i>
                    Choose File
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              {/* Login Background Image */}
              <div className="app-setting-image-card">
                <div className="app-setting-image-preview">
                  <i className="bi bi-window me-2"></i>
                  Login Background
                </div>
                <div className="app-setting-image-upload">
                  <label className="app-setting-label image">
                    <i className="bi bi-window me-1"></i>
                    Login Background Image
                  </label>
                  <button type="button" className="app-setting-upload-button">
                    <i className="bi bi-folder me-1"></i>
                    Choose File
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
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-gear me-2"></i>
                General Settings
              </h2>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-currency-dollar me-1"></i>
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="app-setting-input"
                    placeholder="Enter currency symbol"
                  />
                </div>
              </div>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-arrow-left-right me-1"></i>
                    Currency Position
                  </label>
                  <select
                    name="currencyPosition"
                    value={formData.currencyPosition}
                    onChange={handleInputChange}
                    className="app-setting-input"
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>
              </div>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-calendar me-1"></i>
                    Date Format
                  </label>
                  <select
                    name="dateFormat"
                    value={formData.dateFormat}
                    onChange={handleInputChange}
                    className="app-setting-input"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-clock me-1"></i>
                    Time Format
                  </label>
                  <select
                    name="timeFormat"
                    value={formData.timeFormat}
                    onChange={handleInputChange}
                    className="app-setting-input"
                  >
                    <option value="HH:mm">24 Hour (HH:mm)</option>
                    <option value="hh:mm A">12 Hour (hh:mm AM/PM)</option>
                  </select>
                </div>
              </div>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-123 me-1"></i>
                    Number Format
                  </label>
                  <select
                    name="numberFormat"
                    value={formData.numberFormat}
                    onChange={handleInputChange}
                    className="app-setting-input"
                  >
                    <option value="1,234.56">1,234.56</option>
                    <option value="1.234,56">1.234,56</option>
                    <option value="1234.56">1234.56</option>
                  </select>
                </div>
              </div>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-translate me-1"></i>
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="app-setting-input"
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

            {/* Preview Section */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-eye me-2"></i>
                Live Preview
              </h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Sidebar Preview */}
                <div style={{
                  width: '200px',
                  height: '150px',
                  background: `linear-gradient(180deg, ${formData.sideMenuBgColor} 0%, ${formData.sideMenuBgEndColor} 100%)`,
                  borderRadius: '8px',
                  padding: '1rem',
                  color: formData.sideMenuFontColor,
                  border: '2px solid #e9ecef',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Sidebar Preview</div>
                  <div style={{
                    padding: '0.5rem',
                    margin: '0.25rem 0',
                    borderRadius: '4px',
                    background: formData.sideMenuHoverBgColor,
                    color: formData.sideMenuHoverFontColor,
                    fontSize: '0.7rem'
                  }}>
                    Menu Item (Hover)
                  </div>
                  <div style={{
                    padding: '0.5rem',
                    margin: '0.25rem 0',
                    borderRadius: '4px',
                    fontSize: '0.7rem'
                  }}>
                    Menu Item (Normal)
                  </div>
                </div>
                
                {/* Top Menu Preview */}
                <div style={{
                  width: '200px',
                  height: '150px',
                  background: formData.topMenuBgColor,
                  borderRadius: '8px',
                  padding: '1rem',
                  color: formData.topMenuFontColor,
                  border: '2px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Top Menu Preview</div>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    background: 'rgba(0,0,0,0.05)'
                  }}>
                    Menu Content
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="app-setting-button-container">
              <button 
                type="submit" 
                className="app-setting-save-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-clockwise spin me-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Save
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="app-setting-error">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}; 