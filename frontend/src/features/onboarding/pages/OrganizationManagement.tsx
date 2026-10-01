import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { usePermission } from '@/core/rbac/usePermission';
import { getAllOrganization, GetAllMember } from '../../services/organizationService';
import { useNavigate } from "react-router-dom";
import '../../../styles/OrganizationManagement.css';

export const OrganizationManagement: React.FC = () => {
    const [organizations, setOrganizations] = useState<GetAllMember[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const canAddOrganization = hasPermission('organization:registration');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const fetchedOrganizations = await getAllOrganization();
            setOrganizations(fetchedOrganizations);
        } catch (err) {
            console.error('Failed to load organization data', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Summary Stats
    const totalOrganizations = organizations.length;
    const uniqueTypes = new Set(organizations.map((org) => org.organizationType).filter(Boolean)).size;

    return (
        <div className="user-management-page-wrapper">
            <Sidebar />
            <div className="user-management-container">
                <Navbar />

                <div className="user-management-content">
                    {/* Header Card */}
                    <div className="user-management-header">
                        <div>
                            <h2>Organization Management</h2>
                            <p>Manage registered organizations, review active branches, and onboard new entities.</p>
                        </div>
                        {canAddOrganization && (
                            <button
                                className="btn-add-user"
                                onClick={() => navigate('/add-organization')}
                            >
                                + Onboard New Organization
                            </button>
                        )}
                    </div>

                    {/* Stats Banners (Roles & Permissions Style) */}
                    <div className="role-stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon-box blue-bg">🏢</div>
                            <div className="stat-info">
                                <span className="stat-label">Total Organizations</span>
                                <span className="stat-value blue-text">{totalOrganizations}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-box green-bg">🏷️</div>
                            <div className="stat-info">
                                <span className="stat-label">Organization Types</span>
                                <span className="stat-value green-text">{uniqueTypes}</span>
                            </div>
                        </div>
                    </div>

                    {/* Organization Item Cards List */}
                    <div className="role-list-container">
                        {loading ? (
                            <div className="loading-container">Loading organization list...</div>
                        ) : organizations.length === 0 ? (
                            <div className="empty-container">No organizations found.</div>
                        ) : (
                            organizations.map((org) => {
                                // Extract initials for avatar box
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
                                        {/* Avatar / Icon */}
                                        <div className="role-avatar">{initials}</div>

                                        {/* Organization Main Details */}
                                        <div className="role-main-details">
                                            <div className="role-title-row">
                                                <span className="role-card-name">{org.organizationName}</span>
                                                <span className="role-id-badge">#ORG-{org.id}</span>
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
                                            </div>
                                        </div>

                                        {/* Right Side Info & Badges */}
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
                </div>
            </div>
        </div>
    );
};