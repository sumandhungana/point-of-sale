import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    fetchSingleSupplierData,
    updateSupplier,
    deleteSingleSuppplier,
    GetSupplierResponse
} from '../features/services/supplierService';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/CustomerProfile.css';

// Helper to decode double Base64 and guarantee a valid image Data URI
const formatImageSrc = (src?: string | null): string => {
    if (!src) return '';
    let clean = src.trim().replace(/(\r\n|\n|\r)/gm, '');

    // Check and decode double-base64 encoding ("ZGF0YT" is Base64 for "data:")
    if (clean.startsWith('ZGF0YT')) {
        try {
            clean = clean.replace(/-/g, '+').replace(/_/g, '/');
            while (clean.length % 4) {
                clean += '=';
            }
            clean = atob(clean).trim().replace(/(\r\n|\n|\r)/gm, '');
        } catch (e) {
            console.error('Failed to decode double-base64 image string:', e);
        }
    }

    if (clean.startsWith('data:image/') || clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
    }

    let mimeType = 'image/png';
    if (clean.startsWith('/9j/')) {
        mimeType = 'image/jpeg';
    } else if (clean.startsWith('iVBORw0KGgo')) {
        mimeType = 'image/png';
    } else if (clean.startsWith('R0lGOD')) {
        mimeType = 'image/gif';
    } else if (clean.startsWith('UklGR')) {
        mimeType = 'image/webp';
    }

    return `data:${mimeType};base64,${clean}`;
};

