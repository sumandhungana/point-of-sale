
import { apiService } from "@/infrastructure/utils/ApiService";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PermissionGroup {
  module: string;
  permissions: string[];
}

export interface RolePermission {
  module: string;
  permissions: string[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  status: string;
  permissions: RolePermission[];
}

export interface AddRoleRequest {
  name: string;
  description: string;
  permissions: RolePermission[];
}

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

// Fetch available permission modules and actions for checkboxes
export async function fetchAvailablePermissions(): Promise<PermissionGroup[]> {
  const res = await apiService.get<RestResponse<PermissionGroup[]>>(
      'api/v1/permission/list',
      { headers: getAuthHeaders() }
  );
  return res?.response?.data || [];
}

// Fetch all roles with their assigned permissions
export async function fetchRoles(): Promise<Role[]> {
  const res = await apiService.get<RestResponse<Role[]>>(
      'api/v1/role/list',
      { headers: getAuthHeaders() }
  );
  return res?.response?.data || [];
}

// Submit custom role with selected permissions
export async function addRole(payload: AddRoleRequest): Promise<RestResponse<{
    id: number;
    message: string
}> | undefined> {
  const res = await apiService.post<RestResponse<{ id: number; message: string }>>(
      'api/v1/role/add',
      payload,
      { headers: getAuthHeaders() }
  );
  return res?.response;
}
export interface UpdateRoleRequest {
  id: number;
  name: string;
  description: string;
  permissions: RolePermission[];
}

// Update existing role
export async function updateRole(payload: UpdateRoleRequest): Promise<RestResponse<{ message: string }> | undefined> {
  const res = await apiService.put<RestResponse<{ message: string }>>(
      `api/v1/role/update/${payload.id}`,
      payload,
      { headers: getAuthHeaders() }
  );
  return res?.response;
}

// Delete role by ID
export async function deleteRole(roleId: number): Promise<RestResponse<{ message: string }> | undefined> {
  const res = await apiService.delete<RestResponse<{ message: string }>>(
      `api/v1/role/delete/${roleId}`,
      { headers: getAuthHeaders() }
  );
  return res?.response;
}