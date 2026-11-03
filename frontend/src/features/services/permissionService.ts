
import { apiService } from "@/infrastructure/utils/ApiService";
import {toast} from "react-toastify";

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
  roleOrder?: number;
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

// Fetch all roles with their assigned permissions and role orders
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
  if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
    toast("Role Cannot Added");
    throw new Error("Role Cannot Added");
  }
  return res?.response;
}
export interface UpdateRoleRequest {
  id: number;
  name: string;
  description: string;
  permissions: RolePermission[];
}

export async function updateRole(payload: UpdateRoleRequest): Promise<RestResponse<{
  id: number;
  message: string
}> | undefined> {
  const res = await apiService.put<RestResponse<{ id: number; message: string }>>(
      `api/v1/role/${payload.id}`,
      payload,
      { headers: getAuthHeaders() }
  );
  if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
    toast("Role Cannot Updated");
    throw new Error("Role Cannot Updated");
  }
  return res?.response;
}

export async function deleteRole(roleId: number): Promise<void> {
  const res = await apiService.delete<RestResponse<void>>(
      `api/v1/role/${roleId}`,
      { headers: getAuthHeaders() }
  );
  if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
    toast("Role Cannot Deleted");
    throw new Error("Role Cannot Deleted");
  }
}
