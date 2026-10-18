import React, { useEffect, useState, useMemo } from 'react';
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
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'active' | 'draft'>('active');
    const [selectedRoles, setSelectedRoles] = useState<Record<number, string>>({});
    const [approvingOrgId, setApprovingOrgId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const canAddOrganization = hasPermission('organization:registration');

    useEffect(() => {
        loadData(true);
    }, []);

    const loadData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setRefreshing(true);
        try {
            const [fetchedOrganizations, fetchedRoles] = await Promise.all([
                getAllOrganization(true),
                getRoles().catch(() => [] as RoleResponse[])
            ]);

            const orgList = fetchedOrganizations || [];
            setOrganizations(orgList);
            setRoles(fetchedRoles || []);

            // If active tab has no active organizations but drafts exist, auto-select draft tab
            const hasActive = orgList.some((org) => org.isActive !== false);
            const hasDraft = orgList.some((org) => org.isActive === false);
            if (!hasActive && hasDraft) {
                setActiveTab('draft');
            }

            // Pre-seed selected roles for drafts
            const initialRoles: Record<number, string> = {};
            orgList.forEach((org) => {
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
            setRefreshing(false);
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
            await loadData(false);
        } catch (err: any) {
            console.error('Failed to approve organization:', err);
            toast.error(err.message || 'Failed to approve organization');
        } finally {
            setApprovingOrgId(null);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return 'ORG';
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return 'ORG';
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    // Filter organizations by search query
    const filteredOrganizations = useMemo(() => {
        if (!searchQuery.trim()) return organizations;
        const q = searchQuery.toLowerCase().trim();
        return organizations.filter((org) => {
            return (
                (org.organizationName && org.organizationName.toLowerCase().includes(q)) ||
                (org.organizationAddress && org.organizationAddress.toLowerCase().includes(q)) ||
                (org.branch && org.branch.toLowerCase().includes(q)) ||
                (org.panVatNumber && org.panVatNumber.toLowerCase().includes(q)) ||
                (org.organizationType && org.organizationType.toLowerCase().includes(q)) ||
                (org.organizationEmail && org.organizationEmail.toLowerCase().includes(q)) ||
                (org.organizationContactNumber && org.organizationContactNumber.toLowerCase().includes(q)) ||
                (org.userName && org.userName.toLowerCase().includes(q)) ||
                (org.userEmail && org.userEmail.toLowerCase().includes(q))
            );
        });
    }, [organizations, searchQuery]);

    // Filter organizations by status
    const activeOrganizations = filteredOrganizations.filter((org) => org.isActive !== false);
    const draftOrganizations = filteredOrganizations.filter((org) => org.isActive === false);

    // Calculate Summary Stats based on raw organizations list
    const totalOrganizations = organizations.length;
    const totalActiveCount = organizations.filter((org) => org.isActive !== false).length;
    const totalDraftCount = organizations.filter((org) => org.isActive === false).length;
    const uniqueTypes = new Set(organizations.map((org) => org.organizationType).filter(Boolean)).size;

    return (
        <div className="user-management-page-wrapper">
            <Sidebar />
            <div className="user-management-container">
                <Navbar />

                <div className="user-management-content">
                    {/* Header with Title and Actions */}
                    <div className="org-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Organization Management</h2>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
                                View, search, and manage registered and pending organizations
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                type="button"
                                className="btn-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#0f172a',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer'
                                }}
                                onClick={() => loadData(false)}
                                disabled={refreshing}
                                title="Refresh organizations list"
                            >
                                <span className={refreshing ? 'spinner-border spinner-border-sm' : ''}>
                                    {!refreshing && '🔄'}
                                </span>
                                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>

                            {canAddOrganization && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate('/add-organization')}
                                >
                                    <span>+</span>
                                    <span>Add Organization</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Banners */}
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
                                <span className="stat-value green-text">{totalActiveCount}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-box red">⏳</div>
                            <div className="stat-info">
                                <span className="stat-label">Draft / Pending</span>
                                <span className="stat-value" style={{ color: '#d97706' }}>
                                    {totalDraftCount}
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

                    {/* Tabs & Search Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div className="tab-container" style={{ margin: 0 }}>
                            <button
                                type="button"
                                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                                onClick={() => setActiveTab('active')}
                            >
                                Active Organizations
                                <span className="tab-badge">{totalActiveCount}</span>
                            </button>
                            <button
                                type="button"
                                className={`tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
                                onClick={() => setActiveTab('draft')}
                            >
                                Draft Organizations
                                <span className={`tab-badge ${totalDraftCount > 0 ? 'badge-amber pulse' : ''}`}>
                                    {totalDraftCount}
                                </span>
                            </button>
                        </div>

                        {/* Search Box */}
                        <div style={{ minWidth: '240px', maxWidth: '360px', flex: 1 }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="🔍 Search organizations by name, branch, pan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '13px',
                                    width: '100%',
                                    outline: 'none',
                                    backgroundColor: '#ffffff'
                                }}
                            />
                        </div>
                    </div>

                    {/* Tab Content */}
                    {loading ? (
                        <div className="loading-container" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                            <div className="spinner-border text-primary mb-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div>Loading organizations...</div>
                        </div>
                    ) : activeTab === 'active' ? (
                        /* Active Organizations View */
                        <div className="role-list-container">
                            {activeOrganizations.length === 0 ? (
                                <div className="empty-container" style={{ padding: '48px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ fontSize: '42px', marginBottom: '12px' }}>🏢</div>
                                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        No Active Organizations Found
                                    </div>
                                    {totalDraftCount > 0 ? (
                                        <div style={{ marginTop: '10px' }}>
                                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                                                There {totalDraftCount === 1 ? 'is' : 'are'} <strong>{totalDraftCount}</strong> draft organization{totalDraftCount > 1 ? 's' : ''} awaiting approval.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                style={{ padding: '8px 18px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer' }}
                                                onClick={() => setActiveTab('draft')}
                                            >
                                                View Draft Organizations ({totalDraftCount})
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                                            {searchQuery ? 'No organizations match your search query.' : 'There are currently no active organizations registered.'}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                activeOrganizations.map((org) => {
                                    const initials = getInitials(org.organizationName);

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
                                                    {org.organizationEmail && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Email: {org.organizationEmail}</span>
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
                                                    <div>{formatDate(org.createdAt)}</div>
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