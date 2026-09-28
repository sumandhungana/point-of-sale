import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
    createOrganization,
    CreateOrganization,
} from '../../services/organizationService'; // Adjust import path as needed
import { getRoles, RoleResponse } from "@/services/roleService";
import '../../../styles/AddKhataBook.css';

export const AddOrganization = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);

    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        confirmPassword: '', // Added field
        gmail: '',
        phoneNumber: '',
        organizationEmail: '',
        organizationContactNumber: '',
        organizationName: '',
        panVatNumber: '',
        branch: '',
        organizationType: '',
        organizationAddress: '',
        notes: '',
        role: '' // Stores role ID string
    });

    // Fetch roles on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            setIsLoadingRoles(true);
            try {
                const roleList = await getRoles();
                setRoles(roleList);
            } catch (error) {
                console.error('Error fetching roles:', error);
                toast.error(
                    error instanceof Error ? error.message : 'Failed to load roles'
                );
            } finally {
                setIsLoadingRoles(false);
            }
        };

        void fetchRoles();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (!formData.userName.trim()) {
            toast.error('Username is required!');
            return;
        }
        if (!formData.password.trim()) {
            toast.error('Password is required!');
            return;
        }
        if (!formData.confirmPassword.trim()) {
            toast.error('Please confirm your password!');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        if (!formData.organizationName.trim()) {
            toast.error('Organization Name is required!');
            return;
        }
        if (!formData.role) {
            toast.error('Please select a role!');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: CreateOrganization = {
                userName: formData.userName,
                phoneNumber: formData.phoneNumber,
                gmail: formData.gmail,
                password: formData.password,
                organizationEmail: formData.organizationEmail,
                organizationContactNumber: formData.organizationContactNumber,
                organizationName: formData.organizationName,
                organizationAddress: formData.organizationAddress,
                panVatNumber: formData.panVatNumber,
                branch: formData.branch,
                organizationType: formData.organizationType,
                notes: formData.notes,
                role: formData.role // Sends role ID
            };

            const response = await createOrganization(payload);
            toast.success(response?.message || 'Organization registered successfully!');
            navigate(-1);
        } catch (error) {
            console.error('Error registering Organization:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to register Organization. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-khatabook-page-wrapper">
            <Sidebar />
            <div className="add-khatabook-page-main">
                <Navbar />
                <div className="add-khata-book-container">
                    <form onSubmit={handleSubmit}>
                        {/*/!* User Credentials & Personal Info *!/*/}
                        {/*<div className="add-khata-book-section mb-4">*/}
                        {/*    <h2 className="add-khata-book-section-title">*/}
                        {/*        <i className="bi bi-person-badge me-2"></i>*/}
                        {/*        User Credentials*/}
                        {/*    </h2>*/}
                        {/*    <div className="add-khata-book-form-grid">*/}
                        {/*        <div className="add-khata-book-form-group">*/}
                        {/*            <label className="add-khata-book-label required">*/}
                        {/*                <i className="bi bi-person me-1"></i>*/}
                        {/*                Username <span>*</span>*/}
                        {/*            </label>*/}
                        {/*            <input*/}
                        {/*                type="text"*/}
                        {/*                name="userName"*/}
                        {/*                value={formData.userName}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                className="add-khata-book-input"*/}
                        {/*                placeholder="Enter Username"*/}
                        {/*                required*/}
                        {/*            />*/}
                        {/*        </div>*/}

                        {/*        <div className="add-khata-book-form-group">*/}
                        {/*            <label className="add-khata-book-label required">*/}
                        {/*                <i className="bi bi-key me-1"></i>*/}
                        {/*                Password <span>*</span>*/}
                        {/*            </label>*/}
                        {/*            <input*/}
                        {/*                type="password"*/}
                        {/*                name="password"*/}
                        {/*                value={formData.password}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                className="add-khata-book-input"*/}
                        {/*                placeholder="Enter Password"*/}
                        {/*                required*/}
                        {/*            />*/}
                        {/*        </div>*/}

                        {/*        <div className="add-khata-book-form-group">*/}
                        {/*            <label className="add-khata-book-label required">*/}
                        {/*                <i className="bi bi-check2-square me-1"></i>*/}
                        {/*                Confirm Password <span>*</span>*/}
                        {/*            </label>*/}
                        {/*            <input*/}
                        {/*                type="password"*/}
                        {/*                name="confirmPassword"*/}
                        {/*                value={formData.confirmPassword}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                className="add-khata-book-input"*/}
                        {/*                placeholder="Re-enter Password"*/}
                        {/*                required*/}
                        {/*            />*/}
                        {/*        </div>*/}

                        {/*        <div className="add-khata-book-form-group">*/}
                        {/*            <label className="add-khata-book-label">*/}
                        {/*                <i className="bi bi-envelope me-1"></i>*/}
                        {/*                User Email*/}
                        {/*            </label>*/}
                        {/*            <input*/}
                        {/*                type="email"*/}
                        {/*                name="gmail"*/}
                        {/*                value={formData.gmail}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                className="add-khata-book-input"*/}
                        {/*                placeholder="user@gmail.com"*/}
                        {/*            />*/}
                        {/*        </div>*/}

                        {/*        <div className="add-khata-book-form-group">*/}
                        {/*            <label className="add-khata-book-label">*/}
                        {/*                <i className="bi bi-telephone me-1"></i>*/}
                        {/*                Phone Number*/}
                        {/*            </label>*/}
                        {/*            <input*/}
                        {/*                type="text"*/}
                        {/*                name="phoneNumber"*/}
                        {/*                value={formData.phoneNumber}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                className="add-khata-book-input"*/}
                        {/*                placeholder="Mobile Number"*/}
                        {/*            />*/}
                        {/*        </div>*/}

                        {/*        <div className="add-khata-book-form-group">*/}
                        {/*            <label className="add-khata-book-label required">*/}
                        {/*                <i className="bi bi-shield-lock me-1"></i>*/}
                        {/*                Role <span>*</span>*/}
                        {/*            </label>*/}
                        {/*            <select*/}
                        {/*                name="role"*/}
                        {/*                value={formData.role}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                className="add-khata-book-select"*/}
                        {/*                required*/}
                        {/*                disabled={isLoadingRoles}*/}
                        {/*            >*/}
                        {/*                <option value="">*/}
                        {/*                    {isLoadingRoles ? 'Loading roles...' : 'Select role'}*/}
                        {/*                </option>*/}
                        {/*                {roles.map((r) => (*/}
                        {/*                    <option key={r.id} value={r.id}>*/}
                        {/*                        {r.name}*/}
                        {/*                    </option>*/}
                        {/*                ))}*/}
                        {/*            </select>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Organization Info */}
                        <div className="add-khata-book-section">
                            <h2 className="add-khata-book-section-title">
                                <i className="bi bi-building me-2"></i>
                                Organization Details
                            </h2>
                            <div className="add-khata-book-form-grid">
                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label required">
                                        <i className="bi bi-building me-1"></i>
                                        Organization Name <span>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Business / Shop Name"
                                        required
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-telephone me-1"></i>
                                        Organization Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationContactNumber"
                                        value={formData.organizationContactNumber}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Business Contact Number"
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-envelope me-1"></i>
                                        Organization Email
                                    </label>
                                    <input
                                        type="email"
                                        name="organizationEmail"
                                        value={formData.organizationEmail}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Business Email Address"
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-card-text me-1"></i>
                                        PAN / VAT Number
                                    </label>
                                    <input
                                        type="text"
                                        name="panVatNumber"
                                        value={formData.panVatNumber}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Enter PAN/VAT Number"
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-diagram-3 me-1"></i>
                                        Branch
                                    </label>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="e.g. Kathmandu, Pokhara"
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-briefcase me-1"></i>
                                        Organization Type
                                    </label>
                                    <select
                                        name="organizationType"
                                        value={formData.organizationType}
                                        onChange={handleInputChange}
                                        className="add-khata-book-select"
                                    >
                                        <option value="">Select organization type</option>
                                        <option value="Individual">Individual</option>
                                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                                        <option value="Partnership">Partnership</option>
                                        <option value="Private Limited">Private Limited</option>
                                        <option value="Public Limited">Public Limited</option>
                                        <option value="Non Profit">Non Profit Organization</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="add-khata-book-form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="add-khata-book-label required">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        Organization Address <span>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationAddress"
                                        value={formData.organizationAddress}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Physical address"
                                        required
                                    />
                                </div>

                                <div className="add-khata-book-form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-journal-text me-1"></i>
                                        Notes
                                    </label>
                                    <input
                                        type="text"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Optional onboarding remarks"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* User Credentials & Personal Info */}
                        <div className="add-khata-book-section mb-4">
                            <h2 className="add-khata-book-section-title">
                                <i className="bi bi-person-badge me-2"></i>
                                User Credentials
                            </h2>
                            <div className="add-khata-book-form-grid">
                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label required">
                                        <i className="bi bi-person me-1"></i>
                                        Username <span>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Enter Username"
                                        required
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label required">
                                        <i className="bi bi-key me-1"></i>
                                        Password <span>*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Enter Password"
                                        required
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label required">
                                        <i className="bi bi-check2-square me-1"></i>
                                        Confirm Password <span>*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Re-enter Password"
                                        required
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-envelope me-1"></i>
                                        User Email
                                    </label>
                                    <input
                                        type="email"
                                        name="gmail"
                                        value={formData.gmail}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="user@gmail.com"
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label">
                                        <i className="bi bi-telephone me-1"></i>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="add-khata-book-input"
                                        placeholder="Mobile Number"
                                    />
                                </div>

                                <div className="add-khata-book-form-group">
                                    <label className="add-khata-book-label required">
                                        <i className="bi bi-shield-lock me-1"></i>
                                        Role <span>*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="add-khata-book-select"
                                        required
                                        disabled={isLoadingRoles}
                                    >
                                        <option value="">
                                            {isLoadingRoles ? 'Loading roles...' : 'Select role'}
                                        </option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="add-khata-book-save-button mt-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="bi bi-arrow-clockwise spin me-2"></i>
                                    Onboarding...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-2"></i>
                                    Onboard Organization
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};