import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
    fetchRoles,
    fetchAvailablePermissions,
    addRole,
    updateRole,
    deleteRole,
    Role,
    PermissionGroup,
    RolePermission,
} from '@/services/permissionService';
import '@/styles/RoleAndPermission.css';
import ViewRoleModal from "@/features/roleAndPermissions/components/ViewRoleModal";

// Portal Modal Component for Add/Edit
interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content large"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

export const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Edit/Add Modal State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [roleName, setRoleName] = useState<string>('');
    const [roleDescription, setRoleDescription] = useState<string>('');
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    // View Permissions Modal State
    const [viewingRole, setViewingRole] = useState<Role | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [fetchedRoles, fetchedPermissions] = await Promise.all([
                fetchRoles(),
                fetchAvailablePermissions(),
            ]);
            setRoles(fetchedRoles);
            setAvailablePermissions(fetchedPermissions);
        } catch (err) {
            console.error('Failed to load access control data:', err);
            setError('Failed to load roles and permission options. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingRoleId(null);
        setRoleName('');
        setRoleDescription('');
        setSelectedPermissions({});
        setError('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (role: Role) => {
        setEditingRoleId(role.id);
        setRoleName(role.name);
        setRoleDescription(role.description || '');

        const permMap: Record<string, string[]> = {};
        if (role.permissions) {
            role.permissions.forEach((pGroup) => {
                permMap[pGroup.module] = [...pGroup.permissions];
            });
        }

        setSelectedPermissions(permMap);
        setError('');
        setIsModalOpen(true);
    };

    // Handler to trigger viewing modal
    const handleOpenViewModal = (role: Role) => {
        setViewingRole(role);
        setIsViewModalOpen(true);
    };

    // Handler to close viewing modal
    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingRole(null);
    };

    const handleDeleteRole = async (roleId: number, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the role "${name}"?`)) {
            return;
        }

        setError('');
        try {
            await deleteRole(roleId);
            await loadData();
        } catch (err) {
            console.error('Failed to delete role:', err);
            setError(`Failed to delete role "${name}". Please try again.`);
        }
    };

    const handleCheckboxChange = (module: string, permission: string) => {
        setSelectedPermissions((prev) => {
            const currentModulePerms = prev[module] || [];
            const updatedModulePerms = currentModulePerms.includes(permission)
                ? currentModulePerms.filter((p) => p !== permission)
                : [...currentModulePerms, permission];

            return {
                ...prev,
                [module]: updatedModulePerms,
            };
        });
    };

    const handleModuleCheckboxChange = (module: string, allModulePermissions: string[]) => {
        setSelectedPermissions((prev) => {
            const currentModulePerms = prev[module] || [];
            const isAllSelected = allModulePermissions.every((p) => currentModulePerms.includes(p));

            return {
                ...prev,
                [module]: isAllSelected ? [] : [...allModulePermissions],
            };
        });
    };

    const handleSubmitRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const formattedPermissions: RolePermission[] = Object.entries(selectedPermissions)
            .filter(([_, perms]) => perms.length > 0)
            .map(([module, permissions]) => ({
                module,
                permissions,
            }));

        try {
            if (editingRoleId) {
                await updateRole({
                    id: editingRoleId,
                    name: roleName,
                    description: roleDescription,
                    permissions: formattedPermissions,
                });
            } else {
                await addRole({
                    name: roleName,
                    description: roleDescription,
                    permissions: formattedPermissions,
                });
            }

            setIsModalOpen(false);
            await loadData();
        } catch (err) {
            console.error('Failed to save role:', err);
            setError('Failed to save role. Please check your inputs and try again.');
            setIsModalOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    const getTotalPermissionCount = (role: Role) => {
        if (!role.permissions) return 0;
        return role.permissions.reduce((acc, pGroup) => acc + pGroup.permissions.length, 0);
    };

    return (
        <div className="role-permission-page-wrapper">
            <Sidebar />
            <div className="role-permission-container">
                <Navbar />

                <div className="role-permission-content">
                    {/* Error Toast / Alert Banner */}
                    {error && (
                        <div className="alert-banner error">
                            <span>{error}</span>
                            <button className="alert-close-btn" onClick={() => setError('')}>
                                &times;
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="role-page-header">
                        <div>
                            <h2>Role & Permission Management</h2>
                            <p>Manage user access roles and module action privileges</p>
                        </div>
                        <button className="btn-primary" onClick={handleOpenAddModal}>
                            + Add New Role
                        </button>
                    </div>

                    {/* Summary Stat Cards Header */}
                    <div className="role-stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon-box blue-bg">🛡️</div>
                            <div className="stat-info">
                                <span className="stat-label">TOTAL ROLES</span>
                                <span className="stat-value blue-text">{roles.length}</span>
                            </div>
                        </div>

                        <div className="stat-card green">
                            <div className="stat-icon-box green-bg">🔑</div>
                            <div className="stat-info">
                                <span className="stat-label">TOTAL PERMISSIONS</span>
                                <span className="stat-value green-text">
                                    {roles.reduce((acc, r) => acc + getTotalPermissionCount(r), 0)}
                                </span>
                            </div>
                        </div>

                        <div className="stat-card teal">
                            <div className="stat-icon-box teal-bg">⚡</div>
                            <div className="stat-info">
                                <span className="stat-label">ACTIVE MODULES</span>
                                <span className="stat-value teal-text">{availablePermissions.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic List Item Cards Container */}
                    <div className="role-list-container">
                        {loading ? (
                            <div className="loading-state">Loading roles and permissions...</div>
                        ) : roles.length === 0 ? (
                            <div className="empty-state">No user roles found. Click "+ Add New Role" to create one.</div>
                        ) : (
                            roles.map((role) => {
                                const permCount = getTotalPermissionCount(role);
                                const firstLetter = role.name.charAt(0).toUpperCase();

                                return (
                                    <div className="role-item-card" key={role.id}>
                                        <div className="role-avatar">{firstLetter}</div>

                                        <div className="role-main-details">
                                            <div className="role-title-row">
                                                <span className="role-card-name">{role.name}</span>
                                                <span className="role-id-badge">#{role.id}</span>
                                            </div>
                                            <div className="role-sub-text">
                                                <span>📝 {role.description || 'No description provided'}</span>
                                            </div>
                                        </div>

                                        <div className="role-card-right">
                                            <div className="permission-badge-wrapper">
                                                <span className={`permission-badge ${permCount > 0 ? 'active' : 'inactive'}`}>
                                                    {permCount} {permCount === 1 ? 'Permission' : 'Permissions'}
                                                </span>
                                                {/* Corrected: Calls handleOpenViewModal with current role */}
                                                <button className="btn-view" onClick={() => handleOpenViewModal(role)}>
                                                    👁 View
                                                </button>
                                            </div>

                                            <div className="vertical-divider"></div>

                                            <div className="action-buttons-cell">
                                                <button className="btn-edit" onClick={() => handleOpenEditModal(role)}>
                                                    Edit
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDeleteRole(role.id, role.name)}>
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

                {/* View Permissions Modal */}
                <ViewRoleModal
                    isOpen={isViewModalOpen}
                    onClose={handleCloseViewModal}
                    role={viewingRole}
                />

                {/* Add/Edit Role Modal */}
                <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="modal-header">
                        <div>
                            <h3>{editingRoleId ? 'Edit Role' : 'Add New Role'}</h3>
                            <p>Configure role information and assign permissions</p>
                        </div>
                        <button className="modal-close-icon" onClick={() => setIsModalOpen(false)}>&times;</button>
                    </div>

                    <form onSubmit={handleSubmitRole}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">
                                    Role Name <span className="required-star">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Sales Manager"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Briefly describe what users with this role can do..."
                                    value={roleDescription}
                                    onChange={(e) => setRoleDescription(e.target.value)}
                                />
                            </div>

                            <h4 className="section-title">Assign Permissions</h4>

                            {availablePermissions.map((group) => {
                                const moduleName = group.module;
                                const groupPerms = group.permissions;
                                const currentSelected = selectedPermissions[moduleName] || [];
                                const isAllChecked = groupPerms.length > 0 && groupPerms.every((p) => currentSelected.includes(p));

                                return (
                                    <div key={moduleName} className="permission-group-card" style={{ marginBottom: '16px' }}>
                                        <div className="permission-group-header">
                                            <label className="permission-checkbox-label" style={{ fontWeight: 'bold' }}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-input"
                                                    checked={isAllChecked}
                                                    onChange={() => handleModuleCheckboxChange(moduleName, groupPerms)}
                                                />
                                                <span className="module-title">{moduleName} Module</span>
                                            </label>
                                            <span className="selected-count">
                                                ({currentSelected.length}/{groupPerms.length} selected)
                                            </span>
                                        </div>

                                        <div className="permissions-grid">
                                            {groupPerms.map((perm) => {
                                                const isChecked = currentSelected.includes(perm);
                                                return (
                                                    <label key={perm} className="permission-checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox-input"
                                                            checked={isChecked}
                                                            onChange={() => handleCheckboxChange(moduleName, perm)}
                                                        />
                                                        <span>{perm}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setIsModalOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : editingRoleId ? 'Update Role' : 'Save Role'}
                            </button>
                        </div>
                    </form>
                </RoleModal>
            </div>
        </div>
    );
};