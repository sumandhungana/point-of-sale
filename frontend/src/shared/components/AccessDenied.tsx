// src/shared/components/AccessDenied.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
    title?: string;
    message?: string;
    requiredModule?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
                                                              title = '403 - Access Denied',
                                                              message = "You don't have the necessary permissions to access this page or module.",
                                                              requiredModule,
                                                          }) => {
    const navigate = useNavigate();

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
            <div className="p-5 shadow-sm rounded bg-white" style={{ maxWidth: '500px', borderTop: '5px solid #dc3545' }}>
                <div className="mb-3">
                    <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="fw-bold text-dark mb-2">{title}</h2>
                <p className="text-muted mb-4">{message}</p>

                {requiredModule && (
                    <div className="alert alert-warning py-2 px-3 mb-4 text-start small">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Required Module:</strong> <code className="text-dark">{requiredModule}</code>
                    </div>
                )}

                <div className="d-flex gap-2 justify-content-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    >
                        <i className="bi bi-arrow-left"></i> Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-primary d-flex align-items-center gap-2"
                    >
                        <i className="bi bi-house-door"></i> Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};