const ProfileAvatar = ({ name, imageSrc }: { name?: string; imageSrc: string }) => {
    const [status, setStatus] = useState<'loading' | 'ok' | 'failed'>(
        imageSrc ? 'loading' : 'failed'
    );

    useEffect(() => {
        if (!imageSrc) {
            setStatus('failed');
            return;
        }
        setStatus('loading');

        let cancelled = false;
        const probe = new Image();
        probe.onload = () => { if (!cancelled) setStatus('ok'); };
        probe.onerror = () => { if (!cancelled) setStatus('failed'); };
        probe.src = imageSrc;

        return () => {
            cancelled = true;
            probe.onload = null;
            probe.onerror = null;
        };
    }, [imageSrc]);

    if (status !== 'ok') {
        return (
            <div className="customer-profile-image-placeholder">
                <i className="bi bi-person"></i>
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={name || 'Profile'}
            className="customer-profile-image"
            style={{ objectFit: 'cover' }}
        />
    );
};

export const SupplierProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isValidId = Boolean(id && id !== 'undefined' && !isNaN(Number(id)));
    const numericId = isValidId ? parseInt(id!, 10) : 0;

    const [supplierData, setSupplierData] = useState<GetSupplierResponse>({
        id: numericId,
        name: '',
        phone: '',
        email: '',
        address: '',
        company: '',
        pan: '',
        contactPerson: '',
        profileImage: '',
        createdAt: '',
        updatedAt: ''
    });

    const [partyType, setPartyType] = useState<'customer' | 'supplier'>('supplier');

    // Holds the image currently active in state (can be existing or newly picked)
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        supplierName: '',
        mobileNumber: '',
        email: '',
        address: '',
        company: '',
        panNumber: '',
        contactPerson: ''
    });

    const [settings, setSettings] = useState({
        supplierSmsSetting: false,
        smsLanguage: false,
        transactionHistoryCheck: false
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const populateForm = (data: GetSupplierResponse) => {
        const resolvedId = data.id ?? numericId;
        const rawImg = data.profileImage || (data as any).profile_image || null;

        setSupplierData({
            ...data,
            id: Number(resolvedId),
            profileImage: rawImg || ''
        });

        setFormData({
            supplierName: data.name || '',
            mobileNumber: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            company: data.company || '',
            panNumber: data.pan || '',
            contactPerson: data.contactPerson || ''
        });

        // Store the existing image directly so it is never lost on text updates
        setCurrentImage(rawImg);
    };

    useEffect(() => {
        if (location.state?.supplier) {
            populateForm(location.state.supplier as GetSupplierResponse);
            setIsLoading(false);
            return;
        }

        if (!isValidId) {
            toast.error('Supplier ID is missing in URL');
            setIsLoading(false);
            return;
        }

        const fetchSupplier = async () => {
            try {
                setIsLoading(true);
                const data = await fetchSingleSupplierData(id!);

                if (!data) {
                    toast.error('Supplier not found');
                    return;
                }

                populateForm(data);
            } catch (error: any) {
                console.error('Error fetching supplier data:', error);
                toast.error(error?.message || 'Failed to fetch supplier data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSupplier();
    }, [id, location.state, isValidId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCurrentImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handlePartyTypeChange = (type: 'customer' | 'supplier') => {
        setPartyType(type);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const activeId = numericId || supplierData.id;

        if (!activeId) {
            toast.error('Cannot update: Missing supplier ID');
            return;
        }

        if (!formData.supplierName.trim()) {
            toast.error('Supplier name is required');
            return;
        }

        setIsSubmitting(true);

        try {
            // Priority: current state image -> original fetched image -> null
            const finalImage = currentImage || supplierData.profileImage || null;

            await updateSupplier({
                id: Number(activeId),
                name: formData.supplierName.trim(),
                phone: formData.mobileNumber?.trim() || null,
                email: formData.email?.trim() || null,
                address: formData.address?.trim() || null,
                company: formData.company?.trim() || null,
                pan: formData.panNumber?.trim() || null,
                contactPerson: formData.contactPerson?.trim() || null,
                profileImage: finalImage
            });

            toast.success('Supplier updated successfully');
            navigate(`/parties/supplier/statements/${activeId}`);
        } catch (error: any) {
            console.error('Error updating supplier:', error);
            toast.error(error?.message || 'Failed to update supplier');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
        const activeId = numericId || supplierData.id;
        if (!activeId) {
            toast.error('Cannot delete: Missing supplier ID');
            return;
        }

        setIsDeleting(true);
        try {
            await deleteSingleSuppplier(activeId);
            toast.success('Supplier deleted successfully');
            setShowDeleteModal(false);
            navigate('/parties/suppliers');
        } catch (error: any) {
            console.error('Error deleting supplier:', error);
            toast.error(error?.message || 'Failed to delete supplier');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
                <Sidebar />
                <main className="customer-profile-main-content">
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#6c757d' }}>
                        Loading supplier details...
                    </div>
                </main>
            </div>
        );
    }

    // Resolves both double-base64 and normal base64 strings
    const resolvedImage = formatImageSrc(currentImage);

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Sidebar />

            <main className="customer-profile-main-content">
                <div className="customer-profile-container">
                    <button
                        className="customer-profile-back-button"
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back
                    </button>

                    <div className="customer-profile-image-container">
                        <ProfileAvatar name={supplierData.name} imageSrc={resolvedImage} />

                        <label htmlFor="profile-image" className="customer-profile-add-photo-button">
                            <i className="bi bi-camera"></i>
                            {resolvedImage ? 'Change Photo' : 'Add Photo'}
                        </label>
                        <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="customer-profile-file-input"
                        />
                    </div>

                    <div className="customer-profile-party-type-container">
                        <div className="customer-profile-party-type-label">
                            <i className="bi bi-people me-2"></i>
                            Change Party
                        </div>
                        <div className="customer-profile-party-type-buttons">
                            <button
                                type="button"
                                className={`customer-profile-party-type-button ${partyType === 'customer' ? 'customer-profile-active-party-type-button' : ''}`}
                                onClick={() => handlePartyTypeChange('customer')}
                            >
                                <i className="bi bi-person me-1"></i>
                                Customer
                            </button>
                            <button
                                type="button"
                                className={`customer-profile-party-type-button ${partyType === 'supplier' ? 'customer-profile-active-party-type-button' : ''}`}
                                onClick={() => handlePartyTypeChange('supplier')}
                            >
                                <i className="bi bi-truck me-1"></i>
                                Supplier
                            </button>
                        </div>
                    </div>

                    <div className="customer-profile-section-divider"></div>

                    <h3 className="customer-profile-section-title">
                        <i className="bi bi-person-badge me-2"></i>
                        Supplier Info
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="customer-profile-form-row">
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-person me-1"></i>
                                    Supplier Name <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="supplierName"
                                    value={formData.supplierName}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter supplier name"
                                    required
                                />
                            </div>
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-telephone me-1"></i>
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter mobile number"
                                />
                            </div>
                        </div>

                        <div className="customer-profile-form-row">
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-building me-1"></i>
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter company name"
                                />
                            </div>
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-card-text me-1"></i>
                                    PAN Number
                                </label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter PAN number"
                                />
                            </div>
                        </div>

                        <div className="customer-profile-form-row">
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-geo-alt me-1"></i>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter address"
                                />
                            </div>
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-envelope me-1"></i>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div className="customer-profile-form-row">
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-person-badge me-1"></i>
                                    Contact Person
                                </label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter contact person name"
                                />
                            </div>
                        </div>

                        <div className="customer-profile-section-divider"></div>

                        <h3 className="customer-profile-section-title">
                            <i className="bi bi-gear me-2"></i>
                            Supplier Settings
                        </h3>

                        <div className="customer-profile-checkbox-container">
                            <input
                                type="checkbox"
                                id="supplierSmsSetting"
                                name="supplierSmsSetting"
                                checked={settings.supplierSmsSetting}
                                onChange={handleCheckboxChange}
                                className="customer-profile-checkbox"
                            />
                            <label htmlFor="supplierSmsSetting" className="customer-profile-checkbox-label">
                                <i className="bi bi-chat-dots me-2"></i>
                                Supplier SMS Setting
                            </label>
                        </div>

                        <div className="customer-profile-checkbox-container">
                            <input
                                type="checkbox"
                                id="smsLanguage"
                                name="smsLanguage"
                                checked={settings.smsLanguage}
                                onChange={handleCheckboxChange}
                                className="customer-profile-checkbox"
                            />
                            <label htmlFor="smsLanguage" className="customer-profile-checkbox-label">
                                <i className="bi bi-translate me-2"></i>
                                SMS Language
                            </label>
                        </div>

                        <div className="customer-profile-checkbox-container">
                            <input
                                type="checkbox"
                                id="transactionHistoryCheck"
                                name="transactionHistoryCheck"
                                checked={settings.transactionHistoryCheck}
                                onChange={handleCheckboxChange}
                                className="customer-profile-checkbox"
                            />
                            <label htmlFor="transactionHistoryCheck" className="customer-profile-checkbox-label">
                                <i className="bi bi-clock-history me-2"></i>
                                Transaction History Check
                            </label>
                        </div>

                        <div className="customer-profile-button-container">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="customer-profile-delete-button"
                                disabled={isDeleting || isSubmitting}
                            >
                                <i className="bi bi-trash"></i>
                                Delete
                            </button>
                            <button
                                type="submit"
                                className="customer-profile-save-button"
                                disabled={isSubmitting || isDeleting}
                            >
                                <i className="bi bi-check-circle"></i>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={performDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete this ${partyType}? This action cannot be undone.`}
                confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete'}
                cancelText="No, Keep it"
                type="danger"
            />
        </div>
    );
};

export default SupplierProfile;