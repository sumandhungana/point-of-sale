import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchCustomerData, updateCustomer, deleteCustomer } from '../services/customerService';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/CustomerProfile.css';

interface CustomerData {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    company: string | null;
    pan: string | null;
    contactPerson: string | null;
    isSupplier: boolean;
    createdAt: string;
    updatedAt: string;
    bankAccount: string | null;
    cashBalance: number;
    profileImage: string | null;
    customerSmsSetting: boolean;
    smsLanguage: boolean;
    transactionHistoryCheck: boolean;
}

export const CustomerProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [customerData, setCustomerData] = useState<CustomerData>({
        id: parseInt(id || '0'),
        name: '',
        phone: null,
        email: null,
        address: null,
        company: null,
        pan: null,
        contactPerson: null,
        isSupplier: false,
        createdAt: '',
        updatedAt: '',
        bankAccount: null,
        cashBalance: 0,
        profileImage: null,
        customerSmsSetting: false,
        smsLanguage: false,
        transactionHistoryCheck: false
    });

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                if (!id) return;
                const data = await fetchCustomerData(id);
                setCustomerData(data);
                setFormData({
                    customerName: data.name,
                    mobileNumber: data.phone || '',
                    address: data.address || '',
                    panNumber: data.pan || '',
                    bankAccount: data.bankAccount || '',
                    cash: data.cashBalance || 0,
                });
                setSettings({
                    customerSmsSetting: data.customerSmsSetting,
                    smsLanguage: data.smsLanguage,
                    transactionHistoryCheck: data.transactionHistoryCheck,
                });
                setProfileImage(data.profileImage);
                setPartyType(data.isSupplier ? 'supplier' : 'customer');
            } catch (error) {
                console.error('Error fetching customer data:', error);
                toast.error('Failed to fetch customer data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    const [partyType, setPartyType] = useState<'customer' | 'supplier'>(customerData.isSupplier ? 'supplier' : 'customer');
    const [profileImage, setProfileImage] = useState<string | null>(customerData.profileImage);
    const [formData, setFormData] = useState({
        customerName: customerData.name,
        mobileNumber: customerData.phone || '',
        address: customerData.address || '',
        panNumber: customerData.pan || '',
        bankAccount: customerData.bankAccount || '',
        cash: customerData.cashBalance || 0,
    });
    const [settings, setSettings] = useState({
        customerSmsSetting: customerData.customerSmsSetting,
        smsLanguage: customerData.smsLanguage,
        transactionHistoryCheck: customerData.transactionHistoryCheck,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        try {
            const customerId = id || '0';
            await updateCustomer(customerId, {
                id: parseInt(customerId),
                name: formData.customerName,
                phone: formData.mobileNumber || null,
                email: customerData.email,
                address: formData.address || null,
                company: customerData.company,
                pan: formData.panNumber || null,
                contactPerson: customerData.contactPerson,
                bankAccount: formData.bankAccount || null,
                cashBalance: String(formData.cash),
                profileImage: profileImage,
                customerSmsSetting: settings.customerSmsSetting,
                smsLanguage: settings.smsLanguage,
                transactionHistoryCheck: settings.transactionHistoryCheck
            });
            toast.success('Customer updated successfully');
            navigate(`/parties/customers/statements/${customerId}`);
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error('Failed to update customer');
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
        if (!id) return;
        
        try {
            await deleteCustomer(id);
            toast.success(`${customerData.isSupplier ? 'Supplier' : 'Customer'} deleted successfully`);
            
            // Navigate back to the appropriate list page
            if (customerData.isSupplier) {
                navigate('/parties/suppliers');
            } else {
                navigate('/parties/customers');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error(`Failed to delete ${customerData.isSupplier ? 'supplier' : 'customer'}`);
        }
    };



    return (
        <div style={{minHeight: '100vh', background: '#f8f9fa'}}>
            <Sidebar />
            <button 
                className="customer-profile-back-button"
                onClick={() => navigate(-1)}
            >
                <i className="bi bi-arrow-left"></i>
                Back
            </button>
            <main className="customer-profile-main-content">
                <div className="customer-profile-container">
                    <div className="customer-profile-image-container">
                        {profileImage ? (
                            <img 
                                src={profileImage} 
                                alt="Profile" 
                                className="customer-profile-image"
                            />
                        ) : (
                            <div className="customer-profile-image-placeholder">
                                <i className="bi bi-person"></i>
                            </div>
                        )}
                        <label htmlFor="profile-image" className="customer-profile-add-photo-button">
                            <i className="bi bi-camera"></i>
                            Add Photo
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
                                className={`customer-profile-party-type-button ${partyType === 'customer' ? 'customer-profile-active-party-type-button' : ''}`}
                                onClick={() => handlePartyTypeChange('customer')}
                            >
                                <i className="bi bi-person me-1"></i>
                                Customer
                            </button>
                            <button
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
                                    Add Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter address"
                                    required
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
                                    Add Bank A/c
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
                                    Add Cash
                                </label>
                                <input
                                    type="text"
                                    name="cash"
                                    value={formData.cash}
                                    onChange={handleChange}
                                    className="customer-profile-input"
                                    placeholder="Enter cash amount"
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
                message={`Are you sure you want to delete this ${customerData.isSupplier ? 'supplier' : 'customer'}? This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="No, Keep it"
                type="danger"
            />
        </div>
    );
}; 