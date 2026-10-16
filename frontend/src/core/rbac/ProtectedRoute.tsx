// src/core/rbac/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/AuthContext'
import { usePermission } from './usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredModule?: string;
    requiredModules?: string[];
    requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  children,
                                                                  requiredModule,
                                                                  requiredModules,
                                                                  requiredPermissions = [],
                                                              }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { hasModule, hasAllPermissions } = usePermission();

    if (isLoading) {
        return <div className="text-center p-5">Loading context...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check Modules authorization
    if (requiredModules && requiredModules.length > 0 && !requiredModules.some((m) => hasModule(m))) {
        return <AccessDenied requiredModule={requiredModules.join(' or ')} />;
    }

    // Check single Module authorization
    if (requiredModule && !hasModule(requiredModule)) {
        return <AccessDenied requiredModule={requiredModule} />;
    }

    // Check Action/Permission authorization
    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
        return (
            <AccessDenied
                title="Permission Required"
                message="Your role does not have the required permissions for this action."
            />
        );
    }

    return <>{children}</>;
};