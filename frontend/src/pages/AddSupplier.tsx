import React, { useState, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { createSupplier, CreateSupplierRequest } from '@/features/services/supplierService';
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
            setFormData((prev) => ({
                ...prev,
                profileImage: base64String,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setFormData((prev) => ({
            ...prev,
            profileImage: '',
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
                profileImage: formData.profileImage || '',
            };

            await createSupplier(payload);
            setAlertMessage('Supplier added successfully!');
            setAlertType('success');
            setShowAlert(true);

            setTimeout(() => {
                navigate('/parties/suppliers');
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
        navigate('/parties/suppliers');
    };

    return (
        <div className="add-supplier-page-wrapper">
            <Sidebar />

            <main className="add-supplier-main-content">
                {/* Top Page Header - Clean Add Purchase Bill Style */}
                <div className="add-supplier-page-header">
                    <div className="add-supplier-header-info">
                        <div className="add-supplier-header-icon">
                            <i className="bi bi-truck" />
                        </div>
                        <div>
                            <h1 className="add-supplier-header-title">Add Supplier</h1>
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

                <div className="add-supplier-card">
                    <form onSubmit={handleSubmit} className="form-body">
                        {/* Interactive Avatar Upload */}
                        <div className="avatar-card-banner">
                            <div
                                className="avatar-preview-wrapper"
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                title={imagePreview ? "Change Photo" : "Add Photo"}
                            >
                                <div className="avatar-display-frame">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Supplier Preview" className="avatar-img-preview" />
                                    ) : (
                                        <div className="avatar-icon-fallback">
                                            <i className="bi bi-person-fill" />
                                        </div>
                                    )}
                                    <div className="avatar-hover-overlay">
                                        <i className="bi bi-plus-lg" />
                                        <span>{imagePreview ? 'Change' : 'Add'}</span>
                                    </div>
                                </div>
                                <div className="avatar-camera-badge" title={imagePreview ? "Change Photo" : "Add Photo"}>
                                    <i className="bi bi-plus-lg" />
                                </div>
                            </div>

                            {imagePreview && (
                                <div className="avatar-remove-wrapper">
                                    <button
                                        type="button"
                                        className="btn-remove-avatar"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage();
                                        }}
                                        title="Remove Photo"
                                    >
                                        <i className="bi bi-trash3 me-1" />
                                        Remove
                                    </button>
                                </div>
                            )}

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
                            {/* Supplier Name */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Supplier Name <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-shop field-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Vendor / Business Name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Person */}
                            <div className="form-field-group">
                                <label className="form-field-label">
                                    Contact Person <span className="required-star">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <i className="bi bi-person-badge field-icon" />
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Contact Representative"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="form-field-group">
                                <label className="form-field-label">Phone Number</label>
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
                                        placeholder="supplier@domain.com"
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
                                        placeholder="Registered Company Name"
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
                                        placeholder="PAN / VAT Number"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="form-field-group form-field-full">
                                <label className="form-field-label">Address</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-geo-alt field-icon" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-field-input"
                                        placeholder="Warehouse / Street Address"
                                    />
                                </div>
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
                                        Saving Supplier...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-1" />
                                        Save Supplier
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