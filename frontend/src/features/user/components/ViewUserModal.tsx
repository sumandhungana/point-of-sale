import React from 'react';
import ReactDOM from 'react-dom';
import { User } from '../../services/userService';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const firstLetter = user.fullName.charAt(0).toUpperCase();

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="view-modal-title-row">
                        <h3>User Account Details</h3>
                        <span className="role-id-badge">#{user.id}</span>
                    </div>
                    <button className="modal-close-icon" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* User Profile Summary */}
                    <div className="user-profile-summary-card">
                        <div className="role-avatar user-avatar-large">{firstLetter}</div>
                        <div className="user-summary-text">
                            <h4>{user.fullName}</h4>
                            <p>{user.email}</p>
                            <span className={`user-status-pill ${user.status.toLowerCase()}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>

                    {/* Detailed Fields Grid */}
                    <div className="view-permissions-list">
                        <h4 className="view-section-title">Account Information</h4>

                        <div className="view-module-card">
                            <div className="user-info-row">
                                <span className="info-label">Assigned Role:</span>
                                <span className="permission-pill-tag">
                                    <span className="pill-dot"></span>
                                    {user.roleName}
                                </span>
                            </div>

                            <div className="user-info-row">
                                <span className="info-label">Phone Number:</span>
                                <span className="info-value">{user.phoneNumber || 'N/A'}</span>
                            </div>

                            <div className="user-info-row">
                                <span className="info-label">Account Status:</span>
                                <span className="info-value">{user.status}</span>
                            </div>

                            {user.createdAt && (
                                <div className="user-info-row">
                                    <span className="info-label">Created Date:</span>
                                    <span className="info-value">{user.createdAt}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ViewUserModal;