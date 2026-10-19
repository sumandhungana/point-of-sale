import React, { useState, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { createCustomer, CreateCustomerRequest } from '@/features/services/customerService';
import '../styles/AddCustomer.css';

export const AddCustomer = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CreateCustomerRequest>({
        name: '',
        phone: '',
        email: '',
        address: '',
        company: '',
        pan: '',
        contactPerson: '',
        isSupplier: false,
        bankAccount: '',
        cashBalance: 0,
        profileImage: '',
        customerSmsSetting: false,
        smsLanguage: false,
        transactionHistoryCheck: false,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : parseFloat(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setAlertMessage('Image size must be less than 2MB');
            setAlertType('error');
            setShowAlert(true);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
            setFormData(prev => ({
                ...prev,
                profileImage: base64String
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            profileImage: ''
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createCustomer(formData);
            setAlertMessage('Customer added successfully!');
            setAlertType('success');
            setShowAlert(true);

            setTimeout(() => {
                navigate('/parties/customers');
            }, 1500);
        } catch (error) {
            setAlertMessage('Error connecting to the server. Please try again.');
            setAlertType('error');
            setShowAlert(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/parties/customers');
    };

    return (
        <div className="add-customer-page-wrapper">
            <Sidebar />

            <main className="add-customer-main-content">
                <div className="add-customer-card">
                    {/* Header with Title and Top-Right Cross Button */}
                    <div className="form-card-header">
                        <div className="form-card-header-left">
                            <div className="form-header-icon-wrap">
                                <i className="bi bi-person-plus-fill" />
                            </div>
                            <div>
                                <h1 className="form-header-title">Add New Customer</h1>
                                <p className="form-header-subtitle">Register customer profile and initial accounting balances</p>
                            </div>
                        </div>

                        {/* Top Right Cross Button */}
                        <button
                            type="button"
                            className="form-close-btn"
                            onClick={handleCancel}
                            aria-label="Close"
                            title="Close"
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="form-body">
                        {/* Interactive Avatar Upload Card */}
                        <div className="avatar-card-banner">
                            <div className="avatar-preview-wrapper" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0}>
                                <div className="avatar-display-frame">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Customer Preview" className="avatar-img-preview" />
                                    ) : (
                                        <div className="avatar-icon-fallback">
                                            <i className="bi bi-person-fill" />
                                        </div>
                                    )}
                                    <div className="avatar-hover-overlay">
                                        <i className="bi bi-camera-fill" />
                                        <span>Change</span>
                                    </div>
                                </div>
                                <div className="avatar-camera-badge" title="Upload Photo">
                                    <i className="bi bi-camera-fill" />
                                </div>
                            </div>

                            <div className="avatar-meta-info">
                                <h3 className="avatar-meta-title">Customer Photo</h3>
                                <p className="avatar-meta-hint">Upload a high-resolution JPG, PNG or WEBP image (max 2MB)</p>
                                <div className="avatar-action-buttons">
                                    <button
                                        type="button"
                                        className="btn-upload-avatar"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="bi bi-cloud-arrow-up me-1" />
                                        {imagePreview ? 'Replace Photo' : 'Choose Photo'}
                                    </button>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            className="btn-remove-avatar"
                                            onClick={handleRemoveImage}
                                        >
                                            <i className="bi bi-trash3 me-1" />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Form Fields Grid */}
                        <div className="form-grid">
                            {/* Customer Name */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Customer Name <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-person field-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Phone Number
                                    {/*<span className="required-star">*</span>*/}
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-telephone field-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Contact Number"

                                    />
                                </div>
                            </div>

                            {/* Contact Person */}
                            <div className="form-field-group">
                                <label className="form-field-label">Contact Person</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-person-badge field-icon" />
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Contact Representative"
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="form-field-group">
                                <label className="form-field-label">Email Address</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-envelope field-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="customer@domain.com"
                                    />
                                </div>
                            </div>

                            {/* Company Name */}
                            <div className="form-field-group">
                                <label className="form-field-label">Company Name</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-building field-icon" />
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Organization / Trade Name"
                                    />
                                </div>
                            </div>

                            {/* PAN Number */}
                            <div className="form-field-group">
                                <label className="form-field-label">PAN Number</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-card-text field-icon" />
                                    <input
                                        type="text"
                                        name="pan"
                                        value={formData.pan}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Tax Identification / PAN"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="form-field-group">
                                <label className="form-field-label">Address</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-geo-alt field-icon" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Street / City / Region"
                                    />
                                </div>
                            </div>

                            {/* Bank Account */}
                            <div className="form-field-group">
                                <label className="form-field-label">Bank Account</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-bank field-icon" />
                                    <input
                                        type="text"
                                        name="bankAccount"
                                        value={formData.bankAccount}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Account Number"
                                    />
                                </div>
                            </div>

                            {/* Opening Cash Balance */}
                            <div className="form-field-group">
                                <label className="form-field-label">Opening Cash Balance (रु)</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-cash-stack field-icon" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="cashBalance"
                                        value={formData.cashBalance}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Settings & Flags Card */}
                        <div className="form-checkboxes-card">
                            <h3 className="checkbox-section-title">Preferences & Flags</h3>
                            <div className="checkboxes-grid">
                                <label className="checkbox-card-item">
                                    <input
                                        type="checkbox"
                                        name="isSupplier"
                                        checked={formData.isSupplier}
                                        onChange={handleChange}
                                        className="form-checkbox-custom"
                                    />
                                    <div className="checkbox-text">
                                        <span className="checkbox-heading">Also a Supplier</span>
                                        <span className="checkbox-desc">Enable supplier account link</span>
                                    </div>
                                </label>

                                <label className="checkbox-card-item">
                                    <input
                                        type="checkbox"
                                        name="customerSmsSetting"
                                        checked={formData.customerSmsSetting}
                                        onChange={handleChange}
                                        className="form-checkbox-custom"
                                    />
                                    <div className="checkbox-text">
                                        <span className="checkbox-heading">SMS Notifications</span>
                                        <span className="checkbox-desc">Send payment & bill alerts</span>
                                    </div>
                                </label>

                                <label className="checkbox-card-item">
                                    <input
                                        type="checkbox"
                                        name="smsLanguage"
                                        checked={formData.smsLanguage}
                                        onChange={handleChange}
                                        className="form-checkbox-custom"
                                    />
                                    <div className="checkbox-text">
                                        <span className="checkbox-heading">Alternate SMS Language</span>
                                        <span className="checkbox-desc">Deliver messages in local script</span>
                                    </div>
                                </label>

                                <label className="checkbox-card-item">
                                    <input
                                        type="checkbox"
                                        name="transactionHistoryCheck"
                                        checked={formData.transactionHistoryCheck}
                                        onChange={handleChange}
                                        className="form-checkbox-custom"
                                    />
                                    <div className="checkbox-text">
                                        <span className="checkbox-heading">Transaction Verification</span>
                                        <span className="checkbox-desc">Enforce ledger validation</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="form-action-footer">
                            <button
                                type="button"
                                className="btn-form-cancel"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-form-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                        Saving Customer...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-1" />
                                        Save Customer
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {showAlert && (
                <Alert
                    message={alertMessage}
                    type={alertType}
                    onClose={() => setShowAlert(false)}
                />
            )}
        </div>
    );
};