import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { usePermission } from '@/core/rbac/usePermission';
import {
    fetchUsers,
    fetchMembers,
    fetchRoleOptions,
    addUser,
    // updateUserStatus, // Assume API service provides status/role update function
    User,
    Member,
    RoleOption,
} from '@/services/userService';
import '../styles/UserManagement.css';
import {useNavigate} from "react-router-dom";

type TabType = 'active' | 'onboarding';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const navigate= useNavigate();
    const { hasPermission } = usePermission();
    const canAddUser = hasPermission('organization:add');

    // State to store custom role dropdown selections for Tab 2 users
    const [userRoleSelections, setUserRoleSelections] = useState<{ [userId: number]: string }>({});
    const [activatingUserId, setActivatingUserId] = useState<number | null>(null);

    // Add User Modal State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedUsers, fetchedMembers, fetchedRoles] = await Promise.all([
                fetchUsers(),
                fetchMembers(),
                fetchRoleOptions(),
            ]);
            // @ts-ignore
            setUsers(fetchedUsers);
            setMembers(fetchedMembers);
            setRoles(fetchedRoles);
        } catch (err) {
            console.error('Failed to load user management data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        // setUserName('');
        // setSelectedRole('');
        // setSelectedMember('');
        // setIsModalOpen(true);
        if (!canAddUser) {
            alert('You do not have permission to add new users.');
            return;
        }
        navigate('/add-khatabook');
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canAddUser) {
            alert('You do not have permission to perform this action.');
            return;
        }
        if (!selectedRole || !selectedMember) {
            alert('Please select both a role and a member.');
            return;
        }

        setSubmitting(true);
        try {
            await addUser({
                userName,
                role: selectedRole,
                memberId: Number(selectedMember),
            });
            setIsModalOpen(false);
            await loadData();
        } catch (err) {
            console.error('Failed to add user', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRoleChangeForUser = (userId: number, roleId: string) => {
        setUserRoleSelections((prev) => ({
            ...prev,
            [userId]: roleId,
        }));
    };

    const handleActivateUser = async (user: User) => {
        const assignedRole = userRoleSelections[user.userId] || user.role;

        if (!assignedRole) {
            alert('Please select a custom role before activating the user.');
            return;
        }

        setActivatingUserId(user.userId);
        // try {
        //     await updateUserStatus(user.userId, {
        //         isActive: true,
        //         role: assignedRole,
        //     });
        //     await loadData();
        // } catch (err) {
        //     console.error('Failed to activate user', err);
        // } finally {
        //     setActivatingUserId(null);
        // }
    };

    const getRoleName = (roleId: string) => {
        const foundRole = roles.find((r) => r.id === roleId);
        return foundRole ? foundRole.name : roleId ? `Role ${roleId}` : 'Not Assigned';
    };

    // Filter logic for tabs
    const activeUsers = users.filter((u) => u.isActive);
    const onboardingUsers = users.filter((u) => !u.isActive && u.createdBy == 'SELF_ONBOARDING');

    const displayedUsers = activeTab === 'active' ? activeUsers : onboardingUsers;

    return (
        <div className="user-management-page-wrapper">
            <Sidebar />
            <div className="user-management-container">
                <Navbar />

                <div className="user-management-content">
                    {/* Header */}
                    <div className="user-management-header">
                        <div>
                            <h2>User Management</h2>
                            <p>Manage active accounts, onboard self-registered users, and assign roles.</p>
                        </div>
                        {activeTab === 'active' && canAddUser && (
                            <button className="btn-add-user" onClick={handleOpenAddModal}>
                                + Add New User
                            </button>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="tab-container">
                        <button
                            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active Users ({activeUsers.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
                            onClick={() => setActiveTab('onboarding')}
                        >
                            Self-Onboarding & Inactive ({onboardingUsers.length})
                        </button>
                    </div>

                    {/* User Table View */}
                    <div className="user-table-card">
                        {loading ? (
                            <div className="loading-container">Loading users list...</div>
                        ) : displayedUsers.length === 0 ? (
                            <div className="empty-container">No users found in this view.</div>
                        ) : (
                            <table className="user-table">
                                <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>User Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    {activeTab === 'onboarding' ? (
                                        <>
                                            <th>Assign Custom Role</th>
                                            <th>Action</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Created By</th>
                                            <th>Created At</th>
                                        </>
                                    )}
                                </tr>
                                </thead>
                                <tbody>
                                {displayedUsers.map((user) => (
                                    <tr key={user.userId}>
                                        <td className="user-id-cell">#{user.userId}</td>
                                        <td className="user-name-cell">{user.userName}</td>
                                        <td>
                                                <span className="badge-role">
                                                    {getRoleName(user.role)}
                                                </span>
                                        </td>
                                        <td>
                                                <span className={`badge-status ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? 'Active' : user.createdBy == 'SELF_ONBOARDING' ? 'Self Onboarding' : 'Inactive'}
                                                </span>
                                        </td>

                                        {activeTab === 'onboarding' ? (
                                            <>
                                                <td>
                                                    <select
                                                        className="table-role-select"
                                                        value={userRoleSelections[user.userId] || user.role || ''}
                                                        onChange={(e) => handleRoleChangeForUser(user.userId, e.target.value)}
                                                        disabled={!canAddUser}
                                                    >
                                                        <option value="">Select Custom Role</option>
                                                        {roles.map((r) => (
                                                            <option key={r.id} value={r.id}>
                                                                {r.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-activate"
                                                        disabled={activatingUserId === user.userId}
                                                        onClick={() => handleActivateUser(user)}
                                                    >
                                                        {activatingUserId === user.userId ? 'Activating...' : 'Make Active'}
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{user.createdBy || 'System'}</td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Add User Modal */}
                    {isModalOpen && canAddUser && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>Add New User</h3>
                                    <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                                        &times;
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitUser} className="modal-form">
                                    <div className="form-group">
                                        <label>
                                            User Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            placeholder="e.g. John Doe"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Member Belonging <span className="required">*</span>
                                        </label>
                                        <select
                                            className="form-control"
                                            required
                                            value={selectedMember}
                                            onChange={(e) => setSelectedMember(e.target.value)}
                                        >
                                            <option value="">Select Member</option>
                                            {members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Role <span className="required">*</span>
                                        </label>
                                        <select
                                            className="form-control"
                                            required
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-submit" disabled={submitting}>
                                            {submitting ? 'Saving...' : 'Add User'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};