import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { createCustomer } from '../services/customerService';
import '../styles/AddSupplier.css';

export const AddSupplier = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        company: '',
        pan: '',
        city: '',
        contactPerson: '',
        isSupplier: true
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await createCustomer(formData);
            setAlertMessage('Supplier added successfully!');
            setAlertType('success');
            setShowAlert(true);
            
            // Wait for 2 seconds before navigating
            setTimeout(() => {
                navigate('/parties/suppliers');
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
        navigate('/parties/suppliers');
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
       mainContent: {
            padding: '2rem',
            marginTop: '64px',
            maxWidth: 'calc(100% - 500px)',
            marginRight: '500px',
            width: '100%',
        },
        formTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '2rem',
        },
        formRow: {
            display: 'flex',
            gap: '2rem',
            marginBottom: '1.5rem',
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
        buttonContainer: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
        },
        submitButton: {
            background: '#dc4c39',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            '&:hover': {
                background: '#c82333',
            },
            '&:disabled': {
                background: '#e9a8a8',
                cursor: 'not-allowed',
            },
        },
        cancelButton: {
            background: '#6c757d',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            '&:hover': {
                background: '#5a6268',
            },
        },
    };

    return (
        <div className="add-supplier-page-wrapper">
            <Sidebar />
           
            <main className="add-supplier-main-content">
                <div className="add-supplier-form-container">
                    <h2 className="add-supplier-form-title">
                        <i className="bi bi-plus-circle"></i>
                        Add New Supplier
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="add-supplier-form-row">
                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-person me-1"></i>
                                    Supplier Name
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
                                    required
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
                                    required
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
                                    required
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
                                    required
                                />
                            </div>
                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-geo me-1"></i>
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="add-supplier-input"
                                    placeholder="Enter city"
                                    required
                                />
                            </div>
                        </div>

                        <div className="add-supplier-form-row">
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
                                    required
                                />
                            </div>
                            <div className="add-supplier-form-group">
                                <label className="add-supplier-label">
                                    <i className="bi bi-person-badge me-1"></i>
                                    Contact Person
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
                                        <i className="bi bi-plus-circle"></i>
                                        Add Supplier
                                    </>
                                )}
                            </button>
                            <button 
                                type="button" 
                                className="add-supplier-cancel-button"
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