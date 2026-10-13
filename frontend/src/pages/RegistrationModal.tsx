import React, { useState } from 'react';

type UserFormType = {
    userName: string;
    phoneNumber: string;
    gmail: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
    organizationAddress: string;
    panVatNumber: string;
    branch: string;
    organizationType: string;
    notes: string;
};

interface RegistrationModalProps {
    show: boolean;
    onClose: () => void;
    userForm: UserFormType;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isRegistering: boolean;
    registrationSuccess: string;
    registrationError: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
                                                                        show,
                                                                        onClose,
                                                                        userForm,
                                                                        onInputChange,
                                                                        onSubmit,
                                                                        isRegistering,
                                                                        registrationSuccess,
                                                                        registrationError,
                                                                    }) => {
    const [isPasswordExpanded, setIsPasswordExpanded] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    if (!show) return null;

    return (
        <div className="user-modal-overlay" onClick={onClose}>
            <div className="user-registration-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="user-modal-header">
                    <div>
                        <h3>
                            <i className="bi bi-person-plus me-2"></i>
                            User Registration
                        </h3>
                        <p>Register your organization to get started</p>
                    </div>
                    <button type="button" className="user-modal-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit}>
                    <div className="user-modal-body">
                        {registrationSuccess && (
                            <div className="registration-success">
                                <i className="bi bi-check-circle me-2"></i>
                                {registrationSuccess}
                            </div>
                        )}

                        {registrationError && (
                            <div className="registration-error">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {registrationError}
                            </div>
                        )}

                        <div className="registration-form-grid">
                            {/* 1. Organization Details */}
                            <div className="registration-field-full">
                                <div className="registration-section-title">
                                    <i className="bi bi-building me-2"></i>
                                    <span>Organization Details</span>
                                </div>
                            </div>

                            {/* Organization Name */}
                            <div className="registration-field">
                                <label>
                                    Organization Name <span>*</span>
                                </label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-building"></i>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={userForm.organizationName}
                                        onChange={onInputChange}
                                        placeholder="Enter organization name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Branch */}
                            <div className="registration-field">
                                <label>Branch</label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-diagram-3"></i>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={userForm.branch}
                                        onChange={onInputChange}
                                        placeholder="Enter branch (Default Main)"
                                    />
                                </div>
                            </div>

                            {/* PAN/VAT */}
                            <div className="registration-field">
                                <label>PAN / VAT Number</label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-card-text"></i>
                                    <input
                                        type="text"
                                        name="panVatNumber"
                                        value={userForm.panVatNumber}
                                        onChange={onInputChange}
                                        placeholder="Enter PAN / VAT number"
                                    />
                                </div>
                            </div>

                            {/* Organization Type */}
                            <div className="registration-field">
                                <label>
                                    Organization Type <span>*</span>
                                </label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-briefcase"></i>
                                    <select
                                        name="organizationType"
                                        value={userForm.organizationType}
                                        onChange={onInputChange}
                                        required
                                    >
                                        <option value="">Select organization type</option>
                                        <option value="Individual">Individual</option>
                                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                                        <option value="Partnership">Partnership</option>
                                        <option value="Private Limited">Private Limited</option>
                                        <option value="Public Limited">Public Limited</option>
                                        <option value="Non Profit">Non Profit Organization</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Organization Address */}
                            <div className="registration-field-full">
                                <label>
                                    Organization Address <span>*</span>
                                </label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-geo-alt"></i>
                                    <input
                                        type="text"
                                        name="organizationAddress"
                                        value={userForm.organizationAddress}
                                        onChange={onInputChange}
                                        placeholder="Enter address"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="registration-field-full">
                                <label>Notes</label>
                                <div className="registration-textarea-wrapper">
                                    <i className="bi bi-pencil"></i>
                                    <textarea
                                        name="notes"
                                        value={userForm.notes}
                                        onChange={onInputChange}
                                        placeholder="Add any additional notes (Optional)"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* 2. Administrator Credentials */}
                            <div className="registration-field-full mt-2">
                                <div className="registration-section-title">
                                    <i className="bi bi-person-badge me-2"></i>
                                    <span>Administrator Credentials</span>
                                </div>
                            </div>

                            {/* User Name */}
                            <div className="registration-field">
                                <label>
                                    User Name <span>*</span>
                                </label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-person"></i>
                                    <input
                                        type="text"
                                        name="userName"
                                        value={userForm.userName}
                                        onChange={onInputChange}
                                        placeholder="Enter user name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="registration-field">
                                <label>
                                    Phone Number <span>*</span>
                                </label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-telephone"></i>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={userForm.phoneNumber}
                                        onChange={onInputChange}
                                        placeholder="98XXXXXXXX"
                                        pattern="[0-9]{10}"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Gmail */}
                            <div className="registration-field-full">
                                <label>
                                    Gmail <span>*</span>
                                </label>
                                <div className="registration-input-wrapper">
                                    <i className="bi bi-envelope"></i>
                                    <input
                                        type="email"
                                        name="gmail"
                                        value={userForm.gmail}
                                        onChange={onInputChange}
                                        placeholder="example@gmail.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* EXPANDABLE PASSWORD & CONFIRM PASSWORD CARD */}
                            <div className="registration-field-full">
                                <div className="expandable-card mb-0">
                                    <div
                                        className="expandable-card-header"
                                        onClick={() => setIsPasswordExpanded(!isPasswordExpanded)}
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={isPasswordExpanded}
                                    >
                                        <div className="expandable-header-title">
                                            <span className="expandable-icon">🔑</span>
                                            <div>
                                                <h4 className="expandable-title">Password Credentials</h4>
                                                <p className="expandable-subtitle">
                                                    Set login password & confirm password
                                                </p>
                                            </div>
                                        </div>
                                        <div className="expandable-toggle-action">
                                            <span className="expandable-badge">
                                                {isPasswordExpanded ? 'Collapse' : 'Expand Form'}
                                            </span>
                                            <i className={`bi ${isPasswordExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                                        </div>
                                    </div>

                                    {isPasswordExpanded && (
                                        <div className="expandable-card-body">
                                            <div className="registration-form-grid" style={{ marginBottom: 0 }}>
                                                {/* Password */}
                                                <div className="registration-field">
                                                    <label>
                                                        Password <span>*</span>
                                                    </label>
                                                    <div className="registration-input-wrapper password-input-wrapper">
                                                        <i className="bi bi-lock"></i>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            name="password"
                                                            value={userForm.password}
                                                            onChange={onInputChange}
                                                            placeholder="Enter password"
                                                            minLength={8}
                                                            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}"
                                                            title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="password-toggle-btn"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                        >
                                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Confirm Password */}
                                                <div className="registration-field">
                                                    <label>
                                                        Confirm Password <span>*</span>
                                                    </label>
                                                    <div className="registration-input-wrapper password-input-wrapper">
                                                        <i className="bi bi-lock-fill"></i>
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            name="confirmPassword"
                                                            value={userForm.confirmPassword}
                                                            onChange={onInputChange}
                                                            placeholder="Re-enter password"
                                                            minLength={8}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="password-toggle-btn"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                                        >
                                                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {userForm.confirmPassword && (
                                                <div className={`password-match-indicator ${userForm.password === userForm.confirmPassword ? 'match' : 'mismatch'}`}>
                                                    <i className={`bi ${userForm.password === userForm.confirmPassword ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} />
                                                    <span>{userForm.password === userForm.confirmPassword ? 'Passwords match' : 'Passwords do not match'}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="user-modal-footer">
                        <button
                            type="button"
                            className="registration-cancel-button"
                            onClick={onClose}
                            disabled={isRegistering}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="registration-submit-button"
                            disabled={isRegistering}
                        >
                            {isRegistering ? (
                                <>
                                    <span className="registration-spinner"></span>
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle me-1"></i>
                                    Register Organization
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};