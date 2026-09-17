import Navbar from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
    getSelectedKhataBook,
    updateKhataBook,
} from '../services/khataBookService';

import '../styles/BusinessSetting.css';

const BusinessSetting = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        id: 0,
        name: '',
        number: '',
        address: '',
        email: '',
        companyName: '',
        companyNumber: '',
        companyAddress: '',
        companyEmail: '',
        businessCategory: '',
        businessType: '',
        taxVat: false,
        bookAccount: false,
        kyc: false,
        imagePath: '',
    });

    useEffect(() => {
        fetchSelectedKhataBook();
    }, []);

    const fetchSelectedKhataBook = async () => {
        try {
            setIsLoading(true);

            const data = await getSelectedKhataBook();

            setFormData({
                id: data.id,
                name: data.name || '',
                number: data.number || '',
                address: data.address || '',
                email: data.email || '',
                companyName: data.companyName || '',
                companyNumber: data.companyNumber || '',
                companyAddress: data.companyAddress || '',
                companyEmail: data.companyEmail || '',
                businessCategory:
                    data.businessCategory !== undefined
                        ? String(data.businessCategory)
                        : '',
                businessType:
                    data.businessType !== undefined
                        ? String(data.businessType)
                        : '',
                taxVat: data.taxVat || false,
                bookAccount: data.bookAccount || false,
                kyc: data.kyc || false,
                imagePath: data.imagePath || '',
            });
        } catch (error) {
            console.error('Error loading KhataBook:', error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to load business settings'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const handleImageSelect = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setSelectedImage(file);

        const imageUrl = URL.createObjectURL(file);

        setFormData((prev) => ({
            ...prev,
            imagePath: imageUrl,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Name is required!');
            return;
        }

        if (!formData.id) {
            toast.error('KhataBook ID not found!');
            return;
        }

        setIsSubmitting(true);

        try {
            const dataToSend = new FormData();

            dataToSend.append('Name', formData.name);
            dataToSend.append('Number', formData.number);
            dataToSend.append('Address', formData.address);
            dataToSend.append('Email', formData.email);

            dataToSend.append(
                'CompanyName',
                formData.companyName
            );

            dataToSend.append(
                'CompanyNumber',
                formData.companyNumber
            );

            dataToSend.append(
                'CompanyAddress',
                formData.companyAddress
            );

            dataToSend.append(
                'CompanyEmail',
                formData.companyEmail
            );

            dataToSend.append(
                'BusinessCategory',
                formData.businessCategory
            );

            dataToSend.append(
                'BusinessType',
                formData.businessType
            );

            dataToSend.append(
                'TaxVat',
                String(formData.taxVat)
            );

            dataToSend.append(
                'BookAccount',
                String(formData.bookAccount)
            );

            dataToSend.append(
                'KYC',
                String(formData.kyc)
            );

            if (selectedImage) {
                dataToSend.append(
                    'imageFile',
                    selectedImage
                );
            }

            await updateKhataBook(
                formData.id,
                dataToSend
            );

            toast.success(
                'Business settings updated successfully!'
            );

            setSelectedImage(null);

            await fetchSelectedKhataBook();
        } catch (error) {
            console.error('Update error:', error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update business settings'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="update-khatabook-page-wrapper">
                <Sidebar />

                <div className="update-khatabook-page-main">
                    <Navbar />

                    <div className="update-khata-book-container">
                        <p>Loading business settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="update-khatabook-page-wrapper">
            <Sidebar />

            <div className="update-khatabook-page-main">
                <Navbar />

                <div className="update-khata-book-container">
                    <form onSubmit={handleSubmit}>

                        {/* Image Section */}
                        <div className="update-khata-book-image-section">
                            
                            <div className="update-khata-book-image-placeholder">
                                {formData.imagePath ? (
                                    <img
                                        src={`http://localhost:5000${formData.imagePath}`}
                                        alt="Customer"
                                        className="update-khata-book-image"
                                    />
                                ) : (
                                    <i className="bi bi-person-circle"></i>
                                )}
                            </div>

                            <button
                                type="button"
                                className="update-khata-book-add-photo-button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                            >
                                <i className="bi bi-camera"></i>
                                 {formData.imagePath ? 'Change Logo' : 'Add Logo'}
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="update-khata-book-hidden-file-input"
                                accept="image/*"
                                onChange={handleImageSelect}

                            />
                        </div>

                        {/* Personal Info */}
                        <div className="update-khata-book-section">
                            <h2 className="update-khata-book-section-title">
                                <i className="bi bi-person me-2"></i>
                                Personal Info
                            </h2>

                            <div className="update-khata-book-form-grid">

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label required">
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                        required
                                    />
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                    />
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                    />
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Business Info */}
                        <div className="update-khata-book-section">
                            <h2 className="update-khata-book-section-title">
                                <i className="bi bi-building me-2"></i>
                                Business Info
                            </h2>

                            <div className="update-khata-book-form-grid">

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Company Name
                                    </label>

                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                    />
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Company Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="companyNumber"
                                        value={formData.companyNumber}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                    />
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Company Address
                                    </label>

                                    <input
                                        type="text"
                                        name="companyAddress"
                                        value={formData.companyAddress}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                    />
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Company Email
                                    </label>

                                    <input
                                        type="email"
                                        name="companyEmail"
                                        value={formData.companyEmail}
                                        onChange={handleInputChange}
                                        className="update-khata-book-input"
                                    />
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Business Category
                                    </label>

                                    <select
                                        name="businessCategory"
                                        value={formData.businessCategory}
                                        onChange={handleInputChange}
                                        className="update-khata-book-select"
                                    >
                                        <option value="0">Retail</option>
                                        <option value="1">Wholesale</option>
                                        <option value="2">Manufacturing</option>
                                        <option value="3">Service</option>
                                    </select>
                                </div>

                                <div className="update-khata-book-form-group">
                                    <label className="update-khata-book-label">
                                        Business Type
                                    </label>

                                    <select
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleInputChange}
                                        className="update-khata-book-select"
                                    >
                                        <option value="0">
                                            Sole Proprietorship
                                        </option>
                                        <option value="1">
                                            Partnership
                                        </option>
                                        <option value="2">
                                            Corporation
                                        </option>
                                        <option value="3">
                                            LLC
                                        </option>
                                    </select>
                                </div>

                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="update-khata-book-section">
                            <h2 className="update-khata-book-section-title">
                                <i className="bi bi-cash-stack me-2"></i>
                                Financial Info
                            </h2>

                            <div className="update-khata-book-checkbox-group">

                                <label className="update-khata-book-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="taxVat"
                                        checked={formData.taxVat}
                                        onChange={handleInputChange}
                                    />

                                    <i className="bi bi-receipt me-2"></i>
                                    Tax/VAT
                                </label>

                                <label className="update-khata-book-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="bookAccount"
                                        checked={formData.bookAccount}
                                        onChange={handleInputChange}
                                    />

                                    <i className="bi bi-journal-text me-2"></i>
                                    Book A/C
                                </label>

                                <label className="update-khata-book-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="kyc"
                                        checked={formData.kyc}
                                        onChange={handleInputChange}
                                    />

                                    <i className="bi bi-shield-check me-2"></i>
                                    KYC
                                </label>

                            </div>
                        </div>

                        <button
                            type="submit"
                            className="update-khata-book-save-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-2"></i>
                                    Update
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessSetting;