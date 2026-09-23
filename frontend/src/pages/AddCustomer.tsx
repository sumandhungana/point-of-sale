import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { createCustomer } from '../services/customerService';
import { CreateCustomerRequest } from '../types/customer'; // Adjust import path as needed
import '../styles/AddCustomer.css';

export const AddCustomer = () => {
    const navigate = useNavigate();

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