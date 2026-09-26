import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { createNewKhataBook, CreateKhatBookRequest } from '../services/khataBookService';
import { getRoles, RoleResponse } from '../services/roleService';
import '../styles/AddKhataBook.css';

export const AddKhataBook = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    gmail: '',
    password: '',
    organizationName: '',
    panVatNumber: '',
    branch: '',
    organizationType: '',
    organizationAddress: '',
    notes: '',
    role: '',
    isExternalOnboarding: false,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const rolesData = await getRoles();
        setRoles(rolesData);

        if (rolesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            role: rolesData[0].name,
          }));
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to load user roles');
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
  }, []);

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName.trim()) {
      toast.error('User Name is required!');
      return;
    }
    if (!formData.gmail.trim()) {
      toast.error('Gmail/Email is required!');
      return;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required!');
      return;
    }
    if (!formData.role) {
      toast.error('Please select a role!');
      return;
    }
    if (!formData.organizationName.trim()) {
      toast.error('Organization Name is required!');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateKhatBookRequest = {
        ...formData,
        userId: formData.gmail.trim(),
        gmail: formData.gmail.trim(),
        userName: formData.userName.trim(),
        role: formData.role,
        isExternalOnboarding: formData.isExternalOnboarding,
      };

      await createNewKhataBook(payload);
      toast.success('Khata Book created successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error creating Khata Book:', error);
      toast.error(
          error instanceof Error ? error.message : 'Failed to create Khata Book. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="add-khatabook-page-wrapper">
        <Sidebar />
        <div className="add-khatabook-page-main">
          <Navbar />
          <div className="add-khata-book-container">
            <form onSubmit={handleSubmit}>
              {/* User Credentials & Personal Info */}
              <div className="add-khata-book-section">
                <h2 className="add-khata-book-section-title">
                  <i className="bi bi-person me-2"></i>
                  Account & Personal Details
                </h2>
                <div className="add-khata-book-form-grid">
                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-person me-1"></i>
                      User Name
                    </label>
                    <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Enter full name"
                        required
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-envelope me-1"></i>
                      Email / Gmail (User ID)
                    </label>
                    <input
                        type="email"
                        name="gmail"
                        value={formData.gmail}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="example@gmail.com"
                        required
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-key me-1"></i>
                      Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Enter password"
                        required
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label">
                      <i className="bi bi-telephone me-1"></i>
                      Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="98XXXXXXXX"
                    />
                  </div>

                  {/* Role Selector */}
                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-shield-lock me-1"></i>
                      User Role
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="add-khata-book-select"
                        required
                        disabled={isLoadingRoles}
                    >
                      {isLoadingRoles ? (
                          <option value="">Loading roles...</option>
                      ) : roles.length === 0 ? (
                          <option value="">No roles available</option>
                      ) : (
                          <>
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                  {role.name}
                                </option>
                            ))}
                          </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              <div className="add-khata-book-section">
                <h2 className="add-khata-book-section-title">
                  <i className="bi bi-building me-2"></i>
                  Organization Details
                </h2>
                <div className="add-khata-book-form-grid">
                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label required">
                      <i className="bi bi-building me-1"></i>
                      Organization Name
                    </label>
                    <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Business / Shop Name"
                        required
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label">
                      <i className="bi bi-card-text me-1"></i>
                      PAN / VAT Number
                    </label>
                    <input
                        type="text"
                        name="panVatNumber"
                        value={formData.panVatNumber}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Enter PAN/VAT Number"
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label">
                      <i className="bi bi-diagram-3 me-1"></i>
                      Branch
                    </label>
                    <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="e.g. Kathmandu, Pokhara"
                    />
                  </div>

                  <div className="add-khata-book-form-group">
                    <label className="add-khata-book-label">
                      <i className="bi bi-briefcase me-1"></i>
                      Organization Type
                    </label>
                    <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        className="add-khata-book-select"
                    >
                      <option value="">Select Type</option>
                      <option value="RETAIL">Retail</option>
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="MANUFACTURING">Manufacturing</option>
                      <option value="SERVICE">Service</option>
                      <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                      <option value="PRIVATE_LIMITED">Private Limited</option>
                    </select>
                  </div>

                  <div className="add-khata-book-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="add-khata-book-label">
                      <i className="bi bi-geo-alt me-1"></i>
                      Organization Address
                    </label>
                    <input
                        type="text"
                        name="organizationAddress"
                        value={formData.organizationAddress}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Physical address"
                    />
                  </div>

                  <div className="add-khata-book-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="add-khata-book-label">
                      <i className="bi bi-journal-text me-1"></i>
                      Notes
                    </label>
                    <input
                        type="text"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="add-khata-book-input"
                        placeholder="Optional onboarding remarks"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="add-khata-book-section">
                <h2 className="add-khata-book-section-title">
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </h2>
                <div className="add-khata-book-checkbox-group">
                  <label className="add-khata-book-checkbox-label">
                    <input
                        type="checkbox"
                        name="isExternalOnboarding"
                        checked={formData.isExternalOnboarding}
                        onChange={handleInputChange}
                    />
                    <i className="bi bi-box-arrow-up-right me-2"></i>
                    External Onboarding
                  </label>
                </div>
              </div>

              <button
                  type="submit"
                  className="add-khata-book-save-button"
                  disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <>
                      <i className="bi bi-arrow-clockwise spin me-2"></i>
                      Saving...
                    </>
                ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Khata Book
                    </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};