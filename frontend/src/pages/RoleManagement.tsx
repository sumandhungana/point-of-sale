
// import React, { useEffect, useState } from 'react';
// import { Sidebar } from '@/components/Sidebar';
// import Navbar from '../components/Navbar';
// import {
//     fetchRoles,
//     fetchAvailablePermissions,
//     addRole,
//     updateRole,
//     deleteRole,
//     Role,
//     PermissionGroup,
//     RolePermission,
// } from '@/services/permissionService';
// import '../styles/RoleAndPermission.css';
//
// export const RoleManagement: React.FC = () => {
//     const [roles, setRoles] = useState<Role[]>([]);
//     const [availablePermissions, setAvailablePermissions] = useState<PermissionGroup[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//
//     // Modal & Form State
//     const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//     const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
//     const [roleName, setRoleName] = useState<string>('');
//     const [roleDescription, setRoleDescription] = useState<string>('');
//     const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
//     const [submitting, setSubmitting] = useState<boolean>(false);
//
//     useEffect(() => {
//         loadData();
//     }, []);
//
//     const loadData = async () => {
//         setLoading(true);
//         try {
//             const [fetchedRoles, fetchedPermissions] = await Promise.all([
//                 fetchRoles(),
//                 fetchAvailablePermissions(),
//             ]);
//             setRoles(fetchedRoles);
//             setAvailablePermissions(fetchedPermissions);
//         } catch (err) {
//             console.error('Failed to load access control data', err);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const handleOpenAddModal = () => {
//         setEditingRoleId(null);
//         setRoleName('');
//         setRoleDescription('');
//         setSelectedPermissions({});
//         setIsModalOpen(true);
//     };
//
//     const handleOpenEditModal = (role: Role) => {
//         setEditingRoleId(role.id);
//         setRoleName(role.name);
//         setRoleDescription(role.description || '');
//
//         const permMap: Record<string, string[]> = {};
//         if (role.permissions) {
//             role.permissions.forEach((pGroup) => {
//                 permMap[pGroup.module] = [...pGroup.permissions];
//             });
//         }
//
//         setSelectedPermissions(permMap);
//         setIsModalOpen(true);
//     };
//
//     const handleDeleteRole = async (roleId: number, roleName: string) => {
//         if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
//             try {
//                 await deleteRole(roleId);
//                 await loadData();
//             } catch (err) {
//                 console.error('Failed to delete role', err);
//             }
//         }
//     };
//
//     // Toggle individual permission checkbox
//     const handleCheckboxChange = (module: string, permission: string) => {
//         setSelectedPermissions((prev) => {
//             const currentModulePerms = prev[module] || [];
//             const updatedModulePerms = currentModulePerms.includes(permission)
//                 ? currentModulePerms.filter((p) => p !== permission)
//                 : [...currentModulePerms, permission];
//
//             return {
//                 ...prev,
//                 [module]: updatedModulePerms,
//             };
//         });
//     };
//
//     // Toggle module-level checkbox (Select All / Deselect All for that module)
//     const handleModuleCheckboxChange = (module: string, allModulePermissions: string[]) => {
//         setSelectedPermissions((prev) => {
//             const currentModulePerms = prev[module] || [];
//             const isAllSelected = allModulePermissions.every((p) => currentModulePerms.includes(p));
//
//             return {
//                 ...prev,
//                 [module]: isAllSelected ? [] : [...allModulePermissions],
//             };
//         });
//     };
//
//     const handleSubmitRole = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setSubmitting(true);
//
//         const formattedPermissions: RolePermission[] = Object.entries(selectedPermissions)
//             .filter(([_, perms]) => perms.length > 0)
//             .map(([module, permissions]) => ({
//                 module,
//                 permissions,
//             }));
//
//         try {
//             if (editingRoleId) {
//                 await updateRole({
//                     id: editingRoleId,
//                     name: roleName,
//                     description: roleDescription,
//                     permissions: formattedPermissions,
//                 });
//             } else {
//                 await addRole({
//                     name: roleName,
//                     description: roleDescription,
//                     permissions: formattedPermissions,
//                 });
//             }
//
//             setIsModalOpen(false);
//             await loadData();
//         } catch (err) {
//             console.error('Failed to save role', err);
//         } finally {
//             setSubmitting(false);
//         }
//     };
//
//     return (
//         <div className="role-permission-page-wrapper">
//             <Sidebar />
//             <div className="role-permission-container">
//                 <Navbar />
//
//                 <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'inherit' }}>
//                     {/* Header */}
//                     <div
//                         style={{
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             marginBottom: '24px',
//                             background: '#ffffff',
//                             padding: '20px 24px',
//                             borderRadius: '12px',
//                             boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//                         }}
//                     >
//                         <div>
//                             <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1d20' }}>Role & Permission Management</h2>
//                             <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6c757d' }}>Manage user access roles and module action privileges</p>
//                         </div>
//                         <button
//                             onClick={handleOpenAddModal}
//                             style={{
//                                 backgroundColor: '#0066cc',
//                                 color: '#fff',
//                                 border: 'none',
//                                 padding: '10px 20px',
//                                 borderRadius: '8px',
//                                 cursor: 'pointer',
//                                 fontWeight: '600',
//                                 fontSize: '14px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px',
//                                 boxShadow: '0 2px 4px rgba(0,102,204,0.2)',
//                                 transition: 'all 0.2s ease',
//                             }}
//                         >
//                             <i className="bi bi-plus-lg"></i>
//                             Add New Role
//                         </button>
//                     </div>
//
//                     {/* Table View */}
//                     <div
//                         style={{
//                             background: '#ffffff',
//                             borderRadius: '12px',
//                             boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//                             overflow: 'hidden',
//                         }}
//                     >
//                         {loading ? (
//                             <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
//                                 Loading roles and permissions...
//                             </div>
//                         ) : (
//                             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
//                                 <thead>
//                                 <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
//                                     <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
//                                     <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role Name</th>
//                                     <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
//                                     <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Permissions</th>
//                                     <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
//                                 </tr>
//                                 </thead>
//                                 <tbody>
//                                 {roles.map((role) => (
//                                     <tr key={role.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
//                                         <td style={{ padding: '16px 20px', color: '#6c757d', fontWeight: '500' }}>#{role.id}</td>
//                                         <td style={{ padding: '16px 20px', fontWeight: '600', color: '#212529' }}>{role.name}</td>
//                                         <td style={{ padding: '16px 20px', color: '#6c757d', fontSize: '14px' }}>{role.description || '-'}</td>
//                                         <td style={{ padding: '16px 20px' }}>
//                                             {role.permissions && role.permissions.length > 0 ? (
//                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                                                     {role.permissions.map((pGroup, idx) => (
//                                                         <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
//                                                                 <span
//                                                                     style={{
//                                                                         fontSize: '12px',
//                                                                         fontWeight: '600',
//                                                                         textTransform: 'capitalize',
//                                                                         backgroundColor: '#e7f5ff',
//                                                                         color: '#1971c2',
//                                                                         padding: '2px 8px',
//                                                                         borderRadius: '4px',
//                                                                     }}
//                                                                 >
//                                                                     {pGroup.module}
//                                                                 </span>
//                                                             <span style={{ fontSize: '13px', color: '#495057' }}>
//                                                                     {pGroup.permissions.join(', ')}
//                                                                 </span>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             ) : (
//                                                 <span style={{ color: '#adb5bd', fontSize: '13px', italic: 'true' }}>No permissions assigned</span>
//                                             )}
//                                         </td>
//                                         <td style={{ padding: '16px 20px', textAlign: 'center' }}>
//                                             <button
//                                                 onClick={() => handleOpenEditModal(role)}
//                                                 style={{
//                                                     marginRight: '8px',
//                                                     padding: '6px 14px',
//                                                     border: '1px solid #d0ebff',
//                                                     background: '#e7f5ff',
//                                                     color: '#1971c2',
//                                                     borderRadius: '6px',
//                                                     cursor: 'pointer',
//                                                     fontWeight: '500',
//                                                     fontSize: '13px',
//                                                 }}
//                                             >
//                                                 Edit
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDeleteRole(role.id, role.name)}
//                                                 style={{
//                                                     padding: '6px 14px',
//                                                     border: '1px solid #ffe3e3',
//                                                     background: '#fff5f5',
//                                                     color: '#e03131',
//                                                     borderRadius: '6px',
//                                                     cursor: 'pointer',
//                                                     fontWeight: '500',
//                                                     fontSize: '13px',
//                                                 }}
//                                             >
//                                                 Delete
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//
//                     {/* Modal Popup for Add / Edit */}
//                     {isModalOpen && (
//                         <div
//                             style={{
//                                 position: 'fixed',
//                                 top: 0,
//                                 left: 0,
//                                 right: 0,
//                                 bottom: 0,
//                                 backgroundColor: 'rgba(0, 0, 0, 0.4)',
//                                 backdropFilter: 'blur(3px)',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 zIndex: 1000,
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     backgroundColor: '#fff',
//                                     borderRadius: '12px',
//                                     width: '640px',
//                                     maxHeight: '85vh',
//                                     boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
//                                     display: 'flex',
//                                     flexDirection: 'column',
//                                     overflow: 'hidden',
//                                 }}
//                             >
//                                 {/* Modal Header */}
//                                 <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                     <h3 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>
//                                         {editingRoleId ? 'Edit Role & Permissions' : 'Add New Role'}
//                                     </h3>
//                                     <button
//                                         onClick={() => setIsModalOpen(false)}
//                                         style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#adb5bd' }}
//                                     >
//                                         &times;
//                                     </button>
//                                 </div>
//
//                                 {/* Modal Form Body */}
//                                 <form onSubmit={handleSubmitRole} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
//                                     <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
//                                         <div style={{ marginBottom: '16px' }}>
//                                             <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#343a40', marginBottom: '6px' }}>
//                                                 Role Name <span style={{ color: '#e03131' }}>*</span>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 required
//                                                 placeholder="e.g. Sales Manager"
//                                                 value={roleName}
//                                                 onChange={(e) => setRoleName(e.target.value)}
//                                                 style={{
//                                                     width: '100%',
//                                                     padding: '10px 12px',
//                                                     borderRadius: '6px',
//                                                     border: '1px solid #ced4da',
//                                                     fontSize: '14px',
//                                                     boxSizing: 'border-box',
//                                                     outline: 'none',
//                                                 }}
//                                             />
//                                         </div>
//
//                                         <div style={{ marginBottom: '20px' }}>
//                                             <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#343a40', marginBottom: '6px' }}>
//                                                 Description
//                                             </label>
//                                             <textarea
//                                                 placeholder="Briefly describe what users with this role can do..."
//                                                 value={roleDescription}
//                                                 onChange={(e) => setRoleDescription(e.target.value)}
//                                                 style={{
//                                                     width: '100%',
//                                                     padding: '10px 12px',
//                                                     borderRadius: '6px',
//                                                     border: '1px solid #ced4da',
//                                                     fontSize: '14px',
//                                                     boxSizing: 'border-box',
//                                                     height: '70px',
//                                                     resize: 'vertical',
//                                                     outline: 'none',
//                                                 }}
//                                             />
//                                         </div>
//
//                                         <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#212529' }}>Assign Permissions</h4>
//
//                                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                                             {availablePermissions.map((group) => {
//                                                 const currentModulePerms = selectedPermissions[group.module] || [];
//                                                 const isAllSelected = group.permissions.length > 0 && group.permissions.every((p) => currentModulePerms.includes(p));
//
//                                                 return (
//                                                     <div
//                                                         key={group.module}
//                                                         style={{
//                                                             border: '1px solid #e9ecef',
//                                                             borderRadius: '8px',
//                                                             padding: '14px',
//                                                             backgroundColor: '#f8f9fa',
//                                                         }}
//                                                     >
//                                                         {/* Module Header Checkbox */}
//                                                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '10px' }}>
//                                                             <input
//                                                                 type="checkbox"
//                                                                 id={`module-${group.module}`}
//                                                                 checked={isAllSelected}
//                                                                 onChange={() => handleModuleCheckboxChange(group.module, group.permissions)}
//                                                                 style={{ width: '16px', height: '16px', cursor: 'pointer' }}
//                                                             />
//                                                             <label htmlFor={`module-${group.module}`} style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '14px', color: '#212529', cursor: 'pointer' }}>
//                                                                 {group.module} Module
//                                                             </label>
//                                                             <span style={{ fontSize: '12px', color: '#868e96', marginLeft: 'auto' }}>
//                                                                 ({currentModulePerms.length}/{group.permissions.length} selected)
//                                                             </span>
//                                                         </div>
//
//                                                         {/* Individual Action Checkboxes */}
//                                                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
//                                                             {group.permissions.map((permission) => (
//                                                                 <label
//                                                                     key={permission}
//                                                                     style={{
//                                                                         display: 'flex',
//                                                                         alignItems: 'center',
//                                                                         gap: '6px',
//                                                                         fontSize: '13px',
//                                                                         color: '#495057',
//                                                                         cursor: 'pointer',
//                                                                     }}
//                                                                 >
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         checked={currentModulePerms.includes(permission)}
//                                                                         onChange={() => handleCheckboxChange(group.module, permission)}
//                                                                         style={{ width: '15px', height: '15px', cursor: 'pointer' }}
//                                                                     />
//                                                                     {permission}
//                                                                 </label>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//
//                                     {/* Modal Footer */}
//                                     <div style={{ padding: '16px 24px', borderTop: '1px solid #e9ecef', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8f9fa' }}>
//                                         <button
//                                             type="button"
//                                             onClick={() => setIsModalOpen(false)}
//                                             style={{
//                                                 padding: '8px 16px',
//                                                 border: '1px solid #ced4da',
//                                                 background: '#fff',
//                                                 borderRadius: '6px',
//                                                 cursor: 'pointer',
//                                                 fontSize: '14px',
//                                                 color: '#495057',
//                                             }}
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             disabled={submitting}
//                                             style={{
//                                                 padding: '8px 18px',
//                                                 background: '#0066cc',
//                                                 color: '#fff',
//                                                 border: 'none',
//                                                 borderRadius: '6px',
//                                                 cursor: 'pointer',
//                                                 fontWeight: '600',
//                                                 fontSize: '14px',
//                                                 opacity: submitting ? 0.7 : 1,
//                                             }}
//                                         >
//                                             {submitting ? 'Saving...' : editingRoleId ? 'Update Role' : 'Save Role'}
//                                         </button>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
    fetchRoles,
    fetchAvailablePermissions,
    addRole,
    updateRole,
    deleteRole,
    Role,
    PermissionGroup,
    RolePermission,
} from '../services/permissionService';
import '../styles/RoleAndPermission.css';

