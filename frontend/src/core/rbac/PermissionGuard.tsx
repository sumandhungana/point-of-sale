// src/core/rbac/PermissionGuard.tsx
import React from 'react';
import { usePermission } from './usePermission';

interface PermissionGuardProps {
    children: React.ReactNode;
    module?: string;
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
                                                                    children,
                                                                    module,
                                                                    permission,
                                                                    permissions = [],
                                                                    requireAll = false,
                                                                    fallback = null,
                                                                }) => {
    const { hasModule, hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

    // Validate Module check
    if (module && !hasModule(module)) {
        return <>{fallback}</>;
    }

    // Validate single Permission check
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    // Validate multiple Permissions check
    if (permissions.length > 0) {
        const isAuthorized = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!isAuthorized) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
};