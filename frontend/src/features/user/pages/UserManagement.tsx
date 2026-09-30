// import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom';
// import { Sidebar } from '@/components/Sidebar';
// import Navbar from '@/components/Navbar';
// import { User, fetchUsers, addUser, updateUser, deleteUser } from '../../services/userService';
// import { fetchRoles, Role } from '@/services/permissionService';
// import ViewUserModal from '../components/ViewUserModal';
// // import '@/styles/RoleAndPermission.css'; // Shares same styling ecosystem
// import '@/styles/UserManagement.css'
//
// // Common Portal Modal Component
// interface UserModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     children: React.ReactNode;
// }
//
// const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, children }) => {
//     if (!isOpen) return null;
//
//     return ReactDOM.createPortal(
//         <div className="modal-overlay" onClick={onClose}>
//             <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
//                 {children}
//             </div>
//         </div>,
//         document.body
//     );
// };
//
// export const UserManagement: React.FC = () => {
//     const [users, setUsers] = useState<User[]>([]);
//     const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string>('');
//
//     // Add/Edit Form State
//     const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//     const [editingUserId, setEditingUserId] = useState<number | null>(null);
//     const [userName, setUserName] = useState<string>('');
//     const [status, setStatus] = useState<boolean>(false)
//     const [email, setEmail] = useState<string>('');
//     const [phoneNumber, setPhoneNumber] = useState<string>('');
//     const [roleId, setRoleId] = useState<number | ''>('');
//
//     const [submitting, setSubmitting] = useState<boolean>(false);
//
//     // View User Details State
//     const [viewingUser, setViewingUser] = useState<User | null>(null);
//     const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
//
//     useEffect(() => {
//         loadData();
//     }, []);
//
//     const loadData = async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const [fetchedUsers, fetchedRoles] = await Promise.all([
//                 fetchUsers(),
//                 fetchRoles(),
//             ]);
//             setUsers(fetchedUsers);
//             setAvailableRoles(fetchedRoles);
//         } catch (err) {
//             console.error('Failed to load user data:', err);
//             setError('Failed to load user records. Please check your network.');
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const handleOpenAddModal = () => {
//         setEditingUserId(null);
//         setUserName('');
//         setEmail('');
//         setPhoneNumber('');
//         setRoleId(availableRoles.length > 0 ? availableRoles[0].id : '');
//         setStatus(false);
//         setError('');
//         setIsModalOpen(true);
//     };
//
//     const handleOpenEditModal = (user: User) => {
//         setEditingUserId(user.id);
//         setUserName(user.userName);
//         setEmail(user.userId);
//         setStatus(user.isActive)
//         setPhoneNumber(user.phoneNumber || '');
//         setRoleId(user.role);
//         setStatus(user.isActive);
//         setError('');
//         setIsModalOpen(true);
//     };
//
//     const handleOpenViewModal = (user: User) => {
//         setViewingUser(user);
//         setIsViewModalOpen(true);
//     };
//
//     const handleCloseViewModal = () => {
//         setIsViewModalOpen(false);
//         setViewingUser(null);
//     };
//
//     const handleDeleteUser = async (userId: number, name: string) => {
//         if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) {
//             return;
//         }
//
//         setError('');
//         try {
//             await deleteUser(userId);
//             await loadData();
//         } catch (err) {
//             console.error('Failed to delete user:', err);
//             setError(`Failed to delete user "${name}". Please try again.`);
//         }
//     };
//
//     const handleSubmitUser = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!roleId) {
//             setError('Please assign a valid role to the user.');
//             return;
//         }
//
//         setSubmitting(true);
//         setError('');
//
//         const payload = {
//             fullName,
//             email,
//             phoneNumber,
//             roleId: Number(roleId),
//             status,
//         };
//
//         try {
//             if (editingUserId) {
//                 await updateUser(editingUserId, payload);
//             } else {
//                 await addUser(payload);
//             }
//
//             setIsModalOpen(false);
//             await loadData();
//         } catch (err) {
//             console.error('Failed to save user:', err);
//             setError('Failed to save user record. Please check inputs and try again.');
//         } finally {
//             setSubmitting(false);
//         }
//     };
//
//     const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length;
//
//     return (
//         <div className="user-page-wrapper">
//             <Sidebar />
//             <div className="user-container">
//                 <Navbar />
//
//                 <div className="user-content">
//                     {/* Error Toast Banner */}
//                     {error && (
//                         <div className="alert-banner error">
//                             <span>{error}</span>
//                             <button className="alert-close-btn" onClick={() => setError('')}>
//                                 &times;
//                             </button>
//                         </div>
//                     )}
//
//                     {/* Page Header */}
//                     <div className="user-page-header">
//                         <div>
//                             <h2>User Management</h2>
//                             <p>Manage system users, assigned roles, and login statuses</p>
//                         </div>
//                         <button className="btn-primary" onClick={handleOpenAddModal}>
//                             + Add New User
//                         </button>
//                     </div>
//
//                     {/* Summary Stat Cards */}
//                     <div className="user-stats-grid">
//                         <div className="stat-card blue">
//                             <div className="stat-icon-box blue-bg">👥</div>
//                             <div className="stat-info">
//                                 <span className="stat-label">TOTAL USERS</span>
//                                 <span className="stat-value blue-text">{users.length}</span>
//                             </div>
//                         </div>
//
//                         <div className="stat-card green">
//                             <div className="stat-icon-box green-bg">✅</div>
//                             <div className="stat-info">
//                                 <span className="stat-label">ACTIVE ACCOUNTS</span>
//                                 <span className="stat-value green-text">{activeUsersCount}</span>
//                             </div>
//                         </div>
//
//                         <div className="stat-card teal">
//                             <div className="stat-icon-box teal-bg">🛡️</div>
//                             <div className="stat-info">
//                                 <span className="stat-label">ROLES ASSIGNED</span>
//                                 <span className="stat-value teal-text">{availableRoles.length}</span>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* User List Cards */}
//                     <div className="role-list-container">
//                         {loading ? (
//                             <div className="loading-state">Loading user directory...</div>
//                         ) : users.length === 0 ? (
//                             <div className="empty-state">No users registered yet. Click "+ Add New User" to add one.</div>
//                         ) : (
//                             users.map((u) => {
//                                 const firstLetter = u.fullName.charAt(0).toUpperCase();
//
//                                 return (
//                                     <div className="role-item-card" key={u.id}>
//                                         <div className="role-avatar">{firstLetter}</div>
//
//                                         <div className="role-main-details">
//                                             <div className="role-title-row">
//                                                 <span className="role-card-name">{u.fullName}</span>
//                                                 <span className="role-id-badge">#{u.id}</span>
//                                             </div>
//                                             <div className="role-sub-text">
//                                                 <span>✉️ {u.email}</span>
//                                                 <span>📞 {u.phoneNumber || 'N/A'}</span>
//                                             </div>
//                                         </div>
//
//                                         <div className="role-card-right">
//                                             <div className="permission-badge-wrapper">
//                                                 <span className="permission-badge active">
//                                                     🛡️ {u.roleName}
//                                                 </span>
//                                                 <button className="btn-view" onClick={() => handleOpenViewModal(u)}>
//                                                     👁 View
//                                                 </button>
//                                             </div>
//
//                                             <div className="vertical-divider"></div>
//
//                                             <div className="action-buttons-cell">
//                                                 <button className="btn-edit" onClick={() => handleOpenEditModal(u)}>
//                                                     Edit
//                                                 </button>
//                                                 <button className="btn-delete" onClick={() => handleDeleteUser(u.id, u.fullName)}>
//                                                     Delete
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })
//                         )}
//                     </div>
//                 </div>
//
//                 {/* View Details Modal */}
//                 <ViewUserModal
//                     isOpen={isViewModalOpen}
//                     onClose={handleCloseViewModal}
//                     user={viewingUser}
//                 />
//
//                 {/* Add / Edit User Modal */}
//                 <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//                     <div className="modal-header">
//                         <div>
//                             <h3 className="modal-title">{editingUserId ? 'Edit User' : 'Create New User'}</h3>
//                             <p className="modal-subtitle">Provide account details and assign administrative privileges</p>
//                         </div>
//                         <button className="modal-close-icon" onClick={() => setIsModalOpen(false)}>
//                             &times;
//                         </button>
//                     </div>
//
//                     <form onSubmit={handleSubmitUser} className="modal-form-wrapper">
//                         <div className="modal-body custom-scroll">
//                             <div className="form-section">
//                                 <div className="form-group">
//                                     <label className="form-label">
//                                         Full Name <span className="required-star">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-input"
//                                         placeholder="e.g. Suman Dhungana"
//                                         value={fullName}
//                                         onChange={(e) => setFullName(e.target.value)}
//                                         required
//                                     />
//                                 </div>
//
//                                 <div className="form-group">
//                                     <label className="form-label">
//                                         Email Address <span className="required-star">*</span>
//                                     </label>
//                                     <input
//                                         type="email"
//                                         className="form-input"
//                                         placeholder="e.g. suman@example.com"
//                                         value={email}
//                                         onChange={(e) => setEmail(e.target.value)}
//                                         required
//                                     />
//                                 </div>
//
//                                 <div className="form-group">
//                                     <label className="form-label">Phone Number</label>
//                                     <input
//                                         type="text"
//                                         className="form-input"
//                                         placeholder="e.g. 9869047520"
//                                         value={phoneNumber}
//                                         onChange={(e) => setPhoneNumber(e.target.value)}
//                                     />
//                                 </div>
//
//                                 <div className="form-group">
//                                     <label className="form-label">
//                                         Assign Role <span className="required-star">*</span>
//                                     </label>
//                                     <select
//                                         className="form-input"
//                                         value={roleId}
//                                         onChange={(e) => setRoleId(Number(e.target.value))}
//                                         required
//                                     >
//                                         <option value="" disabled>Select a role...</option>
//                                         {availableRoles.map((r) => (
//                                             <option key={r.id} value={r.id}>
//                                                 {r.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//
//                                 <div className="form-group">
//                                     <label className="form-label">Account Status</label>
//                                     <select
//                                         className="form-input"
//                                         value={status}
//                                         onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
//                                     >
//                                         <option value="ACTIVE">ACTIVE</option>
//                                         <option value="INACTIVE">INACTIVE</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="modal-footer">
//                             <button
//                                 type="button"
//                                 className="btn-modal-cancel"
//                                 onClick={() => setIsModalOpen(false)}
//                                 disabled={submitting}
//                             >
//                                 Cancel
//                             </button>
//                             <button type="submit" className="btn-modal-submit" disabled={submitting}>
//                                 {submitting ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
//                             </button>
//                         </div>
//                     </form>
//                 </UserModal>
//             </div>
//         </div>
//     );
// };
//
// export default UserManagement;

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { User, fetchUsers,  deleteUser } from '../../services/userService';
import { fetchRoles, Role } from '@/services/permissionService';
import ViewUserModal from '../components/ViewUserModal';
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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Add/Edit Form State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [roleId, setRoleId] = useState<number | ''>('');
    const [status, setStatus] = useState<boolean>(true); // true = ACTIVE, false = INACTIVE
    const [submitting, setSubmitting] = useState<boolean>(false);

    // View User Details State
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [fetchedUsers, fetchedRoles] = await Promise.all([
                fetchUsers(),
                fetchRoles(),
            ]);
            setUsers(fetchedUsers);
            setAvailableRoles(fetchedRoles);
        } catch (err) {
            console.error('Failed to load user data:', err);
            setError('Failed to load user records. Please check your network.');
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
        setStatus(true); // Default to ACTIVE (true)
        setError('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUserId(user.id);
        setUserName(user.userName);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber || '');
        // Match roleId with availableRoles if user.role holds role name or ID
        const matchedRole = availableRoles.find((r) => r.name === user.role || r.id === Number(user.role));
        setRoleId(matchedRole ? matchedRole.id : '');
        setStatus(user.isActive);
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
            await loadData();
        } catch (err) {
            console.error('Failed to delete user:', err);
            setError(`Failed to delete user "${name}". Please try again.`);
        }
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleId) {
            setError('Please assign a valid role to the user.');
            return;
        }

        setSubmitting(true);
        setError('');

        // const payload = {
        //     userName,
        //     email,
        //     phoneNumber,
        //     roleId: Number(roleId),
        //     isActive: status, // Map status state directly as boolean
        // };

        try {
            // if (editingUserId) {
            //     await updateUser(editingUserId, payload);
            // } else {
            //     await addUser(payload);
            // }

            setIsModalOpen(false);
            await loadData();
        } catch (err) {
            console.error('Failed to save user:', err);
            setError('Failed to save user record. Please check inputs and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate active user count using boolean isActive field
    const activeUsersCount = users.filter((u) => u.isActive).length;

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
                            <p>Manage system users, assigned roles, and login statuses</p>
                        </div>
                        <button className="btn-primary" onClick={handleOpenAddModal}>
                            + Add New User
                        </button>
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
                            <div className="stat-icon-box teal-bg">🛡️</div>
                            <div className="stat-info">
                                <span className="stat-label">ROLES ASSIGNED</span>
                                <span className="stat-value teal-text">{availableRoles.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* User List Cards */}
                    <div className="role-list-container">
                        {loading ? (
                            <div className="loading-state">Loading user directory...</div>
                        ) : users.length === 0 ? (
                            <div className="empty-state">No users registered yet. Click "+ Add New User" to add one.</div>
                        ) : (
                            users.map((u) => {
                                const firstLetter = u.userName ? u.userName.charAt(0).toUpperCase() : 'U';

                                return (
                                    <div className="role-item-card" key={u.id}>
                                        <div className="role-avatar">{firstLetter}</div>

                                        <div className="role-main-details">
                                            <div className="role-title-row">
                                                <span className="role-card-name">{u.userName}</span>
                                                <span className="role-id-badge">#{u.id}</span>
                                                <span className={`user-status-pill ${u.isActive ? 'active' : 'inactive'}`}>
                                                    {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
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
                                                <button className="btn-delete" onClick={() => handleDeleteUser(u.id, u.userName)}>
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
                            <p className="modal-subtitle">Provide account details and assign administrative privileges</p>
                        </div>
                        <button className="modal-close-icon" onClick={() => setIsModalOpen(false)}>
                            &times;
                        </button>
                    </div>

                    <form onSubmit={handleSubmitUser} className="modal-form-wrapper">
                        <div className="modal-body custom-scroll">
                            <div className="form-section">
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

                                <div className="form-group">
                                    <label className="form-label">
                                        Assign Role <span className="required-star">*</span>
                                    </label>
                                    <select
                                        className="form-input"
                                        value={roleId}
                                        onChange={(e) => setRoleId(Number(e.target.value))}
                                        required
                                    >
                                        <option value="" disabled>Select a role...</option>
                                        {availableRoles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

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
                                {submitting ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </UserModal>
            </div>
        </div>
    );
};

export default UserManagement;