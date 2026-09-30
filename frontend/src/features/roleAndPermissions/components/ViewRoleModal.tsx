import React from 'react';
import ReactDOM from 'react-dom';

interface ViewRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: {
        id: number | string;
        name: string;
        description?: string;
        permissions?: Array<{
            module: string;
            permissions: string[];
        }>;
    } | null;
}

const ViewRoleModal: React.FC<ViewRoleModalProps> = ({ isOpen, onClose, role }) => {
    if (!isOpen || !role) return null;

    const totalPermissions = role.permissions
        ? role.permissions.reduce((acc, p) => acc + (p.permissions?.length || 0), 0)
        : 0;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content medium"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <div className="view-modal-title-row">
                            <h3>{role.name}</h3>
                            <span className="role-id-badge">#{role.id}</span>
                        </div>
                        <p>{role.description || 'No description provided for this role.'}</p>
                    </div>
                    <button className="modal-close-icon" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Summary Banner */}
                    <div className="view-summary-banner">
                        <div className="summary-item">
                            <span className="summary-label">TOTAL MODULES</span>
                            <span className="summary-value">{role.permissions?.length || 0}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <span className="summary-label">TOTAL PERMISSIONS</span>
                            <span className="summary-value highlight">{totalPermissions}</span>
                        </div>
                    </div>

                    {/* Permissions Breakdown */}
                    <div className="view-permissions-list">
                        <h4 className="view-section-title">Assigned Module Permissions</h4>

                        {!role.permissions || role.permissions.length === 0 ? (
                            <div className="empty-permissions-state">
                                No permissions assigned to this role yet.
                            </div>
                        ) : (
                            role.permissions.map((group, index) => (
                                <div key={index} className="view-module-card">
                                    <div className="view-module-header">
                                        <span className="view-module-name">{group.module}</span>
                                        <span className="view-module-count">
                                            {group.permissions?.length || 0} active
                                        </span>
                                    </div>
                                    <div className="view-pills-wrapper">
                                        {group.permissions?.map((perm, pIdx) => (
                                            <span key={pIdx} className="permission-pill-tag">
                                                <span className="pill-dot"></span>
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ViewRoleModal;