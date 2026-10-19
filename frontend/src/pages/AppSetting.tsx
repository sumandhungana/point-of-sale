import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAppSettings } from '../context/AppSettingsContext';
import { usePermission } from '@/core/rbac/usePermission';
import { AppSettings, defaultAppSettings } from '../features/services/appSettingService';
import { toast } from 'react-toastify';
import '../styles/AppSetting.css';

export const AppSetting: React.FC = () => {
  const { settings, saveSettings, resetSettings, loading: contextLoading } = useAppSettings();
  const { hasPermission, isSuperAdmin } = usePermission();

  const canUpdate = isSuperAdmin || hasPermission('appSettings:update');
  const canReset = isSuperAdmin || hasPermission('appSettings:reset');

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AppSettings>(settings);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const loginBgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoPath' | 'faviconPath' | 'loginBgPath'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        [field]: result,
      }));
      toast.success(`${field.replace('Path', '')} uploaded for preview`);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: 'logoPath' | 'faviconPath' | 'loginBgPath') => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) {
      toast.error('You do not have permission to modify App Settings');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveSettings(formData);
      toast.success('App settings saved and applied successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      const errMsg = err instanceof Error ? err.message : 'An error occurred while saving settings';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!canReset) {
      toast.error('You do not have permission to reset App Settings');
      return;
    }

    if (!window.confirm('Are you sure you want to reset all App Settings to system defaults?')) {
      return;
    }

    setResetting(true);
    setError(null);

    try {
      const resetData = await resetSettings();
      setFormData(resetData);
      toast.success('App settings reset to defaults successfully!');
    } catch (err) {
      console.error('Error resetting settings:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="app-setting-container">
        <Sidebar />
        <div className="app-setting-main">
          {/* Header */}
          <div className="app-setting-header-wrap" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                  <i className="bi bi-sliders2 me-2 text-primary"></i>
                  App Settings
                </h1>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  Customize application branding, themes, currency display, and regional formatting.
                </p>
              </div>

              {canReset && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                  disabled={resetting || saving || contextLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                >
                  <i className={`bi bi-arrow-counterclockwise ${resetting ? 'spin' : ''}`}></i>
                  {resetting ? 'Resetting...' : 'Reset to Defaults'}
                </button>
              )}
            </div>
          </div>

          {!canUpdate && (
            <div
              className="alert alert-warning d-flex align-items-center mb-4"
              role="alert"
              style={{ borderRadius: '8px', border: '1px solid #fef3c7', background: '#fffbeb', color: '#92400e' }}
            >
              <i className="bi bi-shield-lock-fill me-2 fs-5"></i>
              <div>
                <strong>Read-Only Access:</strong> You can view the current settings, but modifying them requires administrator privileges.
              </div>
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger d-flex align-items-center mb-4"
              role="alert"
              style={{ borderRadius: '8px' }}
            >
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Side Menu Style */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-layout-sidebar-inset me-2 text-primary"></i>
                Side Menu Style
              </h2>

              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette me-1"></i>
                    Side Menu Gradient Start
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuBgColor"
                      value={formData.sideMenuBgColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuBgColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuBgColor"
                      value={formData.sideMenuBgColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-input"
                    />
                  </div>
                </div>

                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette-fill me-1"></i>
                    Side Menu Gradient End
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuBgEndColor"
                      value={formData.sideMenuBgEndColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuBgEndColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuBgEndColor"
                      value={formData.sideMenuBgEndColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
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
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuFontColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuFontColor"
                      value={formData.sideMenuFontColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
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
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuHoverFontColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuHoverFontColor"
                      value={formData.sideMenuHoverFontColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>

              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-highlight me-1"></i>
                    Side Menu Hover Background
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="sideMenuHoverBgColor"
                      value={formData.sideMenuHoverBgColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.sideMenuHoverBgColor }}
                    />
                    <input
                      type="text"
                      name="sideMenuHoverBgColor"
                      value={formData.sideMenuHoverBgColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Top Menu Bar Style */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-window-dock me-2 text-primary"></i>
                Top Navbar Style
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
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.topMenuBgColor }}
                    />
                    <input
                      type="text"
                      name="topMenuBgColor"
                      value={formData.topMenuBgColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
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
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.topMenuFontColor }}
                    />
                    <input
                      type="text"
                      name="topMenuFontColor"
                      value={formData.topMenuFontColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: App Workspace Style */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-layout-text-window me-2 text-primary"></i>
                App Workspace Style
              </h2>
              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-palette me-1"></i>
                    Workspace Background Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="appBgColor"
                      value={formData.appBgColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.appBgColor }}
                    />
                    <input
                      type="text"
                      name="appBgColor"
                      value={formData.appBgColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-input"
                    />
                  </div>
                </div>

                <div className="app-setting-form-group">
                  <label className="app-setting-label color">
                    <i className="bi bi-type me-1"></i>
                    Workspace Foreground Color
                  </label>
                  <div className="app-setting-color-input">
                    <input
                      type="color"
                      name="appForegroundColor"
                      value={formData.appForegroundColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-color-preview"
                      style={{ backgroundColor: formData.appForegroundColor }}
                    />
                    <input
                      type="text"
                      name="appForegroundColor"
                      value={formData.appForegroundColor}
                      onChange={handleInputChange}
                      disabled={!canUpdate}
                      className="app-setting-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Branding Images */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-images me-2 text-primary"></i>
                Branding & Assets
              </h2>

              {/* Logo Card */}
              <div className="app-setting-image-card" style={{ marginBottom: '1.25rem' }}>
                <div className="app-setting-image-preview">
                  {formData.logoPath ? (
                    <img
                      src={formData.logoPath}
                      alt="Logo preview"
                      style={{ maxHeight: '60px', maxWidth: '160px', objectFit: 'contain' }}
                    />
                  ) : (
                    <>
                      <i className="bi bi-image me-2 text-muted"></i>
                      <span>Default System Logo</span>
                    </>
                  )}
                </div>
                <div className="app-setting-image-upload">
                  <label className="app-setting-label image">
                    <i className="bi bi-shield-shaded me-1"></i>
                    Brand Logo
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="app-setting-upload-button"
                      disabled={!canUpdate}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <i className="bi bi-upload me-1"></i>
                      Choose File
                    </button>
                    {formData.logoPath && canUpdate && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveImage('logoPath')}
                        title="Remove custom logo"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e, 'logoPath')}
                  />
                </div>
              </div>

              {/* Favicon Card */}
              <div className="app-setting-image-card" style={{ marginBottom: '1.25rem' }}>
                <div className="app-setting-image-preview">
                  {formData.faviconPath ? (
                    <img
                      src={formData.faviconPath}
                      alt="Favicon preview"
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                    />
                  ) : (
                    <>
                      <i className="bi bi-star me-2 text-muted"></i>
                      <span>Default Favicon</span>
                    </>
                  )}
                </div>
                <div className="app-setting-image-upload">
                  <label className="app-setting-label image">
                    <i className="bi bi-star-fill me-1"></i>
                    Browser Favicon
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="app-setting-upload-button"
                      disabled={!canUpdate}
                      onClick={() => faviconInputRef.current?.click()}
                    >
                      <i className="bi bi-upload me-1"></i>
                      Choose File
                    </button>
                    {formData.faviconPath && canUpdate && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveImage('faviconPath')}
                        title="Remove custom favicon"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*,.ico"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e, 'faviconPath')}
                  />
                </div>
              </div>

              {/* Login Background Card */}
              <div className="app-setting-image-card">
                <div className="app-setting-image-preview">
                  {formData.loginBgPath ? (
                    <img
                      src={formData.loginBgPath}
                      alt="Login background preview"
                      style={{ maxHeight: '60px', maxWidth: '160px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <>
                      <i className="bi bi-window me-2 text-muted"></i>
                      <span>Default Login Screen Graphic</span>
                    </>
                  )}
                </div>
                <div className="app-setting-image-upload">
                  <label className="app-setting-label image">
                    <i className="bi bi-card-image me-1"></i>
                    Login Background Image
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="app-setting-upload-button"
                      disabled={!canUpdate}
                      onClick={() => loginBgInputRef.current?.click()}
                    >
                      <i className="bi bi-upload me-1"></i>
                      Choose File
                    </button>
                    {formData.loginBgPath && canUpdate && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveImage('loginBgPath')}
                        title="Remove custom login background"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                  <input
                    ref={loginBgInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e, 'loginBgPath')}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: General & Regional Settings */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-gear-wide-connected me-2 text-primary"></i>
                General & Regional Settings
              </h2>

              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-currency-exchange me-1"></i>
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    disabled={!canUpdate}
                    className="app-setting-input"
                    placeholder="Enter currency symbol (e.g. रु, $, €)"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-arrow-left-right me-1"></i>
                    Currency Position
                  </label>
                  <select
                    name="currencyPosition"
                    value={formData.currencyPosition}
                    onChange={handleInputChange}
                    disabled={!canUpdate}
                    className="app-setting-input"
                  >
                    <option value="before">Before Amount (e.g. रु 1,234.56)</option>
                    <option value="after">After Amount (e.g. 1,234.56 रु)</option>
                  </select>
                </div>
              </div>

              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-calendar3 me-1"></i>
                    Date Format
                  </label>
                  <select
                    name="dateFormat"
                    value={formData.dateFormat}
                    onChange={handleInputChange}
                    disabled={!canUpdate}
                    className="app-setting-input"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 16/10/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/16/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-16)</option>
                  </select>
                </div>

                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-clock-history me-1"></i>
                    Time Format
                  </label>
                  <select
                    name="timeFormat"
                    value={formData.timeFormat}
                    onChange={handleInputChange}
                    disabled={!canUpdate}
                    className="app-setting-input"
                  >
                    <option value="HH:mm">24 Hour (e.g. 14:30)</option>
                    <option value="hh:mm A">12 Hour (e.g. 02:30 PM)</option>
                  </select>
                </div>
              </div>

              <div className="app-setting-form-row">
                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-123 me-1"></i>
                    Number Separator Format
                  </label>
                  <select
                    name="numberFormat"
                    value={formData.numberFormat}
                    onChange={handleInputChange}
                    disabled={!canUpdate}
                    className="app-setting-input"
                  >
                    <option value="1,234.56">Standard (1,234.56)</option>
                    <option value="1.234,56">European (1.234,56)</option>
                    <option value="1234.56">Plain (1234.56)</option>
                  </select>
                </div>

                <div className="app-setting-form-group">
                  <label className="app-setting-label general">
                    <i className="bi bi-translate me-1"></i>
                    System Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    disabled={!canUpdate}
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

            {/* Live Preview Section */}
            <div className="app-setting-section">
              <h2 className="app-setting-section-title">
                <i className="bi bi-eye-fill me-2 text-primary"></i>
                Live Theme & Currency Preview
              </h2>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Sidebar Preview */}
                <div
                  style={{
                    width: '220px',
                    minHeight: '170px',
                    background: `linear-gradient(180deg, ${formData.sideMenuBgColor} 0%, ${formData.sideMenuBgEndColor} 100%)`,
                    borderRadius: '8px',
                    padding: '1rem',
                    color: formData.sideMenuFontColor,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {formData.logoPath ? (
                      <img src={formData.logoPath} alt="Preview logo" style={{ height: '20px', objectFit: 'contain' }} />
                    ) : (
                      <i className="bi bi-grid-fill"></i>
                    )}
                    <span>Sidebar Preview</span>
                  </div>

                  <div
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      background: formData.sideMenuHoverBgColor,
                      color: formData.sideMenuHoverFontColor,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <i className="bi bi-bar-chart-fill"></i>
                    <span>Dashboard (Hover)</span>
                  </div>

                  <div
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: formData.sideMenuFontColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <i className="bi bi-people-fill"></i>
                    <span>Parties (Normal)</span>
                  </div>
                </div>

                {/* Top Menu Preview */}
                <div
                  style={{
                    width: '220px',
                    minHeight: '170px',
                    background: formData.topMenuBgColor,
                    borderRadius: '8px',
                    padding: '1rem',
                    color: formData.topMenuFontColor,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Top Menu Preview
                    </div>
                    <div
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        background: 'rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Search & Profile</span>
                      <i className="bi bi-bell-fill"></i>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    Navbar text matches selection
                  </div>
                </div>

                {/* Financial Display Preview */}
                <div
                  style={{
                    width: '220px',
                    minHeight: '170px',
                    background: formData.appBgColor,
                    color: formData.appForegroundColor,
                    borderRadius: '8px',
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Financial Format
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', marginBottom: '0.25rem' }}>
                      {formData.currencyPosition === 'after'
                        ? `1,234.56 ${formData.currency}`
                        : `${formData.currency} 1,234.56`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Date: {formData.dateFormat === 'MM/DD/YYYY' ? '10/16/2026' : formData.dateFormat === 'YYYY-MM-DD' ? '2026-10-16' : '16/10/2026'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Time: {formData.timeFormat === 'hh:mm A' ? '02:30 PM' : '14:30'}
                    </div>
                  </div>

                  <span className="badge bg-success" style={{ alignSelf: 'flex-start', fontSize: '0.65rem' }}>
                    Active Format
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {canUpdate && (
              <div className="app-setting-button-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="app-setting-save-button"
                  disabled={saving || resetting || contextLoading}
                >
                  {saving ? (
                    <>
                      <i className="bi bi-arrow-clockwise spin me-2"></i>
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Save App Settings
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};