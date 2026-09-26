import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { createSupplier, CreateSupplierRequest } from '../features/services/supplierService';
import '../styles/AddSupplier.css';

export const AddSupplier = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CreateSupplierRequest>({
        profileImage: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        company: '',
        pan: '',
        contactPerson: '',
    });

    const [imagePreview, setImagePreview] = useState<string>('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
            setFormData((prev) => ({
                ...prev,
                profileImage: base64String, // Fixed typo
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setFormData((prev) => ({
            ...prev,
            profileImage: '', // Fixed typo
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setAlertMessage('Supplier name is required!');
            setAlertType('error');
            setShowAlert(true);
            return;
        }

        if (!formData.contactPerson.trim()) {
            setAlertMessage('Contact person is required!');
            setAlertType('error');
            setShowAlert(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: CreateSupplierRequest = {
                ...formData,
                name: formData.name.trim(),
                contactPerson: formData.contactPerson.trim(),
                profileImage: formData.profileImage || null,
            };

            await createSupplier(payload);
            setAlertMessage('Supplier added successfully!');
            setAlertType('success');
            setShowAlert(true);

            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error) {
            setAlertMessage(
                error instanceof Error ? error.message : 'Error connecting to the server. Please try again.'
            );
            setAlertType('error');
            setShowAlert(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="add-supplier-page-wrapper">
            <Sidebar />

            <main className="add-supplier-main-content">
                <div className="add-supplier-form-container">
                    <h2 className="add-supplier-form-title">
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Supplier
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Image Placeholder Section */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginBottom: '2rem',
                                gap: '0.75rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '110px',
                                    height: '110px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f1f3f5',
                                    border: '2px dashed #ced4da',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                title="Click to choose profile picture"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Supplier Profile Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <i
                                        className="bi bi-camera"
                                        style={{ fontSize: '2rem', color: '#adb5bd' }}
                                    ></i>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        padding: '0.35rem 0.8rem',
                                        fontSize: '0.8rem',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        background: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <i className="bi bi-upload me-1"></i>
                                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                </button>

                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            padding: '0.35rem 0.8rem',
                                            fontSize: '0.8rem',
                                            border: '1px solid #dc3545',
                                            borderRadius: '4px',
                                            background: '#fff',
                                            color: '#dc3545',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="add-supplier-form-row">
                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-person me-1"></i>
                                    Supplier Name <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter supplier name"
                                    required
                                />
                            </div>

                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-telephone me-1"></i>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="add-supplier-form-row">
                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-building me-1"></i>
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-card-text me-1"></i>
                                    PAN Number
                                </label>
                                <input
                                    type="text"
                                    name="pan"
                                    value={formData.pan}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter PAN number"
                                />
                            </div>
                        </div>

                        <div className="add-supplier-form-row">
                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-geo-alt me-1"></i>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter address"
                                />
                            </div>

                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-envelope me-1"></i>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div className="add-supplier-form-row">
                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-person-badge me-1"></i>
                                    Contact Person <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter contact person name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="add-supplier-button-container">
                            <button
                                type="submit"
                                className="add-supplier-submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="add-supplier-loading">
                                        <div className="add-supplier-spinner"></div>
                                        Adding Supplier...
                                    </div>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-circle me-1"></i>
                                        Add Supplier
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="add-supplier-cancel-button"
                                onClick={handleCancel}
                            >
                                <i className="bi bi-x-circle me-1"></i>
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