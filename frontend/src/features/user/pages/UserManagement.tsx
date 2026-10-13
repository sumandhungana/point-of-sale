import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { User, fetchUsers, addUser, deleteUser, AddUserRequest } from '../../services/userService';
import { fetchRoles, Role } from '@/services/permissionService';
import { getAllOrganization, GetAllMember } from '@/features/services/organizationService';
import ViewUserModal from '../components/ViewUserModal';
import { toast } from 'react-toastify';
import '@/styles/UserManagement.css';

// Common Portal Modal Component
interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [organizations, setOrganizations] = useState<GetAllMember[]>([]);
    const [selectedOrgFilter, setSelectedOrgFilter] = useState<number | ''>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Add/Edit Form State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [roleId, setRoleId] = useState<number | string>('');
    const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
    const [status, setStatus] = useState<boolean>(true); // true = ACTIVE, false = INACTIVE
    
    // Expandable Password Form State
    const [isPasswordExpanded, setIsPasswordExpanded] = useState<boolean>(true);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const [submitting, setSubmitting] = useState<boolean>(false);

    // View User Details State
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

    useEffect(() => {
        loadData();
    }, [selectedOrgFilter]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const memberIdParam = selectedOrgFilter ? Number(selectedOrgFilter) : undefined;
            const [fetchedUsers, fetchedRoles, fetchedOrgs] = await Promise.all([
                fetchUsers(memberIdParam),
                fetchRoles(),
                getAllOrganization(),
            ]);
            setUsers(fetchedUsers || []);
            setAvailableRoles(fetchedRoles || []);
            setOrganizations(fetchedOrgs || []);
        } catch (err: any) {
            console.error('Failed to load user data:', err);
            setError(err?.message || 'Failed to load user records. Please check your network.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingUserId(null);
        setUserName('');
        setEmail('');
        setPhoneNumber('');
        setRoleId(availableRoles.length > 0 ? availableRoles[0].id : '');
        setSelectedMemberId(
            selectedOrgFilter !== ''
                ? selectedOrgFilter
                : organizations.length > 0
                ? organizations[0].id
                : ''
        );
        setStatus(true); // Default to ACTIVE
        setPassword('');
        setConfirmPassword('');
        setIsPasswordExpanded(true); // Expand password form when adding user
        setShowPassword(false);
        setShowConfirmPassword(false);
        setError('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUserId(user.id || user.userId);
        setUserName(user.userName);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber || '');
        const matchedRole = availableRoles.find((r) => r.name === user.role || String(r.id) === String(user.role));
        setRoleId(matchedRole ? matchedRole.id : user.role);
        setSelectedMemberId(user.memberId || (selectedOrgFilter !== '' ? selectedOrgFilter : ''));
        setStatus(user.isActive);
        setPassword('');
        setConfirmPassword('');
        setIsPasswordExpanded(false); // Collapsed by default during edit
        setError('');
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (user: User) => {
        setViewingUser(user);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingUser(null);
    };

    const handleDeleteUser = async (userId: number, name: string) => {
        if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) {
            return;
        }

        setError('');
        try {
            await deleteUser(userId);
            toast.success(`User "${name}" removed successfully.`);
            await loadData();
        } catch (err: any) {
            console.error('Failed to delete user:', err);
            setError(err?.message || `Failed to delete user "${name}".`);
            toast.error(err?.message || `Failed to delete user "${name}".`);
        }
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedMemberId) {
            setError('Please select a Member / Organization for this user.');
            toast.error('Please select a Member / Organization.');
            return;
        }

        if (!userName.trim()) {
            setError('Username is required.');
            toast.error('Username is required.');
            return;
        }

        if (!email.trim()) {
            setError('Email address is required.');
            toast.error('Email address is required.');
            return;
        }

        if (!roleId) {
            setError('Please assign a valid role to the user.');
            toast.error('Please assign a valid role.');
            return;
        }

        // Validate password when adding a user or if password field is populated
        if (!editingUserId || password.trim().length > 0) {
            if (!password || password.trim().length < 6) {
                setError('Password must be at least 6 characters long.');
                toast.error('Password must be at least 6 characters long.');
                setIsPasswordExpanded(true);
                return;
            }

            if (password !== confirmPassword) {
                setError('Password and Confirm Password do not match.');
                toast.error('Password and Confirm Password do not match.');
                setIsPasswordExpanded(true);
                return;
            }
        }

        setSubmitting(true);

        const payload: AddUserRequest = {
            userName: userName.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim() || undefined,
            role: String(roleId),
            enable: status,
            password: password.trim(),
            memberId: Number(selectedMemberId),
        };

        try {
            await addUser(payload);
            toast.success(editingUserId ? 'User updated successfully!' : 'User enrolled successfully under selected member!');
            setIsModalOpen(false);
            await loadData();
        } catch (err: any) {
            console.error('Failed to save user:', err);
            const msg = err?.message || 'Failed to save user record. Please check inputs and try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const activeUsersCount = users.filter((u) => u.isActive).length;

    // Helper to get Member Name for display
    const getMemberName = (memberId?: number | null) => {
        if (!memberId) return null;
        const org = organizations.find((o) => o.id === memberId);
        return org ? org.organizationName : `Member #${memberId}`;
    };

    return (
        <div className="user-page-wrapper">
            <Sidebar />
            <div className="user-container">
                <Navbar />

                <div className="user-content">
                    {/* Error Toast Banner */}
                    {error && (
                        <div className="alert-banner error">
                            <span>{error}</span>
                            <button className="alert-close-btn" onClick={() => setError('')}>
                                &times;
                            </button>
                        </div>
                    )}

                    {/* Page Header */}
                    <div className="user-page-header">
                        <div>
                            <h2>User Management</h2>
                            <p>Manage system users, assigned roles, and member organization enrollments</p>
                        </div>

                        <div className="header-action-group">
                            {organizations.length > 0 && (
                                <select
                                    className="org-filter-select"
                                    value={selectedOrgFilter}
                                    onChange={(e) => setSelectedOrgFilter(e.target.value ? Number(e.target.value) : '')}
                                    title="Filter users by member organization"
                                >
                                    <option value="">All Member Organizations ({organizations.length})</option>
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id}>
                                            🏢 {org.organizationName}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <button className="btn-primary" onClick={handleOpenAddModal}>
                                + Add New User
                            </button>
                        </div>
                    </div>

                    {/* Summary Stat Cards */}
                    <div className="user-stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon-box blue-bg">👥</div>
                            <div className="stat-info">
                                <span className="stat-label">TOTAL USERS</span>
                                <span className="stat-value blue-text">{users.length}</span>
                            </div>
                        </div>

                        <div className="stat-card green">
                            <div className="stat-icon-box green-bg">✅</div>
                            <div className="stat-info">
                                <span className="stat-label">ACTIVE ACCOUNTS</span>
                                <span className="stat-value green-text">{activeUsersCount}</span>
                            </div>
                        </div>

                        <div className="stat-card teal">
                            <div className="stat-icon-box teal-bg">🏢</div>
                            <div className="stat-info">
                                <span className="stat-label">ORGANIZATIONS</span>
                                <span className="stat-value teal-text">{organizations.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* User List Cards */}
                    <div className="role-list-container">
                        {loading ? (
                            <div className="loading-state">Loading user directory...</div>
                        ) : users.length === 0 ? (
                            <div className="empty-state">
                                No users found for this selection. Click "+ Add New User" to enroll a user.
                            </div>
                        ) : (
                            users.map((u) => {
                                const displayName = u.userName || (u as any).fullName || 'User';
                                const firstLetter = displayName.charAt(0).toUpperCase();
                                const memberName = getMemberName(u.memberId);

                                return (
                                    <div className="role-item-card" key={u.id || u.userId}>
                                        <div className="role-avatar">{firstLetter}</div>

                                        <div className="role-main-details">
                                            <div className="role-title-row">
                                                <span className="role-card-name">{displayName}</span>
                                                <span className="role-id-badge">#{u.id || u.userId}</span>
                                                <span className={`user-status-pill ${u.isActive ? 'active' : 'inactive'}`}>
                                                    {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                                {memberName && (
                                                    <span className="permission-badge" style={{ backgroundColor: '#f1f5f9', color: '#021861' }}>
                                                        🏢 {memberName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="role-sub-text">
                                                <span>✉️ {u.email}</span>
                                                <span>📞 {u.phoneNumber || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="role-card-right">
                                            <div className="permission-badge-wrapper">
                                                <span className="permission-badge active">
                                                    🛡️ {u.role}
                                                </span>
                                                <button className="btn-view" onClick={() => handleOpenViewModal(u)}>
                                                    👁 View
                                                </button>
                                            </div>

                                            <div className="vertical-divider"></div>

                                            <div className="action-buttons-cell">
                                                <button className="btn-edit" onClick={() => handleOpenEditModal(u)}>
                                                    Edit
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDeleteUser(u.id || u.userId, displayName)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* View Details Modal */}
                <ViewUserModal
                    isOpen={isViewModalOpen}
                    onClose={handleCloseViewModal}
                    user={viewingUser}
                />

                {/* Add / Edit User Modal */}
                <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="modal-header">
                        <div>
                            <h3 className="modal-title">{editingUserId ? 'Edit User' : 'Create New User'}</h3>
                            <p className="modal-subtitle">
                                Provide account details, set security credentials, and associate with member organization
                            </p>
                        </div>
                        <button
                            type="button"
                            className="form-close-btn"
                            onClick={() => setIsModalOpen(false)}
                            aria-label="Close"
                            title="Close"
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmitUser} className="modal-form-wrapper">
                        <div className="modal-body custom-scroll">
                            <div className="form-section">
                                {/* Member / Organization Selection */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Member Organization <span className="required-star">*</span>
                                    </label>
                                    <select
                                        className="form-input"
                                        value={selectedMemberId}
                                        onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                                        required
                                    >
                                        <option value="" disabled>Select Member Organization...</option>
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.id}>
                                                🏢 {org.organizationName} (#{org.id}){org.branch ? ` - ${org.branch}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="form-helper-text">
                                        User account will be stored and linked on the basis of this member.
                                    </small>
                                </div>

                                {/* Username */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Username <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Suman Dhungana"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Email Address <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="e.g. suman@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 9869047520"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>

                                {/* Assign Role */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Assign Role <span className="required-star">*</span>
                                    </label>
                                    <select
                                        className="form-input"
                                        value={roleId}
                                        onChange={(e) => setRoleId(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select a role...</option>
                                        {availableRoles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                🛡️ {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Account Status */}
                                <div className="form-group">
                                    <label className="form-label">Account Status</label>
                                    <select
                                        className="form-input"
                                        value={status ? 'ACTIVE' : 'INACTIVE'}
                                        onChange={(e) => setStatus(e.target.value === 'ACTIVE')}
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>

                                {/* EXPANDABLE PASSWORD & CONFIRM PASSWORD FORM */}
                                <div className="expandable-card">
                                    <div
                                        className="expandable-card-header"
                                        onClick={() => setIsPasswordExpanded(!isPasswordExpanded)}
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={isPasswordExpanded}
                                    >
                                        <div className="expandable-header-title">
                                            <span className="expandable-icon">🔑</span>
                                            <div>
                                                <h4 className="expandable-title">Password Credentials</h4>
                                                <p className="expandable-subtitle">
                                                    {editingUserId
                                                        ? 'Expand to change user password'
                                                        : 'Set login password & confirm password'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="expandable-toggle-action">
                                            <span className="expandable-badge">
                                                {isPasswordExpanded ? 'Collapse' : 'Expand Form'}
                                            </span>
                                            <i className={`bi ${isPasswordExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                                        </div>
                                    </div>

                                    {isPasswordExpanded && (
                                        <div className="expandable-card-body">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Password {!editingUserId && <span className="required-star">*</span>}
                                                </label>
                                                <div className="password-input-wrapper">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        className="form-input"
                                                        placeholder="Enter password (minimum 6 characters)"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required={!editingUserId}
                                                        minLength={6}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle-btn"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                    >
                                                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    Confirm Password {!editingUserId && <span className="required-star">*</span>}
                                                </label>
                                                <div className="password-input-wrapper">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        className="form-input"
                                                        placeholder="Re-enter password to confirm"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required={!editingUserId || password.length > 0}
                                                        minLength={6}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle-btn"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                                    >
                                                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                                                    </button>
                                                </div>

                                                {confirmPassword && (
                                                    <div className={`password-match-indicator ${password === confirmPassword ? 'match' : 'mismatch'}`}>
                                                        <i className={`bi ${password === confirmPassword ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} />
                                                        <span>{password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setIsModalOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-modal-submit" disabled={submitting}>
                                {submitting ? 'Saving...' : editingUserId ? 'Update User' : 'Create & Save User'}
                            </button>
                        </div>
                    </form>
                </UserModal>
            </div>
        </div>
    );
};

export default UserManagement;