export const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Edit/Add Modal State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [roleName, setRoleName] = useState<string>('');
    const [roleDescription, setRoleDescription] = useState<string>('');
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    // View Permissions Modal State
    const [viewingRole, setViewingRole] = useState<Role | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedRoles, fetchedPermissions] = await Promise.all([
                fetchRoles(),
                fetchAvailablePermissions(),
            ]);
            setRoles(fetchedRoles);
            setAvailablePermissions(fetchedPermissions);
        } catch (err) {
            console.error('Failed to load access control data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingRoleId(null);
        setRoleName('');
        setRoleDescription('');
        setSelectedPermissions({});
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
        setIsModalOpen(true);
    };

    const handleDeleteRole = async (roleId: number, roleName: string) => {
        if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            try {
                await deleteRole(roleId);
                await loadData();
            } catch (err) {
                console.error('Failed to delete role', err);
            }
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
            console.error('Failed to save role', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Helper: calculate total count of assigned permissions for a role
    const getTotalPermissionCount = (role: Role) => {
        if (!role.permissions) return 0;
        return role.permissions.reduce((acc, pGroup) => acc + pGroup.permissions.length, 0);
    };

    return (
        <div className="role-permission-page-wrapper">
            <Sidebar />
            <div className="role-permission-container">
                <Navbar />

                <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'inherit' }}>
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                            background: '#ffffff',
                            padding: '20px 24px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}
                    >
                        <div>
                            <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1d20' }}>Role & Permission Management</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6c757d' }}>Manage user access roles and module action privileges</p>
                        </div>
                        <button
                            onClick={handleOpenAddModal}
                            style={{
                                backgroundColor: '#0066cc',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                boxShadow: '0 2px 4px rgba(0,102,204,0.2)',
                            }}
                        >
                            + Add New Role
                        </button>
                    </div>

                    {/* Table View */}
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                        }}
                    >
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                Loading roles and permissions...
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                                    <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                                    <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Role Name</th>
                                    <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Description</th>
                                    <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Assigned Permissions</th>
                                    <th style={{ padding: '16px 20px', color: '#495057', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {roles.map((role) => {
                                    const permCount = getTotalPermissionCount(role);
                                    return (
                                        <tr key={role.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                            <td style={{ padding: '16px 20px', color: '#6c757d', fontWeight: '500' }}>#{role.id}</td>
                                            <td style={{ padding: '16px 20px', fontWeight: '600', color: '#212529' }}>{role.name}</td>
                                            <td style={{ padding: '16px 20px', color: '#6c757d', fontSize: '14px' }}>{role.description || '-'}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span
                                                            style={{
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                color: permCount > 0 ? '#1971c2' : '#868e96',
                                                                backgroundColor: permCount > 0 ? '#e7f5ff' : '#f1f3f5',
                                                                padding: '4px 10px',
                                                                borderRadius: '12px',
                                                            }}
                                                        >
                                                            {permCount} {permCount === 1 ? 'Permission' : 'Permissions'}
                                                        </span>
                                                    <button
                                                        onClick={() => setViewingRole(role)}
                                                        style={{
                                                            background: '#f8f9fa',
                                                            border: '1px solid #ced4da',
                                                            borderRadius: '6px',
                                                            padding: '5px 10px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            color: '#495057',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        👁 View
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleOpenEditModal(role)}
                                                    style={{
                                                        marginRight: '8px',
                                                        padding: '6px 14px',
                                                        border: '1px solid #d0ebff',
                                                        background: '#e7f5ff',
                                                        color: '#1971c2',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRole(role.id, role.name)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        border: '1px solid #ffe3e3',
                                                        background: '#fff5f5',
                                                        color: '#e03131',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* View Permissions Popup Modal */}
                    {viewingRole && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                backdropFilter: 'blur(3px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    width: '560px',
                                    maxHeight: '80vh',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>
                                            Permissions: <span style={{ color: '#0066cc' }}>{viewingRole.name}</span>
                                        </h3>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6c757d' }}>
                                            Total {getTotalPermissionCount(viewingRole)} permissions assigned
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setViewingRole(null)}
                                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#adb5bd' }}
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {viewingRole.permissions && viewingRole.permissions.length > 0 ? (
                                        viewingRole.permissions.map((pGroup, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    border: '1px solid #e9ecef',
                                                    borderRadius: '8px',
                                                    padding: '14px',
                                                    backgroundColor: '#f8f9fa',
                                                }}
                                            >
                                                <div style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize', color: '#212529', marginBottom: '10px' }}>
                                                    📁 {pGroup.module} Module
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {pGroup.permissions.map((perm) => (
                                                        <span
                                                            key={perm}
                                                            style={{
                                                                backgroundColor: '#e7f5ff',
                                                                color: '#1971c2',
                                                                border: '1px solid #d0ebff',
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                            }}
                                                        >
                                                            ✓ {perm}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '30px', color: '#adb5bd' }}>
                                            No permissions assigned to this role.
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '16px 24px', borderTop: '1px solid #e9ecef', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8f9fa' }}>
                                    <button
                                        onClick={() => setViewingRole(null)}
                                        style={{
                                            padding: '8px 18px',
                                            background: '#0066cc',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit/Add Role Modal */}
                    {isModalOpen && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                backdropFilter: 'blur(3px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    width: '640px',
                                    maxHeight: '85vh',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>
                                        {editingRoleId ? 'Edit Role & Permissions' : 'Add New Role'}
                                    </h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#adb5bd' }}
                                    >
                                        &times;
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitRole} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                    <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#343a40', marginBottom: '6px' }}>
                                                Role Name <span style={{ color: '#e03131' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Sales Manager"
                                                value={roleName}
                                                onChange={(e) => setRoleName(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ced4da',
                                                    fontSize: '14px',
                                                    boxSizing: 'border-box',
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#343a40', marginBottom: '6px' }}>
                                                Description
                                            </label>
                                            <textarea
                                                placeholder="Briefly describe what users with this role can do..."
                                                value={roleDescription}
                                                onChange={(e) => setRoleDescription(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ced4da',
                                                    fontSize: '14px',
                                                    boxSizing: 'border-box',
                                                    height: '70px',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>

                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#212529' }}>Assign Permissions</h4>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {availablePermissions.map((group) => {
                                                const currentModulePerms = selectedPermissions[group.module] || [];
                                                const isAllSelected = group.permissions.length > 0 && group.permissions.every((p) => currentModulePerms.includes(p));

                                                return (
                                                    <div
                                                        key={group.module}
                                                        style={{
                                                            border: '1px solid #e9ecef',
                                                            borderRadius: '8px',
                                                            padding: '14px',
                                                            backgroundColor: '#f8f9fa',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '10px' }}>
                                                            <input
                                                                type="checkbox"
                                                                id={`module-${group.module}`}
                                                                checked={isAllSelected}
                                                                onChange={() => handleModuleCheckboxChange(group.module, group.permissions)}
                                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                            />
                                                            <label htmlFor={`module-${group.module}`} style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '14px', color: '#212529', cursor: 'pointer' }}>
                                                                {group.module} Module
                                                            </label>
                                                            <span style={{ fontSize: '12px', color: '#868e96', marginLeft: 'auto' }}>
                                                                ({currentModulePerms.length}/{group.permissions.length} selected)
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
                                                            {group.permissions.map((permission) => (
                                                                <label
                                                                    key={permission}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        fontSize: '13px',
                                                                        color: '#495057',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={currentModulePerms.includes(permission)}
                                                                        onChange={() => handleCheckboxChange(group.module, permission)}
                                                                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                                                                    />
                                                                    {permission}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ padding: '16px 24px', borderTop: '1px solid #e9ecef', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8f9fa' }}>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            style={{
                                                padding: '8px 16px',
                                                border: '1px solid #ced4da',
                                                background: '#fff',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#495057',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            style={{
                                                padding: '8px 18px',
                                                background: '#0066cc',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                opacity: submitting ? 0.7 : 1,
                                            }}
                                        >
                                            {submitting ? 'Saving...' : editingRoleId ? 'Update Role' : 'Save Role'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};