import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Sidebar,
} from '../components/Sidebar';

import Navbar from '../components/Navbar';

import {
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  createUser,
  updateUser,
} from '../services/userService';

import '../styles/AddUser.css';

// ============================================================
// IMAGE URL HELPER
// ============================================================

const API_BASE_URL = 'http://localhost:5000';

const resolveImageUrl = (path?: string | null): string => {
  if (!path) {
    return '';
  }

  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// ============================================================
// LOCATION STATE
// ============================================================

interface LocationState {
  isEdit?: boolean;
  initialValues?: {
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
    imagePath?: string;
    // Subscription fields
    subscriptionType?: 'None' | 'Trial' | 'Monthly' | 'Yearly';
    subscriptionStartDate?: string | null;
    subscriptionEndDate?: string | null;
    isSubscriptionActive?: boolean;
    hasUsedTrial?: boolean;
    trialStartDate?: string | null;
    trialEndDate?: string | null;
    subscriptionStatus?: 'None' | 'Active' | 'Expired' | 'Cancelled' | 'Trial';
    remainingDays?: number;
  };
}

// ============================================================
// FORM DATA
// ============================================================

interface UserFormData {
  id: number;
  username: string;
  enable: boolean;
  password: string;
  branch: string;
  permission: string;
  parent: string;
  name: string;
  address: string;
  company: string;
  email: string;
  phone: string;
  pan: string;
  remarks: string;
  imagePath: string;
  subscriptionType: string;
}

// ============================================================
// COMPONENT
// ============================================================

export const AddUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const isEdit = locationState?.isEdit === true;
  const initialValues = locationState?.initialValues;

  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Subscription state
  const [subscriptionType, setSubscriptionType] = useState<string>(
    initialValues?.subscriptionType || 'None'
  );
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(
    initialValues?.subscriptionType !== 'None' && initialValues?.subscriptionType !== undefined
  );

  // ==========================================================
  // IMAGE PREVIEW
  // ==========================================================

  const getInitialImagePreview = () => {
    if (isEdit && initialValues?.imagePath) {
      const resolved = resolveImageUrl(initialValues.imagePath);
      console.log('📸 Initial image path:', initialValues.imagePath);
      console.log('📸 Resolved image URL:', resolved);
      return resolved;
    }
    return '';
  };

  const [imagePreview, setImagePreview] = useState<string>(
    getInitialImagePreview()
  );

  useEffect(() => {
    if (isEdit && initialValues?.imagePath) {
      const resolved = resolveImageUrl(initialValues.imagePath);
      console.log('📸 Updating image preview to:', resolved);
      setImagePreview(resolved);
      setImageLoadError(false);
      setImageLoading(true);
    }
  }, [isEdit, initialValues]);

  // ==========================================================
  // ACTUAL IMAGE FILE
  // ==========================================================

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // ==========================================================
  // FILE INPUT
  // ==========================================================

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] = useState<UserFormData>({
    id: initialValues?.id ?? 0,
    username: initialValues?.username ?? '',
    enable: initialValues?.enable ?? true,
    password: '',
    branch: initialValues?.branch ?? '',
    permission: initialValues?.permission ?? '',
    parent: initialValues?.parent ?? '',
    name: initialValues?.name ?? '',
    address: initialValues?.address ?? '',
    company: initialValues?.company ?? '',
    email: initialValues?.email ?? '',
    phone: initialValues?.phone ?? '',
    pan: initialValues?.pan ?? '',
    remarks: initialValues?.remarks ?? '',
    imagePath: initialValues?.imagePath ?? '',
    subscriptionType: initialValues?.subscriptionType || 'None',
  });

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // SUBSCRIPTION HANDLERS
  // ==========================================================

  const handleSubscriptionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSubscriptionType(value);
    setShowSubscriptionDetails(value !== 'None');
    
    setFormData((prev) => ({
      ...prev,
      subscriptionType: value,
    }));
  };

  // ==========================================================
  // IMAGE CHANGE
  // ==========================================================

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setError(null);
    setImageLoadError(false);
    setImageLoading(false);
    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ==========================================================
  // IMAGE LOAD ERROR
  // ==========================================================

  const handleImageError = () => {
    console.error('❌ Failed to load image from URL:', imagePreview);
    setImageLoadError(true);
    setImageLoading(false);
    
    if (imagePreview && !imagePreview.startsWith('blob:') && !imagePreview.startsWith('data:')) {
      const alternativePath = imagePreview.replace('/uploads/', '/');
      if (alternativePath !== imagePreview) {
        console.log('🔄 Trying alternative path:', alternativePath);
        setImagePreview(alternativePath);
        setTimeout(() => {
          setImageLoadError(false);
          setImageLoading(true);
        }, 100);
        return;
      }
    }
    
    setImagePreview('');
  };

  // ==========================================================
  // IMAGE LOAD SUCCESS
  // ==========================================================

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', imagePreview);
    setImageLoadError(false);
    setImageLoading(false);
  };

  // ==========================================================
  // OPEN IMAGE SELECTOR
  // ==========================================================

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // ==========================================================
  // BUILD FORM DATA
  // ==========================================================

  const buildFormData = (): FormData => {
    const data = new FormData();

    // Basic Information
    data.append('Username', formData.username);
    data.append('Enable', String(formData.enable));
    data.append('Branch', formData.branch);
    data.append('Permission', formData.permission);
    data.append('Parent', formData.parent);

    // Personal Information
    data.append('Name', formData.name);
    data.append('Address', formData.address);
    data.append('Company', formData.company);
    data.append('Email', formData.email);
    data.append('Phone', formData.phone);
    data.append('Pan', formData.pan);
    data.append('Remarks', formData.remarks);

    // Password
    if (!isEdit || formData.password.trim() !== '') {
      data.append('Password', formData.password);
    }

    // Image
    if (selectedImage) {
      data.append('Image', selectedImage);
    }

    // ======================================================
    // SUBSCRIPTION DATA
    // ======================================================

    // Only send subscription if it's not 'None'
    if (subscriptionType !== 'None') {
      data.append('SubscriptionType', subscriptionType);
    }

    return data;
  };

  // ==========================================================
  // GET SUBSCRIPTION DETAILS DISPLAY
  // ==========================================================

  const getSubscriptionDetails = () => {
    if (!initialValues) return null;

    const details = [];
    
    // Subscription Type
    if (initialValues.subscriptionType && initialValues.subscriptionType !== 'None') {
      details.push({
        label: 'Type',
        value: initialValues.subscriptionType,
        icon: 'bi bi-tag'
      });
    }
    
    // Subscription Status
    if (initialValues.subscriptionStatus && initialValues.subscriptionStatus !== 'None') {
      const statusColors: Record<string, string> = {
        'Active': '#28a745',
        'Expired': '#dc3545',
        'Trial': '#ffc107',
        'Cancelled': '#6c757d'
      };
      details.push({
        label: 'Status',
        value: initialValues.subscriptionStatus,
        color: statusColors[initialValues.subscriptionStatus] || '#6c757d',
        icon: 'bi bi-circle-fill'
      });
    }
    
    // Start Date
    if (initialValues.subscriptionStartDate) {
      const date = new Date(initialValues.subscriptionStartDate);
      details.push({
        label: 'Started',
        value: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        icon: 'bi bi-calendar-plus'
      });
    }
    
    // End Date
    if (initialValues.subscriptionEndDate) {
      const date = new Date(initialValues.subscriptionEndDate);
      const isExpired = new Date() > new Date(initialValues.subscriptionEndDate);
      details.push({
        label: isExpired ? 'Expired' : 'Ends',
        value: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        icon: isExpired ? 'bi bi-calendar-x' : 'bi bi-calendar-check',
        color: isExpired ? '#dc3545' : '#28a745'
      });
    }
    
    // Remaining Days
    if (initialValues.remainingDays !== undefined && initialValues.remainingDays > 0) {
      details.push({
        label: 'Remaining',
        value: `${initialValues.remainingDays} days`,
        icon: 'bi bi-clock',
        color: initialValues.remainingDays < 5 ? '#dc3545' : '#28a745'
      });
    } else if (initialValues.remainingDays !== undefined && initialValues.remainingDays <= 0 && initialValues.isSubscriptionActive) {
      details.push({
        label: 'Status',
        value: 'Expired',
        icon: 'bi bi-exclamation-triangle',
        color: '#dc3545'
      });
    }

    // Active Status
    if (initialValues.isSubscriptionActive !== undefined) {
      details.push({
        label: 'Active',
        value: initialValues.isSubscriptionActive ? 'Yes ✅' : 'No ❌',
        icon: initialValues.isSubscriptionActive ? 'bi bi-check-circle' : 'bi bi-x-circle',
        color: initialValues.isSubscriptionActive ? '#28a745' : '#dc3545'
      });
    }

    // Trial Used
    if (initialValues.hasUsedTrial) {
      details.push({
        label: 'Trial',
        value: 'Used',
        icon: 'bi bi-check-circle',
        color: '#ffc107'
      });
    }

    return details.length > 0 ? details : null;
  };

  const subscriptionDetails = getSubscriptionDetails();

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setToast(null);

    try {
      // ======================================================
      // CREATE USER
      // ======================================================

      if (!isEdit) {
        const multipartData = buildFormData();

        console.log('Creating user');
        console.log('Username:', formData.username);
        console.log('Selected image:', selectedImage);
        console.log('Subscription Type:', subscriptionType);

        await createUser(multipartData);

        setToast({
          message: `User created successfully with ${subscriptionType !== 'None' ? subscriptionType : 'no'} subscription!`,
          type: 'success',
        });

        setTimeout(() => {
          navigate('/user');
        }, 1500);

        return;
      }

      // ======================================================
      // UPDATE USER
      // ======================================================

      if (initialValues?.id) {
        const multipartData = buildFormData();

        console.log('Updating user:', initialValues.id);
        console.log('Selected image:', selectedImage);
        console.log('Subscription Type:', subscriptionType);

        await updateUser(initialValues.id, multipartData);

        setToast({
          message: `User updated successfully with ${subscriptionType !== 'None' ? subscriptionType : 'no'} subscription!`,
          type: 'success',
        });

        setTimeout(() => {
          // navigate('/user');
        }, 1500);

        return;
      }
    } catch (err) {
      console.error('User save error:', err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : isEdit
          ? 'Failed to update user'
          : 'Failed to create user';

      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // JSX
  // ==========================================================

  return (
    <div className="add-user-page">
      <Sidebar />

      <div className="add-user-container">
        <Navbar />

        <div className="add-user-card">
          <button
            type="button"
            className="add-user-back-button"
            onClick={() => navigate('/user')}
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>

          <form onSubmit={handleSubmit}>
            {/* =================================================
                USER IMAGE
            ================================================= */}

            <div className="add-user-image-section">
              <div
                className={`add-user-image-wrapper ${
                  imagePreview && !imageLoadError ? 'has-image' : ''
                }`}
                onClick={handleImageButtonClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleImageButtonClick();
                  }
                }}
              >
                {imageLoading && (
                  <div className="add-user-image-loading">
                    <div className="add-user-spinner"></div>
                  </div>
                )}
                
                {imagePreview && !imageLoadError ? (
                  <img
                    src={imagePreview}
                    alt="User"
                    className="add-user-image-preview"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <div className="add-user-image-placeholder">
                    <i className="bi bi-person"></i>
                  </div>
                )}

                <div className="add-user-image-overlay">
                  <div className="add-user-image-upload-content">
                    <i
                      className={
                        imagePreview
                          ? 'bi bi-camera-fill'
                          : 'bi bi-cloud-arrow-up-fill'
                      }
                    ></i>
                    <span>
                      {imagePreview ? 'Change Picture' : 'Upload Image'}
                    </span>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handleImageChange}
                className="add-user-hidden-file-input"
              />
            </div>

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

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
                        className={`add-user-slider ${
                          formData.enable ? 'active' : ''
                        }`}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            enable: !prev.enable,
                          }));
                        }}
                      >
                        <div
                          className={`add-user-slider-circle ${
                            formData.enable ? 'active' : ''
                          }`}
                        />
                      </div>
                      <span className="add-user-slider-text">
                        {formData.enable ? 'Enabled' : 'Disabled'}
                      </span>
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
                      placeholder={
                        isEdit ? 'Enter new password' : 'Enter password'
                      }
                      required={!isEdit}
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

          
            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

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
                  <div
                    className="add-user-input-group"
                    style={{ flex: 2 }}
                  >
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
                    />
                  </div>
                </div>
              </div>
              
            </div>
              {/* =================================================
                SUBSCRIPTION INFORMATION
            ================================================= */}

            <div className="add-user-section">
              <h2 className="add-user-section-header">
                <i className="bi bi-trophy"></i>
                Subscription
              </h2>

              <div className="add-user-form-card">
                <div className="add-user-row">
                  <div className="add-user-input-group">
                    <label className="add-user-label">
                      <i className="bi bi-tag"></i>
                      Subscription Type
                    </label>
                    <select
                      name="subscriptionType"
                      value={subscriptionType}
                      onChange={handleSubscriptionTypeChange}
                      className="add-user-select"
                    >
                      <option value="None">No Subscription</option>
                      <option value="Trial">15 Days Trial</option>
                      <option value="Monthly">Monthly (30 Days)</option>
                      <option value="Yearly">Yearly (365 Days)</option>
                    </select>
                  </div>
                </div>

                {/* Current Subscription Details - Only shown in Edit Mode */}
                {isEdit && subscriptionDetails && subscriptionDetails.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <label className="add-user-label" style={{ marginBottom: '8px' }}>
                      <i className="bi bi-info-circle"></i>
                      Current Subscription Details
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}>
                      {subscriptionDetails.map((detail, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef',
                          }}
                        >
                          <i 
                            className={detail.icon} 
                            style={{ 
                              color: detail.color || '#6c757d',
                              fontSize: '14px'
                            }}
                          ></i>
                          <span style={{ fontWeight: '500', color: '#6c757d', fontSize: '12px' }}>
                            {detail.label}:
                          </span>
                          <span style={{ 
                            fontWeight: '600', 
                            color: detail.color || '#212529',
                            fontSize: '13px'
                          }}>
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscription Info Message */}
                {showSubscriptionDetails && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: '#e8f4fd',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3498db',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-info-circle" style={{ color: '#3498db' }}></i>
                      <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                        {subscriptionType === 'Trial' && '🔹 15-day free trial will start immediately'}
                        {subscriptionType === 'Monthly' && '🔹 Monthly subscription (30 days) will be activated'}
                        {subscriptionType === 'Yearly' && '🔹 Yearly subscription (365 days) will be activated'}
                      </span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#5a6c7e' }}>
                      {subscriptionType === 'Trial' && '💡 Trial includes full features for 15 days'}
                      {subscriptionType === 'Monthly' && '💡 Subscription will renew automatically'}
                      {subscriptionType === 'Yearly' && '💡 Best value - save 30% compared to monthly'}
                    </div>
                  </div>
                )}

                {/* No Subscription Message */}
                {!showSubscriptionDetails && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #6c757d',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-info-circle" style={{ color: '#6c757d' }}></i>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>
                        No subscription selected. User will have basic access.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="add-user-error">
                <i className="bi bi-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

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

      {toast && (
        <div
          className={`user-toast ${
            toast.type === 'success'
              ? 'user-toast-success'
              : 'user-toast-error'
          }`}
        >
          <i
            className={
              toast.type === 'success'
                ? 'bi bi-check-circle-fill'
                : 'bi bi-exclamation-circle-fill'
            }
          ></i>
          <span>{toast.message}</span>
          <button
            type="button"
            className="user-toast-close"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};