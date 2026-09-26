import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { createCustomer } from '../features/services/customerService';
import { CreateCustomerRequest } from '../types/customer';
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

        // Limit file size (e.g., 2MB)
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
            }, 2000);
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
                <div className="add-customer-form-container">
                    <h2 className="add-customer-form-title">
                        <i className="bi bi-person-plus me-2"></i>
                        Add New Customer
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Profile Image Section */}
                        {/* Profile Image Section */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            marginBottom: '2rem'
                        }}>
                            {/* Circular Image Placeholder */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '110px',
                                    height: '110px',
                                    borderRadius: '50%',
                                    border: '2px dashed #cbd5e1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    backgroundColor: '#f8fafc',
                                    transition: 'border-color 0.2s ease'
                                }}
                                title="Click to upload profile photo"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                        <i className="bi bi-camera" style={{ fontSize: '1.85rem', display: 'block', lineHeight: 1 }}></i>
                                        <span style={{ fontSize: '0.75rem', marginTop: '4px', display: 'inline-block' }}>Upload</span>
                                    </div>
                                )}
                            </div>

                            {/* Hidden Native File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />

                            {/* Action Buttons Below the Placeholder */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        padding: '0.45rem 1rem',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        background: '#fff',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        color: '#334155'
                                    }}
                                >
                                    <i className="bi bi-upload"></i>
                                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                </button>

                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            padding: '0.45rem 0.85rem',
                                            borderRadius: '6px',
                                            border: '1px solid #fecaca',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                        Remove
                                    </button>
                                )}
                            </div>


                        </div>

                        {/* Name & Phone */}
                        <div className="add-customer-form-row">
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-person me-1"></i>
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-telephone me-1"></i>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Person & Email */}
                        <div className="add-customer-form-row">
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-person-badge me-1"></i>
                                    Contact Person
                                </label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter contact person name"
                                />
                            </div>
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-envelope me-1"></i>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        {/* Company & PAN */}
                        <div className="add-customer-form-row">
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-building me-1"></i>
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter company name"
                                />
                            </div>
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-card-text me-1"></i>
                                    PAN Number
                                </label>
                                <input
                                    type="text"
                                    name="pan"
                                    value={formData.pan}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter PAN number"
                                />
                            </div>
                        </div>

                        {/* Address & Bank Account */}
                        <div className="add-customer-form-row">
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-geo-alt me-1"></i>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter customer address"
                                />
                            </div>
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-bank me-1"></i>
                                    Bank Account
                                </label>
                                <input
                                    type="text"
                                    name="bankAccount"
                                    value={formData.bankAccount}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="Enter bank account number"
                                />
                            </div>
                        </div>

                        {/* Cash Balance */}
                        <div className="add-customer-form-row">
                            <div className="add-customer-form-group">
                                <label className="add-customer-label">
                                    <i className="bi bi-cash-stack me-1"></i>
                                    Opening Cash Balance
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cashBalance"
                                    value={formData.cashBalance}
                                    onChange={handleChange}
                                    className="add-customer-input"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Settings & Flags */}
                        <div className="add-customer-checkbox-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
                            <label className="add-customer-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isSupplier"
                                    checked={formData.isSupplier}
                                    onChange={handleChange}
                                />
                                Is Supplier
                            </label>

                            <label className="add-customer-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="customerSmsSetting"
                                    checked={formData.customerSmsSetting}
                                    onChange={handleChange}
                                />
                                SMS Notifications
                            </label>

                            <label className="add-customer-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="smsLanguage"
                                    checked={formData.smsLanguage}
                                    onChange={handleChange}
                                />
                                Alternate SMS Language
                            </label>

                            <label className="add-customer-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="transactionHistoryCheck"
                                    checked={formData.transactionHistoryCheck}
                                    onChange={handleChange}
                                />
                                Transaction Check
                            </label>
                        </div>

                        <div className="add-customer-button-container">
                            <button
                                type="submit"
                                className="add-customer-submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="add-customer-loading"></span>
                                        Adding Customer...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle"></i>
                                        Add Customer
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="add-customer-cancel-button"
                                onClick={handleCancel}
                            >
                                <i className="bi bi-x-circle"></i>
                                Cancel
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