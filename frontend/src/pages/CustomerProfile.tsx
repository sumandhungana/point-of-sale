import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchCustomerData, updateCustomer } from '../services/customerService';

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
        // Handle delete action here
        console.log('Delete customer profile');
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
        backButton: {
            position: 'absolute' as const,
            top: '80px',
            padding: '8px 16px',
            marginLeft: '30px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#495057',
            '&:hover': {
                background: '#e9ecef',
            },
        },
        mainContent: {
            padding: '2rem',
            marginTop: '64px',
            maxWidth: 'calc(100% - 500px)',
            marginRight: '500px',
            width: '100%',
        },
        profileContainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '800px',
            margin: '0 auto',
            '@media print': {
                boxShadow: 'none',
                padding: '0',
                maxWidth: '100%',
                pageBreakAfter: 'always',
            },
        },
        profileTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '2rem',
            textAlign: 'center' as const,
        },
        imageContainer: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            marginBottom: '2rem',
            '@media print': {
                pageBreakInside: 'avoid',
            },
        },
        profileImage: {
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover' as const,
            backgroundColor: '#e9ecef',
            marginBottom: '1rem',
            border: '3px solid #dc4c39',
        },
        addPhotoButton: {
            padding: '0.5rem 1rem',
            background: '#dc4c39',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '1rem',
            '&:hover': {
                background: '#c82333',
            },
        },
        fileInput: {
            display: 'none',
        },
        partyTypeContainer: {
            display: 'flex',
            flexDirection: 'row' as const,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '1rem',
            marginBottom: '2rem',
            gap: '1rem',
        },
        partyTypeLabel: {
            fontSize: '1rem',
            color: '#495057',
        },
        partyTypeButtons: {
            display: 'flex',
            gap: '1rem',
        },
        partyTypeButton: {
            padding: '0.5rem 1.5rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            background: 'white',
            color: '#495057',
            '&:hover': {
                background: '#f8f9fa',
            },
        },
        activePartyTypeButton: {
            background: '#dc4c39',
            color: 'white',
            border: '1px solid #dc4c39',
            '&:hover': {
                background: '#c82333',
            },
        },
        sectionDivider: {
            borderTop: '1px solid #dee2e6',
            margin: '2rem 0',
        },
        sectionTitle: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '1.5rem',
            textAlign: 'center' as const,
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #dee2e6',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        formRow: {
            display: 'flex',
            gap: '2rem',
            marginBottom: '1.5rem',
            '@media print': {
                pageBreakInside: 'avoid',
            },
        },
        formGroup: {
            flex: 1,
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            color: '#495057',
            fontWeight: '500',
        },
        input: {
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.875rem',
            '&:focus': {
                outline: 'none',
                borderColor: '#80bdff',
                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
            },
        },
        checkboxContainer: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
        },
        checkbox: {
            marginRight: '0.5rem',
        },
        checkboxLabel: {
            fontSize: '0.875rem',
            color: '#495057',
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '2rem',
            gap: '1rem',
            '@media print': {
                display: 'none',
            },
        },
        saveButton: {
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            '&:hover': {
                background: '#0069d9',
            },
        },
        deleteButton: {
            padding: '0.75rem 1.5rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            '&:hover': {
                background: '#c82333',
            },
        },
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <button 
                style={styles.backButton} 
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>
            <main style={styles.mainContent}>
                <div style={styles.profileContainer}>
                    <div style={styles.imageContainer}>
                        {profileImage ? (
                            <img 
                                src={profileImage} 
                                alt="Profile" 
                                style={styles.profileImage} 
                            />
                        ) : (
                            <div style={styles.profileImage} />
                        )}
                        <label htmlFor="profile-image" style={styles.addPhotoButton}>
                            Add Photo
                        </label>
                        <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={styles.fileInput}
                        />
                    </div>

                    <div style={styles.partyTypeContainer}>
                        <div style={styles.partyTypeLabel}>Change Party</div>
                        <div style={styles.partyTypeButtons}>
                            <button
                                style={{
                                    ...styles.partyTypeButton,
                                    ...(partyType === 'customer' ? styles.activePartyTypeButton : {}),
                                }}
                                onClick={() => handlePartyTypeChange('customer')}
                            >
                                Customer
                            </button>
                            <button
                                style={{
                                    ...styles.partyTypeButton,
                                    ...(partyType === 'supplier' ? styles.activePartyTypeButton : {}),
                                }}
                                onClick={() => handlePartyTypeChange('supplier')}
                            >
                                Supplier
                            </button>
                        </div>
                    </div>

                    <div style={styles.sectionDivider}></div>

                    <h3 style={styles.sectionTitle}>Personal Info</h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Customer Name</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Add Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>PAN Number</label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Add Bank A/c</label>
                                <input
                                    type="text"
                                    name="bankAccount"
                                    value={formData.bankAccount}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Add Cash</label>
                                <input
                                    type="text"
                                    name="cash"
                                    value={formData.cash}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.sectionDivider}></div>

                        <h3 style={styles.sectionTitle}>Customer Settings</h3>

                        <div style={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="customerSmsSetting"
                                name="customerSmsSetting"
                                checked={settings.customerSmsSetting}
                                onChange={handleCheckboxChange}
                                style={styles.checkbox}
                            />
                            <label htmlFor="customerSmsSetting" style={styles.checkboxLabel}>
                                Customer SMS Setting
                            </label>
                        </div>

                        <div style={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="smsLanguage"
                                name="smsLanguage"
                                checked={settings.smsLanguage}
                                onChange={handleCheckboxChange}
                                style={styles.checkbox}
                            />
                            <label htmlFor="smsLanguage" style={styles.checkboxLabel}>
                                SMS Language
                            </label>
                        </div>

                        <div style={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="transactionHistoryCheck"
                                name="transactionHistoryCheck"
                                checked={settings.transactionHistoryCheck}
                                onChange={handleCheckboxChange}
                                style={styles.checkbox}
                            />
                            <label htmlFor="transactionHistoryCheck" style={styles.checkboxLabel}>
                                Transaction History Check
                            </label>
                        </div>

                        <div style={styles.buttonContainer}>
                            <button type="button" onClick={handleDelete} style={styles.deleteButton}>
                                Delete
                            </button>
                            <button type="submit" style={styles.saveButton}>
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}; 