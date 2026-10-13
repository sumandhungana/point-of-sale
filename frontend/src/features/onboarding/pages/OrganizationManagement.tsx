import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { usePermission } from '@/core/rbac/usePermission';
import { getAllOrganization, GetAllMember, approveOrganization } from '../../services/organizationService';
import { getRoles, RoleResponse } from '@/services/roleService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../../styles/OrganizationManagement.css';

export const OrganizationManagement: React.FC = () => {
    const [organizations, setOrganizations] = useState<GetAllMember[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'active' | 'draft'>('active');
    const [selectedRoles, setSelectedRoles] = useState<Record<number, string>>({});
    const [approvingOrgId, setApprovingOrgId] = useState<number | null>(null);

    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const canAddOrganization = hasPermission('organization:registration');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedOrganizations, fetchedRoles] = await Promise.all([
                getAllOrganization(),
                getRoles().catch(() => [] as RoleResponse[])
            ]);

            setOrganizations(fetchedOrganizations);
            setRoles(fetchedRoles);

            // Pre-seed selected roles for drafts
            const initialRoles: Record<number, string> = {};
            fetchedOrganizations.forEach((org) => {
                if (org.roleId) {
                    initialRoles[org.id] = String(org.roleId);
                }
            });
            setSelectedRoles((prev) => ({ ...initialRoles, ...prev }));
        } catch (err) {
            console.error('Failed to load organization data', err);
            toast.error('Failed to load organization data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (orgId: number, roleId: string) => {
        setSelectedRoles((prev) => ({
            ...prev,
            [orgId]: roleId,
        }));
    };

    const handleApprove = async (org: GetAllMember) => {
        const roleToAssign = selectedRoles[org.id] || org.roleId;
        if (!roleToAssign) {
            toast.warning('Please select a role to assign before approving');
            return;
        }

        setApprovingOrgId(org.id);
        try {
            await approveOrganization({
                memberId: org.id,
                userId: org.userId,
                roleId: roleToAssign,
            });
            toast.success(`Organization "${org.organizationName}" approved and activated!`);
            await loadData();
        } catch (err: any) {
            console.error('Failed to approve organization:', err);
            toast.error(err.message || 'Failed to approve organization');
        } finally {
            setApprovingOrgId(null);
        }
    };

    // Filter organizations by status
    const activeOrganizations = organizations.filter((org) => org.isActive !== false);
    const draftOrganizations = organizations.filter((org) => org.isActive === false);

    // Calculate Summary Stats
    const totalOrganizations = organizations.length;
    const uniqueTypes = new Set(organizations.map((org) => org.organizationType).filter(Boolean)).size;

    return (
        <div className="user-management-page-wrapper">
            <Sidebar />
            <div className="user-management-container">
                <Navbar />

                <div className="user-management-content">
                    {/* Stats Banners in Single Line */}
                    <div className="org-stats-row">
                        <div className="stat-card">
                            <div className="stat-icon-box blue-bg">🏢</div>
                            <div className="stat-info">
                                <span className="stat-label">Total Organizations</span>
                                <span className="stat-value blue-text">{totalOrganizations}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-box green-bg">✓</div>
                            <div className="stat-info">
                                <span className="stat-label">Active Organizations</span>
                                <span className="stat-value green-text">{activeOrganizations.length}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-box red">⏳</div>
                            <div className="stat-info">
                                <span className="stat-label">Draft / Pending</span>
                                <span className="stat-value" style={{ color: '#d97706' }}>
                                    {draftOrganizations.length}
                                </span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-box navy">🏷️</div>
                            <div className="stat-info">
                                <span className="stat-label">Organization Types</span>
                                <span className="stat-value blue-text">{uniqueTypes}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tab-container">
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active Organizations
                            <span className="tab-badge">{activeOrganizations.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
                            onClick={() => setActiveTab('draft')}
                        >
                            Draft Organizations
                            <span className={`tab-badge ${draftOrganizations.length > 0 ? 'badge-amber pulse' : ''}`}>
                                {draftOrganizations.length}
                            </span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    {loading ? (
                        <div className="loading-container">Loading organization list...</div>
                    ) : activeTab === 'active' ? (
                        /* Active Organizations View */
                        <div className="role-list-container">
                            {activeOrganizations.length === 0 ? (
                                <div className="empty-container">No active organizations found.</div>
                            ) : (
                                activeOrganizations.map((org) => {
                                    const initials = org.organizationName
                                        ? org.organizationName
                                            .split(' ')
                                            .map((word) => word[0])
                                            .join('')
                                            .substring(0, 2)
                                            .toUpperCase()
                                        : 'ORG';

                                    return (
                                        <div className="role-item-card" key={org.id}>
                                            <div className="role-avatar">{initials}</div>

                                            <div className="role-main-details">
                                                <div className="role-title-row">
                                                    <span className="role-card-name">{org.organizationName}</span>
                                                    <span className="role-id-badge">#ORG-{org.id}</span>
                                                    <span className="badge-org-active ms-2">Active</span>
                                                </div>

                                                <div className="role-sub-text">
                                                    <span>Branch: {org.branch || 'Main Branch'}</span>
                                                    <span>•</span>
                                                    <span>Address: {org.organizationAddress || 'N/A'}</span>
                                                    {org.panVatNumber && (
                                                        <>
                                                            <span>•</span>
                                                            <span>PAN/VAT: {org.panVatNumber}</span>
                                                        </>
                                                    )}
                                                    {org.organizationContactNumber && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Phone: {org.organizationContactNumber}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="role-card-right">
                                                <span className="badge-role">
                                                    {org.organizationType || 'Standard'}
                                                </span>

                                                <div className="vertical-divider"></div>

                                                <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
                                                    <div>By: <strong>{org.createdBy || 'System'}</strong></div>
                                                    <div>
                                                        {org.createdAt
                                                            ? new Date(org.createdAt).toLocaleDateString()
                                                            : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        /* Draft Organizations View */
                        <div className="role-list-container">
                            {draftOrganizations.length === 0 ? (
                                <div className="draft-empty-state">
                                    <div className="icon">📋</div>
                                    <h4>No Draft Organizations Pending Approval</h4>
                                    <p>
                                        When organizations register externally from the login page, they will appear here in Draft.
                                        You can assign roles and approve them to activate their users.
                                    </p>
                                </div>
                            ) : (
                                draftOrganizations.map((org) => {
                                    const currentRoleValue = selectedRoles[org.id] ?? (org.roleId ? String(org.roleId) : '');

                                    return (
                                        <div className="draft-item-card" key={org.id}>
                                            <div className="draft-header-row">
                                                <div className="draft-org-title">
                                                    <span>🏢 {org.organizationName}</span>
                                                    <span className="role-id-badge">#ORG-{org.id}</span>
                                                    <span className="badge-role">{org.organizationType || 'Standard'}</span>
                                                </div>
                                                <div>
                                                    <span className="badge-org-draft">
                                                        <i className="bi bi-clock-history"></i> Draft / Pending Approval
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="draft-info-grid">
                                                <div className="draft-info-item">
                                                    <strong>Branch & Address</strong>
                                                    <span>{org.branch || 'Main Branch'} • {org.organizationAddress || 'N/A'}</span>
                                                </div>
                                                <div className="draft-info-item">
                                                    <strong>PAN / VAT</strong>
                                                    <span>{org.panVatNumber || 'Not Provided'}</span>
                                                </div>
                                                <div className="draft-info-item">
                                                    <strong>Contact & Email</strong>
                                                    <span>{org.organizationContactNumber || 'N/A'} • {org.organizationEmail || org.userEmail || 'N/A'}</span>
                                                </div>
                                                <div className="draft-info-item">
                                                    <strong>Registered User</strong>
                                                    <span>{org.userName || org.userEmail || 'Self-Registered'}</span>
                                                </div>
                                                <div className="draft-info-item">
                                                    <strong>Submission Date</strong>
                                                    <span>
                                                        {org.createdAt
                                                            ? new Date(org.createdAt).toLocaleString()
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="draft-info-item">
                                                    <strong>Current Role Assigned</strong>
                                                    <span>{org.roleName || org.roleId || 'None'}</span>
                                                </div>
                                            </div>

                                            <div className="draft-actions-bar">
                                                <div className="draft-role-picker">
                                                    <label htmlFor={`role-select-${org.id}`}>
                                                        Assign Role:
                                                    </label>
                                                    <select
                                                        id={`role-select-${org.id}`}
                                                        className="table-role-select"
                                                        value={currentRoleValue}
                                                        onChange={(e) => handleRoleChange(org.id, e.target.value)}
                                                        disabled={approvingOrgId === org.id}
                                                    >
                                                        <option value="">-- Select Role to Assign --</option>
                                                        {roles.map((r) => (
                                                            <option key={r.id} value={String(r.id)}>
                                                                {r.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn-approve-org"
                                                    onClick={() => handleApprove(org)}
                                                    disabled={approvingOrgId === org.id}
                                                >
                                                    {approvingOrgId === org.id ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                            Approving...
                                                        </>
                                                    ) : (
                                                        <>✓ Approve & Activate</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Sticky Bottom-Right Onboard Button - Hidden in Draft tab */}
                {canAddOrganization && activeTab === 'active' && (
                    <button
                        type="button"
                        className="btn-sticky-add-org"
                        onClick={() => navigate('/add-organization')}
                        title="Onboard New Organization"
                    >
                        <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                        <span>Onboard New Organization</span>
                    </button>
                )}
            </div>
        </div>
    );
};