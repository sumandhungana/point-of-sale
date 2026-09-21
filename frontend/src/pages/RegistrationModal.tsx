import React from 'react';

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
                            <div className="registration-field">
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

                            {/* Password */}
                            <div className="registration-field">
                                <label>
                                    Password <span>*</span>
                                </label>

                                <div className="registration-input-wrapper">
                                    <i className="bi bi-lock"></i>

                                    <input
                                        type="password"
                                        name="password"
                                        value={userForm.password}
                                        onChange={onInputChange}
                                        placeholder="Enter password"
                                        minLength={8}
                                        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}"
                                        title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="registration-field">
                                <label>
                                    Confirm Password <span>*</span>
                                </label>

                                <div className="registration-input-wrapper">
                                    <i className="bi bi-lock-fill"></i>

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={userForm.confirmPassword}
                                        onChange={onInputChange}
                                        placeholder="Re-enter password"
                                        minLength={8}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Organization */}
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
                                    <i className="bi bi-card-text"></i>
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
                                    <i className="bi bi-diagram-3"></i>
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
                            <div className="registration-field">
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
                                        placeholder="Enter organization address"
                                        // rows={2}
                                        required
                                    />
                                </div>
                            </div>
                            {/* Notes / Remarks */}
                            <div className="registration-field registration-field-full">
                                <label>Notes / Remarks</label>
                                <div className="registration-textarea-wrapper">
                                    <i className="bi bi-journal-text"></i>
                                    <textarea
                                        name="notes"
                                        value={userForm.notes}
                                        onChange={onInputChange}
                                        placeholder="Additional notes, specific instructions, or remarks..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="user-modal-footer">
                        <button type="button" className="registration-cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="registration-submit-button" disabled={isRegistering}>
                            {isRegistering ? (
                                <>
                                    <span className="registration-spinner"></span>
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-person-plus me-2"></i>
                                    Register user
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};