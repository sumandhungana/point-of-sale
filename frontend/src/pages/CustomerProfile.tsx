import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    fetchSingleCustomerData,
    updateCustomer,
    deleteSingleCustomer,
    Customer
} from '../features/services/customerService';
import ConfirmationModal from '../components/ConfirmationModal';
import { resolveImageSrc } from '../utils/imageResolver';
import '../styles/CustomerProfile.css';

/**
 * Avatar that validates the resolved image before rendering it.
 * Shows a person icon if the image is missing or fails to load.
 */
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

export const CustomerProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);

    const isValidId = Boolean(id && id !== 'undefined' && !isNaN(Number(id)));
    const numericId = isValidId ? parseInt(id!, 10) : 0;

    const [customerData, setCustomerData] = useState<Customer>({
        id: numericId,
        name: '',
        phone: '',
        email: '',
        address: '',
        company: '',
        pan: '',
        contactPerson: '',
        isSupplier: false,
        createdAt: '',
        updatedAt: '',
        bankAccount: '',
        cashBalance: 0,
        profileImage: '',
        customerSmsSetting: false,
        smsLanguage: false,
        transactionHistoryCheck: false
    });

    const [partyType, setPartyType] = useState<'customer' | 'supplier'>('customer');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        customerName: '',
        mobileNumber: '',
        address: '',
        panNumber: '',
        bankAccount: '',
        cash: 0,
    });
    const [settings, setSettings] = useState({
        customerSmsSetting: false,
        smsLanguage: false,
        transactionHistoryCheck: false,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const populateForm = (data: Customer) => {
        const resolvedCustId = data.id ?? (data as any).customerId ?? numericId;
        setCustomerData({
            ...data,
            id: Number(resolvedCustId)
        });
        setFormData({
            customerName: data.name || '',
            mobileNumber: data.phone || '',
            address: data.address || '',
            panNumber: data.pan || '',
            bankAccount: data.bankAccount || '',
            cash: data.cashBalance || 0,
        });
        setSettings({
            customerSmsSetting: Boolean(data.customerSmsSetting),
            smsLanguage: Boolean(data.smsLanguage),
            transactionHistoryCheck: Boolean(data.transactionHistoryCheck),
        });
        setProfileImage(data.profileImage || null);
        setPartyType(data.isSupplier ? 'supplier' : 'customer');
    };

    useEffect(() => {
        if (location.state?.customer) {
            populateForm(location.state.customer as Customer);
            setIsLoading(false);
            return;
        }

        if (!isValidId) {
            console.error('CustomerProfile: Invalid id in URL:', id);
            toast.error('Customer ID is missing in URL');
            setIsLoading(false);
            return;
        }

        const fetchCustomer = async () => {
            try {
                setIsLoading(true);
                const data: any = await fetchSingleCustomerData(id!);

                if (!data) {
                    toast.error('Customer not found');
                    return;
                }

                populateForm(data);
            } catch (error: any) {
                console.error('Error fetching customer data:', error);
                toast.error(error?.message || 'Failed to fetch customer data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomer();
    }, [id, location.state, isValidId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setProfileImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handlePartyTypeChange = (type: 'customer' | 'supplier') => {
        setPartyType(type);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
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
        const activeId = numericId || customerData.id || (customerData as any).customerId;

        if (!activeId) {
            toast.error('Cannot update: Missing customer ID');
            return;
        }

        try {
            await updateCustomer({
                customerId: Number(activeId),
                name: formData.customerName,
                phone: formData.mobileNumber || undefined,
                email: customerData.email || undefined,
                address: formData.address || undefined,
                company: customerData.company || undefined,
                pan: formData.panNumber || undefined,
                contactPerson: customerData.contactPerson || undefined,
                bankAccount: formData.bankAccount || undefined,
                cashBalance: Number(formData.cash) || 0,
                profileImage: profileImage || undefined
            });

            toast.success('Customer updated successfully');
            navigate(`/parties/customers/statements/${activeId}`);
        } catch (error: any) {
            console.error('Error updating customer:', error);
            toast.error(error?.message || 'Failed to update customer');
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
        const activeId = numericId || customerData.id || (customerData as any).customerId;
        if (!activeId) {
            toast.error('Cannot delete: Missing customer ID');
            return;
        }

        try {
            const res = await deleteSingleCustomer(activeId);
            toast.success(res?.message || `${partyType === 'supplier' ? 'Supplier' : 'Customer'} deleted successfully`);

            if (partyType === 'supplier') {
                navigate('/parties/suppliers');
            } else {
                navigate('/parties/customers');
            }
        } catch (error: any) {
            console.error('Error deleting customer:', error);
            toast.error(error?.message || `Failed to delete ${partyType}`);
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
                <Sidebar />
                <main className="customer-profile-main-content">
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#6c757d' }}>
                        Loading customer details...
                    </div>
                </main>
            </div>
        );
    }

    const resolvedImage = resolveImageSrc(profileImage);

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
                        <ProfileAvatar name={customerData.name} imageSrc={resolvedImage} />

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
                        Personal Info
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="customer-profile-form-row">
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-person me-1"></i>
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter customer name"
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
                                    required
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
                                    <i className="bi bi-bank me-1"></i>
                                    Bank A/c
                                </label>
                                <input
                                    type="text"
                                    name="bankAccount"
                                    value={formData.bankAccount}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter bank account"
                                />
                            </div>
                            <div className="customer-profile-form-group">
                                <label className="customer-profile-label">
                                    <i className="bi bi-cash-coin me-1"></i>
                                    Cash Balance
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cash"
                                    value={formData.cash}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="customer-profile-section-divider"></div>

                        <h3 className="customer-profile-section-title">
                            <i className="bi bi-gear me-2"></i>
                            Customer Settings
                        </h3>

                        <div className="customer-profile-checkbox-container">
                            <input
                                type="checkbox"
                                id="customerSmsSetting"
                                name="customerSmsSetting"
                                checked={settings.customerSmsSetting}
                                onChange={handleCheckboxChange}
                                className="customer-profile-checkbox"
                            />
                            <label htmlFor="customerSmsSetting" className="customer-profile-checkbox-label">
                                <i className="bi bi-chat-dots me-2"></i>
                                Customer SMS Setting
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
                            <button type="button" onClick={handleDelete} className="customer-profile-delete-button">
                                <i className="bi bi-trash"></i>
                                Delete
                            </button>
                            <button type="submit" className="customer-profile-save-button">
                                <i className="bi bi-check-circle"></i>
                                Save
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
                confirmText="Yes, Delete"
                cancelText="No, Keep it"
                type="danger"
            />
        </div>
    );
};