// // src/core/rbac/usePermission.ts
// import { useAuth } from '@/context/AuthContext';
//
// export const usePermission = () => {
//     const { user } = useAuth(); // UserInfo payload from login
//
//     // Extract enabled modules array
//     const userModules = user?.permissionResponse?.module
//         ? user.permissionResponse.module.split(',').map((m) => m.trim().toLowerCase())
//         : [];
//
//     // Set of permissions for fast O(1) lookup
//     const userPermissions = new Set(user?.permissionResponse?.permissions || []);
//
//     /**
//      * Check if user has access to a specific top-level module (e.g., 'organization')
//      */
//     const hasModule = (moduleName: string): boolean => {
//         return userModules.includes(moduleName.trim().toLowerCase());
//     };
//
//     /**
//      * Check if user has explicit permission (e.g., 'organization:user:active')
//      */
//     const hasPermission = (permission: string): boolean => {
//         return userPermissions.has(permission);
//     };
//
//     /**
//      * Check if user has ANY of the listed permissions
//      */
//     const hasAnyPermission = (permissions: string[]): boolean => {
//         return permissions.some((perm) => userPermissions.has(perm));
//     };
//
//     /**
//      * Check if user has ALL listed permissions
//      */
//     const hasAllPermissions = (permissions: string[]): boolean => {
//         return permissions.every((perm) => userPermissions.has(perm));
//     };
//
//     return {
//         hasModule,
//         hasPermission,
//         hasAnyPermission,
//         hasAllPermissions,
//         userModules,
//         userPermissions: Array.from(userPermissions),
//     };
// };

import { useAuth } from '@/core/auth/AuthContext';

export const getStoredUserData = (): any => {
    try {
        const stored = localStorage.getItem('userData');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};


export const hasStoredModule = (moduleName: string): boolean => {
    const user = getStoredUserData();
    if (!user) return false;

    const permData = user.permissionResponse;
    const modules: string[] = [];
    if (Array.isArray(permData)) {
        modules.push(...permData.flatMap((item: any) => (item.module ? item.module.split(',') : [])));
    } else if (typeof permData === 'object' && permData?.module) {
        modules.push(...permData.module.split(','));
    }
    return modules.map((m) => m.trim().toLowerCase()).includes(moduleName.trim().toLowerCase());
};

export const usePermission = () => {
    const { user } = useAuth();

    // Safely extract modules into a clean string array
    const extractModules = (): string[] => {
        if (!user?.permissionResponse) return [];

        const permData = user.permissionResponse;

        // Case 1: permissionResponse is an Array of PermissionResponse objects
        if (Array.isArray(permData)) {
            return permData
                .flatMap((item) => (item.module ? item.module.split(',') : []))
                .map((m) => m.trim().toLowerCase());
        }

        // Case 2: permissionResponse is a single PermissionResponse object
        if (typeof permData === 'object' && permData.module) {
            return permData.module.split(',').map((m) => m.trim().toLowerCase());
        }

        return [];
    };

    // Safely extract all permissions into a Set
    const extractPermissions = (): Set<string> => {
        if (!user?.permissionResponse) {
            // Fallback to top-level permissions array if present on user
            return new Set(user?.permissions || []);
        }

        const permData = user.permissionResponse;

        if (Array.isArray(permData)) {
            const allPerms = permData.flatMap((item) => item.permissions || []);
            return new Set(allPerms);
        }

        if (typeof permData === 'object' && Array.isArray(permData.permissions)) {
            return new Set(permData.permissions);
        }

        return new Set(user?.permissions || []);
    };

    const userModules = extractModules();
    const userPermissions = extractPermissions();


    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN' || roleUpper === 'ADMIN';

    /**
     * Check if user has access to a specific top-level module (e.g., 'organization')
     */
    const hasModule = (moduleName: string): boolean => {
        if (isSuperAdmin) return true;
        return userModules.includes(moduleName.trim().toLowerCase());
    };

    /**
     * Check if user has explicit permission (e.g., 'organization:user:active')
     */
    const hasPermission = (permission: string): boolean => {
        if (isSuperAdmin) return true;
        return userPermissions.has(permission);
    };

    /**
     * Check if user has ANY of the listed permissions
     */
    const hasAnyPermission = (permissions: string[]): boolean => {
        if (isSuperAdmin) return true;
        return permissions.some((perm) => userPermissions.has(perm));
    };

    /**
     * Check if user has ALL listed permissions
     */
    const hasAllPermissions = (permissions: string[]): boolean => {
        if (isSuperAdmin) return true;
        return permissions.every((perm) => userPermissions.has(perm));
    };

    return {
        hasModule,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isSuperAdmin,
        userModules,
        userPermissions: Array.from(userPermissions),
    };
};